import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { z } from 'zod'

import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'

const SendNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum([
    'WELCOME',
    'AUCTION_WON',
    'BID_PLACED',
    'AUCTION_STARTED',
    'AUCTION_ENDING_SOON',
  ]),
  channel: z.enum(['EMAIL', 'WEBSOCKET']),
  templateId: z.string().uuid().optional(),
  payload: z.record(z.unknown()),
  idempotencyKey: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Generate correlation ID for tracing
    const correlationId = nanoid()

    // 2. Validate request
    const body = await request.json()
    const validated = SendNotificationSchema.parse(body)

    logger.info('Creating notification', {
      correlationId,
      type: validated.type,
    })

    // 3. Create notification (basic version without auth for now)
    // TODO: Add authentication in Phase 1 completion
    const notification = await prisma.notification.create({
      data: {
        id: nanoid(),
        organizationId: '00000000-0000-0000-0000-000000000000', // Placeholder
        userId: validated.userId,
        type: validated.type,
        channel: validated.channel,
        templateId: validated.templateId,
        status: 'PENDING',
        priority: 'NORMAL',
        payload: validated.payload,
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

    return NextResponse.json({ id: notification.id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }

    logger.error('Error creating notification', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
