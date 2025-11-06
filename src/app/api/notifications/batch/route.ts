import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { SendNotificationUseCase } from '@/core/use-cases/notifications/send-notification.use-case'
import { logger } from '@/lib/logger/logger'

const BatchSendSchema = z.object({
  notifications: z.array(
    z.object({
      userId: z.string().uuid(),
      type: z.enum([
        'WELCOME',
        'AUCTION_WON',
        'BID_PLACED',
        'EMAIL_VERIFICATION',
        'CUSTOM',
      ]),
      channel: z.enum(['EMAIL', 'WEBSOCKET', 'PUSH', 'SMS']),
      templateSlug: z.string().optional(),
      payload: z.record(z.unknown()),
      priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
    })
  ),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = BatchSendSchema.parse(body)

    const defaultOrgId = 'default-org-id'
    const useCase = new SendNotificationUseCase()

    const results = await Promise.allSettled(
      validated.notifications.map((notif) =>
        useCase.execute({
          organizationId: defaultOrgId,
          userId: notif.userId,
          type: notif.type,
          channel: notif.channel,
          templateSlug: notif.templateSlug,
          priority: notif.priority,
          payload: notif.payload,
        })
      )
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    logger.info('Batch send completed', { successful, failed })

    return NextResponse.json({
      total: validated.notifications.length,
      successful,
      failed,
      results: results.map((r, i) => ({
        index: i,
        status: r.status,
        id: r.status === 'fulfilled' ? r.value.id : null,
        error: r.status === 'rejected' ? r.reason.message : null,
      })),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Error in batch send', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
