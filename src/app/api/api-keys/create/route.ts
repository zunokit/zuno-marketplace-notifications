import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { hashPassword } from 'better-auth/crypto'
import { nanoid } from 'nanoid'
import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'

const CreateApiKeySchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).min(1),
  expiresInDays: z.number().int().positive().optional(),
  createdBy: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = CreateApiKeySchema.parse(body)

    // Generate API key
    const apiKey = `zuno_${nanoid(32)}`
    const keyPrefix = apiKey.substring(0, 8)
    const keyHash = await hashPassword(apiKey)

    // Calculate expiry date
    let expiresAt: Date | null = null
    if (validated.expiresInDays) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + validated.expiresInDays)
    }

    // Create API key in database
    const createdKey = await prisma.apiKey.create({
      data: {
        name: validated.name,
        keyHash,
        keyPrefix,
        scopes: validated.scopes,
        expiresAt,
        createdBy: validated.createdBy,
        organization: {
          connect: { id: validated.organizationId },
        },
      },
    })

    logger.info('API key created', {
      keyId: createdKey.id,
      organizationId: validated.organizationId,
      name: validated.name,
    })

    return NextResponse.json(
      {
        id: createdKey.id,
        name: createdKey.name,
        keyPrefix: createdKey.keyPrefix,
        apiKey, // Only returned once!
        scopes: createdKey.scopes,
        expiresAt: createdKey.expiresAt,
        organizationId: createdKey.organizationId,
        createdAt: createdKey.createdAt,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Error creating API key', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    )
  }
}
