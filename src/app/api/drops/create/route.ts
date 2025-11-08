import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/database/prisma'
import { DropNotificationService } from '@/core/services/drop-notification.service'
import { logger } from '@/lib/logger/logger'
import { z } from 'zod'

const createDropSchema = z.object({
  organizationId: z.string(),
  collectionId: z.string(),
  dropName: z.string(),
  description: z.string(),
  startTime: z.string(),
  totalSupply: z.number().int().positive().optional(),
  pricePerNFT: z.number().positive().optional(),
  isWhitelistOnly: z.boolean().default(false),
  imageUrl: z.string().url().optional(),
  mintUrl: z.string().url().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createDropSchema.parse(body)

    // Create drop in database
    const drop = await prisma.drop.create({
      data: {
        organizationId: validatedData.organizationId,
        collectionId: validatedData.collectionId,
        name: validatedData.dropName,
        description: validatedData.description,
        startTime: new Date(validatedData.startTime),
        totalSupply: validatedData.totalSupply,
        pricePerNFT: validatedData.pricePerNFT,
        isWhitelistOnly: validatedData.isWhitelistOnly,
        status: 'ANNOUNCED',
        imageUrl: validatedData.imageUrl,
        mintUrl: validatedData.mintUrl,
      },
    })

    // Send drop announcement notifications
    const dropService = new DropNotificationService()
    await dropService.announceDrop({
      dropId: drop.id,
      organizationId: validatedData.organizationId,
      collectionId: validatedData.collectionId,
      dropName: validatedData.dropName,
      description: validatedData.description,
      startTime: validatedData.startTime,
      totalSupply: validatedData.totalSupply,
      pricePerNFT: validatedData.pricePerNFT,
      imageUrl: validatedData.imageUrl,
      mintUrl: validatedData.mintUrl,
    })

    logger.info('Drop created and announced', {
      dropId: drop.id,
      dropName: validatedData.dropName,
      startTime: validatedData.startTime,
    })

    return NextResponse.json({
      success: true,
      data: drop,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    logger.error('Error creating drop', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create drop',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
