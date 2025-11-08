import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { SendNotificationUseCase } from '@/core/use-cases/notifications/send-notification.use-case'
import { logger } from '@/lib/logger/logger'

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
  templateSlug: z.string().optional(),
  payload: z.record(z.unknown()),
  idempotencyKey: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  scheduledAt: z.string().datetime().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // For now, use a default org ID until we implement full authentication
    const defaultOrgId = 'default-org-id'

    // Validate request body
    const body = await request.json()
    const validated = SendNotificationSchema.parse(body)

    // Execute use case
    const useCase = new SendNotificationUseCase()
    const notification = await useCase.execute({
      organizationId: defaultOrgId,
      userId: validated.userId,
      type: validated.type,
      channel: validated.channel,
      templateId: validated.templateId,
      templateSlug: validated.templateSlug,
      priority: validated.priority,
      payload: validated.payload,
      idempotencyKey: validated.idempotencyKey,
      scheduledAt: validated.scheduledAt
        ? new Date(validated.scheduledAt)
        : undefined,
    })

    return NextResponse.json(
      {
        id: notification.id,
        status: notification.status,
        correlationId: notification.correlationId,
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
