import type { Channel, NotificationType, Priority } from '@prisma/client'
import { nanoid } from 'nanoid'

import { OutboxRepository } from '@/infrastructure/outbox/outbox.repository'
import { TemplateService } from '@/infrastructure/templates/template.service'
import { logger } from '@/lib/logger/logger'

export interface SendNotificationInput {
  organizationId: string
  userId: string
  type: NotificationType
  channel: Channel
  templateId?: string
  templateSlug?: string
  priority?: Priority
  payload: Record<string, unknown>
  idempotencyKey?: string
  scheduledAt?: Date
}

export class SendNotificationUseCase {
  private outboxRepo: OutboxRepository
  private templateService: TemplateService

  constructor() {
    this.outboxRepo = new OutboxRepository()
    this.templateService = new TemplateService()
  }

  async execute(input: SendNotificationInput) {
    const correlationId = nanoid()

    logger.info('Sending notification', {
      correlationId,
      type: input.type,
      channel: input.channel,
    })

    // Render template if provided
    let emailPayload = input.payload
    if (input.templateId || input.templateSlug) {
      try {
        const rendered = input.templateId
          ? await this.templateService.renderTemplate(input.templateId, input.payload)
          : await this.templateService.renderTemplateBySlug(input.templateSlug!, input.payload)

        emailPayload = {
          ...input.payload,
          subject: rendered.subject,
          body: rendered.body,
        }
      } catch (error) {
        logger.error('Template rendering failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          correlationId,
        })
        throw error
      }
    }

    // Create notification with outbox (transactional)
    const result = await this.outboxRepo.createWithNotification(
      {
        id: nanoid(),
        organization: {
          connect: { id: input.organizationId },
        },
        user: {
          connect: { id: input.userId },
        },
        type: input.type,
        channel: input.channel,
        template: input.templateId
          ? { connect: { id: input.templateId } }
          : undefined,
        status: 'PENDING',
        priority: input.priority || 'NORMAL',
        payload: emailPayload as any,
        idempotencyKey: input.idempotencyKey,
        correlationId,
        retryCount: 0,
        maxRetries: 5,
        scheduledAt: input.scheduledAt,
      },
      {
        channel: input.channel,
        payload: emailPayload as any,
        scheduledAt: input.scheduledAt || new Date(),
      }
    )

    logger.info('Notification created with outbox', {
      correlationId,
      notificationId: result.notification.id,
      outboxId: result.outbox.id,
    })

    return result.notification
  }
}
