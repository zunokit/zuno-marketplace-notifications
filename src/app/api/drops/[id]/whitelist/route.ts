import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/database/prisma'
import { DropNotificationService } from '@/core/services/drop-notification.service'
import { logger } from '@/lib/logger/logger'
import { z } from 'zod'

const addToWhitelistSchema = z.object({
  userId: z.string(),
  organizationId: z.string(),
  spots: z.number().int().positive().default(1),
})

const approveWhitelistSchema = z.object({
  whitelistEntryId: z.string(),
  organizationId: z.string(),
})

// Add user to whitelist
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: dropId } = params
    const body = await request.json()
    const validatedData = addToWhitelistSchema.parse(body)

    // Check if drop exists
    const drop = await prisma.drop.findUnique({
      where: { id: dropId },
    })

    if (!drop) {
      return NextResponse.json(
        {
          success: false,
          error: 'Drop not found',
        },
        { status: 404 }
      )
    }

    // Check if user already in whitelist
    const existing = await prisma.whitelistEntry.findFirst({
      where: {
        dropId,
        userId: validatedData.userId,
      },
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'User already in whitelist',
        },
        { status: 400 }
      )
    }

    // Add to whitelist
    const whitelistEntry = await prisma.whitelistEntry.create({
      data: {
        dropId,
        userId: validatedData.userId,
        organizationId: validatedData.organizationId,
        spots: validatedData.spots,
        isApproved: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    logger.info('User added to whitelist', {
      dropId,
      userId: validatedData.userId,
      whitelistEntryId: whitelistEntry.id,
    })

    return NextResponse.json({
      success: true,
      data: whitelistEntry,
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

    logger.error('Error adding to whitelist', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add to whitelist',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Approve whitelist entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: dropId } = params
    const body = await request.json()
    const validatedData = approveWhitelistSchema.parse(body)

    // Get drop details
    const drop = await prisma.drop.findUnique({
      where: { id: dropId },
    })

    if (!drop) {
      return NextResponse.json(
        {
          success: false,
          error: 'Drop not found',
        },
        { status: 404 }
      )
    }

    // Approve whitelist entry
    const whitelistEntry = await prisma.whitelistEntry.update({
      where: { id: validatedData.whitelistEntryId },
      data: {
        isApproved: true,
      },
      include: {
        user: true,
      },
    })

    // Send notification to user
    const dropService = new DropNotificationService()
    await dropService.notifyWhitelistApproved({
      userId: whitelistEntry.userId,
      organizationId: validatedData.organizationId,
      dropId,
      dropName: drop.name,
      spots: whitelistEntry.spots,
      startTime: drop.startTime.toISOString(),
      mintUrl: drop.mintUrl || undefined,
    })

    logger.info('Whitelist entry approved', {
      dropId,
      whitelistEntryId: validatedData.whitelistEntryId,
      userId: whitelistEntry.userId,
    })

    return NextResponse.json({
      success: true,
      data: whitelistEntry,
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

    logger.error('Error approving whitelist entry', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to approve whitelist entry',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Get whitelist for drop
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: dropId } = params

    const whitelist = await prisma.whitelistEntry.findMany({
      where: { dropId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: whitelist,
      count: whitelist.length,
    })
  } catch (error) {
    logger.error('Error fetching whitelist', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch whitelist',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
