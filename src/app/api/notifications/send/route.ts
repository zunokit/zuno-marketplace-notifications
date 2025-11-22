import { NextResponse } from 'next/server'
import { z } from 'zod'

import { SendNotificationUseCase } from '@/core/use-cases/notifications/send-notification.use-case'
import { logger } from '@/lib/logger/logger'
import { withAuth } from '@/lib/api/route-handler'
import { NotificationType, Channel, Priority } from '@/infrastructure/database/generated'

const SendNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.nativeEnum(NotificationType),
  channel: z.nativeEnum(Channel),
  templateId: z.string().uuid().optional(),
  templateSlug: z.string().optional(),
  payload: z.record(z.unknown()),
  idempotencyKey: z.string().optional(),
  priority: z.nativeEnum(Priority).default('NORMAL'),
  scheduledAt: z.string().datetime().optional(),
})

/**
 * Send a notification
 *
 * @route POST /api/notifications/send
 * @access Authenticated users
 *
 * @example
 * ```json
 * {
 *   "userId": "user-uuid",
 *   "type": "AUCTION_WON",
 *   "channel": "EMAIL",
 *   "templateSlug": "auction-won",
 *   "payload": {
 *     "auctionTitle": "CryptoPunk #123",
 *     "winningBid": "10 ETH"
 *   }
 * }
 * ```
 */
export const POST = withAuth(async (request, { user, organization }) => {
  try {
    // Validate request body
    const body = await request.json()
    const validated = SendNotificationSchema.parse(body)

    logger.info('Creating notification', {
      userId: user.id,
      organizationId: organization.id,
      type: validated.type,
      channel: validated.channel,
    })

    // Execute use case with authenticated organization
    const useCase = new SendNotificationUseCase()
    const notification = await useCase.execute({
      organizationId: organization.id, // ✅ From authenticated context
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
})
