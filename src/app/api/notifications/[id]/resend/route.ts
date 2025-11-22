import { NextRequest, NextResponse } from 'next/server'

import { OutboxRepository } from '@/infrastructure/outbox/outbox.repository'
import { logger } from '@/lib/logger/logger'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const outboxRepo = new OutboxRepository()

    // Reset notification status and create new outbox entry
    const result = await outboxRepo.createWithNotification(
      {
        id,
        organization: { connect: { id: 'default-org-id' } },
        user: { connect: { id: 'default-user-id' } },
        type: 'CUSTOM',
        channel: 'EMAIL',
        status: 'PENDING',
        priority: 'NORMAL',
        payload: {},
        retryCount: 0,
        maxRetries: 5,
      },
      {
        channel: 'EMAIL',
        payload: {},
        scheduledAt: new Date(),
      }
    )

    logger.info('Notification resend initiated', { notificationId: id })

    return NextResponse.json(result.notification)
  } catch (error) {
    logger.error('Error resending notification', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
