import { nanoid } from 'nanoid'
import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'

export class SchedulerWorker {
  private workerId: string
  private isRunning: boolean = false

  constructor() {
    this.workerId = `scheduler-${nanoid(8)}`
  }

  async start(intervalMs: number = 10000) {
    if (this.isRunning) {
      logger.warn('Scheduler worker already running')
      return
    }

    this.isRunning = true
    logger.info('Scheduler worker started', { workerId: this.workerId })

    while (this.isRunning) {
      try {
        await this.processScheduledNotifications()
      } catch (error) {
        logger.error('Error in scheduler worker', {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }

      await this.sleep(intervalMs)
    }
  }

  stop() {
    this.isRunning = false
    logger.info('Scheduler worker stopped', { workerId: this.workerId })
  }

  private async processScheduledNotifications() {
    const now = new Date()

    // Find notifications that are scheduled to be sent now or in the past
    const scheduledNotifications = await prisma.notification.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: {
          lte: now,
        },
      },
      take: 50,
      orderBy: {
        scheduledAt: 'asc',
      },
      include: {
        organization: true,
        user: true,
        template: true,
      },
    })

    if (scheduledNotifications.length === 0) {
      return
    }

    logger.info('Processing scheduled notifications', {
      count: scheduledNotifications.length,
      workerId: this.workerId,
    })

    for (const notification of scheduledNotifications) {
      try {
        // Update status to PROCESSING to prevent duplicate processing
        await prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'PROCESSING' },
        })

        // Process the notification by sending it
        // Since it's already created, we need to trigger the outbox pattern
        await this.triggerNotification(notification)

        logger.info('Scheduled notification processed', {
          notificationId: notification.id,
          scheduledAt: notification.scheduledAt,
        })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'

        logger.error('Failed to process scheduled notification', {
          notificationId: notification.id,
          error: errorMessage,
        })

        // Update notification as failed
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'FAILED',
            failedAt: new Date(),
            lastError: errorMessage,
          },
        })
      }
    }
  }

  private async triggerNotification(notification: any) {
    const payload = notification.payload as any

    // Create an outbox entry for the notification
    await prisma.outbox.create({
      data: {
        notificationId: notification.id,
        channel: notification.channel,
        payload: payload,
        status: 'PENDING',
      },
    })

    // Update notification status back to PENDING so outbox worker can process it
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: 'PENDING',
      },
    })

    logger.info('Notification queued for delivery', {
      notificationId: notification.id,
      channel: notification.channel,
    })
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Get statistics about scheduled notifications
   */
  async getStats() {
    const now = new Date()

    const [pending, overdue, upcoming] = await Promise.all([
      prisma.notification.count({
        where: {
          status: 'PENDING',
          scheduledAt: { not: null },
        },
      }),
      prisma.notification.count({
        where: {
          status: 'PENDING',
          scheduledAt: {
            lt: now,
          },
        },
      }),
      prisma.notification.count({
        where: {
          status: 'PENDING',
          scheduledAt: {
            gt: now,
          },
        },
      }),
    ])

    return {
      pending,
      overdue,
      upcoming,
      workerId: this.workerId,
      isRunning: this.isRunning,
    }
  }
}
