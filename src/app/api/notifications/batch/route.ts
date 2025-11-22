import { NextResponse } from 'next/server'
import { z } from 'zod'

import { SendNotificationUseCase } from '@/core/use-cases/notifications/send-notification.use-case'
import { logger } from '@/lib/logger/logger'
import { withAuth } from '@/lib/api/route-handler'
import { NotificationType, Channel, Priority } from '@/infrastructure/database/generated'

const BatchSendSchema = z.object({
  notifications: z.array(
    z.object({
      userId: z.string().uuid(),
      type: z.nativeEnum(NotificationType),
      channel: z.nativeEnum(Channel),
      templateSlug: z.string().optional(),
      payload: z.record(z.unknown()),
      priority: z.nativeEnum(Priority).default('NORMAL'),
    })
  ),
})

/**
 * Send multiple notifications in batch
 *
 * @route POST /api/notifications/batch
 * @access Authenticated users
 *
 * @example
 * ```json
 * {
 *   "notifications": [
 *     {
 *       "userId": "user-1",
 *       "type": "AUCTION_WON",
 *       "channel": "EMAIL",
 *       "payload": { "auctionTitle": "CryptoPunk #123" }
 *     },
 *     {
 *       "userId": "user-2",
 *       "type": "BID_PLACED",
 *       "channel": "WEBSOCKET",
 *       "payload": { "bidAmount": "5 ETH" }
 *     }
 *   ]
 * }
 * ```
 */
export const POST = withAuth(async (request, { user, organization }) => {
  try {
    const body = await request.json()
    const validated = BatchSendSchema.parse(body)

    logger.info('Processing batch notification send', {
      userId: user.id,
      organizationId: organization.id,
      count: validated.notifications.length,
    })

    const useCase = new SendNotificationUseCase()

    const results = await Promise.allSettled(
      validated.notifications.map((notif) =>
        useCase.execute({
          organizationId: organization.id, // ✅ From authenticated context
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

    logger.info('Batch send completed', {
      organizationId: organization.id,
      total: validated.notifications.length,
      successful,
      failed,
    })

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
})
