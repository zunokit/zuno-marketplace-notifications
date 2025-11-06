import { nanoid } from 'nanoid'
import { prisma } from '@/infrastructure/database/prisma'
import { Prisma } from '@prisma/client'
import { EmailChannel } from '@/infrastructure/channels/email/email-channel'
import { WebSocketProvider } from '@/infrastructure/channels/websocket/websocket-provider'
import { logger } from '@/lib/logger/logger'

export class RetryWorker {
  private workerId: string
  private isRunning: boolean = false
  private emailChannel: EmailChannel
  private websocketProvider: WebSocketProvider

  constructor() {
    this.workerId = `retry-${nanoid(8)}`
    this.emailChannel = new EmailChannel()
    this.websocketProvider = new WebSocketProvider()
  }

  async start(intervalMs: number = 30000) {
    if (this.isRunning) {
      logger.warn('Retry worker already running')
      return
    }

    this.isRunning = true
    logger.info('Retry worker started', { workerId: this.workerId })

    while (this.isRunning) {
      try {
        await this.processFailedNotifications()
      } catch (error) {
        logger.error('Error in retry worker', {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }

      await this.sleep(intervalMs)
    }
  }

  stop() {
    this.isRunning = false
    logger.info('Retry worker stopped', { workerId: this.workerId })
  }

  private async processFailedNotifications() {
    const now = new Date()

    // Find failed notifications that are ready for retry
    const failedNotifications = await prisma.notification.findMany({
      where: {
        status: 'FAILED',
        nextRetryAt: {
          lte: now,
        },
        retryCount: {
          lt: 5,
        },
      },
      take: 50,
      orderBy: {
        nextRetryAt: 'asc',
      },
      include: {
        organization: true,
        user: true,
      },
    })

    if (failedNotifications.length === 0) {
      return
    }

    logger.info('Processing failed notifications for retry', {
      count: failedNotifications.length,
      workerId: this.workerId,
    })

    for (const notification of failedNotifications) {
      try {
        await this.retryNotification(notification)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'

        logger.error('Failed to retry notification', {
          notificationId: notification.id,
          error: errorMessage,
        })

        // Calculate next retry time with exponential backoff
        const nextRetryAt = this.calculateNextRetry(notification.retryCount + 1)

        // Update notification with error
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            retryCount: { increment: 1 },
            lastRetryAt: new Date(),
            nextRetryAt,
            lastError: errorMessage,
            // If we've exceeded max retries, mark as permanently failed
            status:
              notification.retryCount + 1 >= notification.maxRetries
                ? 'FAILED'
                : 'FAILED',
            failedAt:
              notification.retryCount + 1 >= notification.maxRetries
                ? new Date()
                : notification.failedAt,
          },
        })
      }
    }
  }

  private async retryNotification(notification: any) {
    logger.info('Retrying notification', {
      notificationId: notification.id,
      retryCount: notification.retryCount + 1,
      maxRetries: notification.maxRetries,
    })

    const payload = notification.payload as any

    // Create a delivery attempt
    const attemptNumber = notification.retryCount + 1

    try {
      let result
      if (notification.channel === 'EMAIL') {
        const provider = this.emailChannel.getProvider()
        result = await provider.send({
          to: payload.to,
          subject: payload.subject,
          body: payload.body,
          from: payload.from,
        })
      } else if (notification.channel === 'WEBSOCKET') {
        result = await this.websocketProvider.send({
          to: payload.to,
          subject: payload.subject,
          body: payload.body,
          metadata: payload.metadata,
        })
      } else {
        throw new Error(`Unsupported channel: ${notification.channel}`)
      }

      // Record the delivery attempt
      await prisma.deliveryAttempt.create({
        data: {
          notificationId: notification.id,
          attemptNumber,
          channel: notification.channel,
          provider: result.provider || 'unknown',
          success: result.success,
          responseCode: null,
          responseBody: Prisma.DbNull,
          error: result.error || null,
          duration: result.responseTimeMs || 0,
          providerMessageId: result.messageId || null,
          providerMetadata: Prisma.DbNull,
          attemptedAt: new Date(),
        },
      })

      if (result.success) {
        // Update notification as sent
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            retryCount: { increment: 1 },
            lastRetryAt: new Date(),
          },
        })

        logger.info('Notification retry successful', {
          notificationId: notification.id,
          attemptNumber,
        })
      } else {
        throw new Error(result.error || 'Retry failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      // Record failed attempt
      await prisma.deliveryAttempt.create({
        data: {
          notificationId: notification.id,
          attemptNumber,
          channel: notification.channel,
          provider: 'unknown',
          success: false,
          responseCode: null,
          responseBody: Prisma.DbNull,
          error: errorMessage,
          duration: 0,
          providerMessageId: null,
          providerMetadata: Prisma.DbNull,
          attemptedAt: new Date(),
        },
      })

      throw error
    }
  }

  /**
   * Calculate next retry time with exponential backoff
   * Backoff: 2^n minutes (2, 4, 8, 16, 32 minutes)
   */
  private calculateNextRetry(retryCount: number): Date {
    const exponentialMinutes = Math.pow(2, retryCount)
    const maxMinutes = 60 // Cap at 1 hour
    const minutes = Math.min(exponentialMinutes, maxMinutes)

    const nextRetry = new Date()
    nextRetry.setMinutes(nextRetry.getMinutes() + minutes)

    return nextRetry
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Get statistics about retry operations
   */
  async getStats() {
    const [pendingRetries, totalFailed, reachedMaxRetries] = await Promise.all([
      prisma.notification.count({
        where: {
          status: 'FAILED',
          retryCount: {
            lt: 5,
          },
        },
      }),
      prisma.notification.count({
        where: {
          status: 'FAILED',
        },
      }),
      prisma.notification.count({
        where: {
          status: 'FAILED',
          retryCount: {
            gte: 5,
          },
        },
      }),
    ])

    return {
      pendingRetries,
      totalFailed,
      reachedMaxRetries,
      workerId: this.workerId,
      isRunning: this.isRunning,
    }
  }
}
