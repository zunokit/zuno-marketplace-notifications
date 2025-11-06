import { Channel, NotificationType, Priority } from '@prisma/client'
import { nanoid } from 'nanoid'

import { Notification } from '@/core/domain/entities/notification.entity'
import {
  NotificationRepository,
  CreateNotificationDto,
} from '@/infrastructure/repositories/notification.repository'
import { logger } from '@/lib/logger/logger'

export interface SendNotificationInput {
  organizationId: string
  userId: string
  type: NotificationType
  channel: Channel
  templateId?: string
  priority?: Priority
  payload: Record<string, unknown>
  idempotencyKey?: string
  metadata?: Record<string, unknown>
}

export interface SendNotificationOutput {
  notificationId: string
  status: string
  correlationId: string
}

export class SendNotificationUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute(
    input: SendNotificationInput
  ): Promise<SendNotificationOutput> {
    const correlationId = nanoid()

    try {
      logger.info('SendNotificationUseCase: Starting', {
        correlationId,
        type: input.type,
        channel: input.channel,
      })

      // Check for duplicate using idempotency key
      if (input.idempotencyKey) {
        const existing = await this.notificationRepository.findByIdempotencyKey(
          input.idempotencyKey
        )
        if (existing) {
          logger.info('SendNotificationUseCase: Duplicate detected', {
            correlationId,
            existingId: existing.id,
          })
          return {
            notificationId: existing.id,
            status: existing.status,
            correlationId,
          }
        }
      }

      // Create notification
      const notificationData: CreateNotificationDto = {
        id: nanoid(),
        organizationId: input.organizationId,
        userId: input.userId,
        type: input.type,
        channel: input.channel,
        templateId: input.templateId,
        status: 'PENDING',
        priority: input.priority || 'NORMAL',
        payload: input.payload,
        idempotencyKey: input.idempotencyKey,
        correlationId,
        metadata: input.metadata,
        retryCount: 0,
        maxRetries: 5,
      }

      const notification = await this.notificationRepository.create(
        notificationData
      )

      logger.info('SendNotificationUseCase: Notification created', {
        correlationId,
        notificationId: notification.id,
      })

      // TODO: Add to outbox for processing (Phase 2)

      return {
        notificationId: notification.id,
        status: notification.status,
        correlationId,
      }
    } catch (error) {
      logger.error('SendNotificationUseCase: Error', {
        correlationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }
}
