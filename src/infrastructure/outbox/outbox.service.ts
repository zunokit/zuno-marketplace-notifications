import { nanoid } from 'nanoid'

import {
  OutboxRepository,
  CreateOutboxDto,
} from './outbox.repository'
import { NotificationRepository } from '@/infrastructure/repositories/notification.repository'
import { ChannelRouter } from '@/infrastructure/channels/channel-router'
import { NotificationPayload } from '@/infrastructure/channels/channel.interface'
import { logger } from '@/lib/logger/logger'

export class OutboxService {
  constructor(
    private outboxRepository: OutboxRepository,
    private notificationRepository: NotificationRepository,
    private channelRouter: ChannelRouter
  ) {}

  async addToOutbox(notificationId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(
      notificationId
    )

    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`)
    }

    const outboxData: CreateOutboxDto = {
      id: nanoid(),
      notificationId: notification.id,
      channel: notification.channel,
      payload: notification.payload,
      status: 'PENDING',
      scheduledAt: notification.scheduledAt || new Date(),
    }

    await this.outboxRepository.create(outboxData)

    logger.info('OutboxService: Added to outbox', {
      notificationId,
      channel: notification.channel,
    })
  }

  async processOutboxMessage(outboxId: string): Promise<void> {
    const outbox = await this.outboxRepository.findById(outboxId)

    if (!outbox) {
      throw new Error(`Outbox message ${outboxId} not found`)
    }

    const { notification } = outbox

    try {
      logger.info('OutboxService: Processing message', {
        outboxId,
        notificationId: notification.id,
        channel: outbox.channel,
      })

      // Get channel
      const channel = this.channelRouter.getChannel(outbox.channel)

      // Prepare payload
      const payload: NotificationPayload = {
        to: (notification.payload as any).to || notification.userId,
        subject: (notification.payload as any).subject,
        body: (notification.payload as any).body || '',
        bodyText: (notification.payload as any).bodyText,
        metadata: notification.metadata as Record<string, unknown>,
      }

      // Send via channel
      const result = await channel.send(payload)

      if (result.success) {
        // Mark as processed
        await this.outboxRepository.markAsProcessed(outboxId)

        // Update notification status
        await this.notificationRepository.update(notification.id, {
          status: 'SENT',
          sentAt: new Date(),
        })

        logger.info('OutboxService: Message processed successfully', {
          outboxId,
          notificationId: notification.id,
          duration: result.duration,
        })
      } else {
        // Calculate next retry
        const nextRetryAt = this.calculateNextRetry(outbox.retryCount)

        await this.outboxRepository.markAsFailed(
          outboxId,
          result.error || 'Unknown error',
          nextRetryAt
        )

        await this.notificationRepository.update(notification.id, {
          status: 'FAILED',
          failedAt: new Date(),
          lastError: result.error,
          retryCount: notification.retryCount + 1,
        })

        logger.warn('OutboxService: Message failed', {
          outboxId,
          notificationId: notification.id,
          error: result.error,
          nextRetryAt,
        })
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'

      logger.error('OutboxService: Exception', {
        outboxId,
        error: errorMessage,
      })

      const nextRetryAt = this.calculateNextRetry(outbox.retryCount)
      await this.outboxRepository.markAsFailed(outboxId, errorMessage, nextRetryAt)
    }
  }

  private calculateNextRetry(retryCount: number): Date {
    // Exponential backoff: 2^retryCount minutes
    const delayMinutes = Math.pow(2, retryCount)
    const nextRetry = new Date()
    nextRetry.setMinutes(nextRetry.getMinutes() + delayMinutes)
    return nextRetry
  }
}
