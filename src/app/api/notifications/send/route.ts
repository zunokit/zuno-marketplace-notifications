import type { Prisma } from '@prisma/client'
import { nanoid } from 'nanoid'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { logger } from '@/lib/logger/logger'
import { prisma } from '@/infrastructure/database/prisma'

const SendNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum([
    'WELCOME',
    'AUCTION_WON',
    'BID_PLACED',
    'EMAIL_VERIFICATION',
    'CUSTOM',
  ]),
  channel: z.enum(['EMAIL', 'WEBSOCKET', 'PUSH', 'SMS']),
  templateId: z.string().uuid().optional(),
  payload: z.record(z.unknown()),
  idempotencyKey: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
})

export async function POST(request: NextRequest) {
  try {
    // For now, use a default org ID until we implement authentication
    const defaultOrgId = 'default-org-id'
    const correlationId = nanoid()

    // Validate request body
    const body = await request.json()
    const validated = SendNotificationSchema.parse(body)

    logger.info('Creating notification', {
      correlationId,
      type: validated.type,
      channel: validated.channel,
    })

    // Create notification (basic version without outbox pattern for now)
    const notification = await prisma.notification.create({
      data: {
        id: nanoid(),
        organizationId: defaultOrgId,
        userId: validated.userId,
        type: validated.type,
        channel: validated.channel,
        templateId: validated.templateId,
        status: 'PENDING',
        priority: validated.priority,
        payload: validated.payload as Prisma.JsonObject,
        idempotencyKey: validated.idempotencyKey,
        correlationId,
        retryCount: 0,
        maxRetries: 5,
      },
    })

    logger.info('Notification created', {
      correlationId,
      notificationId: notification.id,
    })

    return NextResponse.json(
      {
        id: notification.id,
        status: notification.status,
        correlationId,
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

    logger.error('Error creating notification', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
