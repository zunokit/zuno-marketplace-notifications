import type { Prisma } from '@prisma/client'

import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'

export class OutboxRepository {
  async createWithNotification(
    notificationData: Prisma.NotificationCreateInput,
    outboxData: Omit<Prisma.OutboxCreateInput, 'notification'>
  ) {
    return await prisma.$transaction(async (tx) => {
      // Create notification
      const notification = await tx.notification.create({
        data: notificationData,
      })

      // Create outbox entry
      const outbox = await tx.outbox.create({
        data: {
          channel: outboxData.channel,
          payload: outboxData.payload,
          scheduledAt: outboxData.scheduledAt,
          notification: {
            connect: { id: notification.id },
          },
        },
      })

      logger.info('Created notification with outbox', {
        notificationId: notification.id,
        outboxId: outbox.id,
      })

      return { notification, outbox }
    })
  }

  async getPending(limit: number = 100) {
    return await prisma.outbox.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: {
          lte: new Date(),
        },
        OR: [
          { lockedAt: null },
          {
            lockedAt: {
              lt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes timeout
            },
          },
        ],
      },
      include: {
        notification: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    })
  }

  async lock(outboxId: string, workerId: string) {
    return await prisma.outbox.update({
      where: { id: outboxId },
      data: {
        status: 'PROCESSING',
        lockedAt: new Date(),
        lockedBy: workerId,
        processingAt: new Date(),
      },
    })
  }

  async markProcessed(outboxId: string) {
    return await prisma.outbox.update({
      where: { id: outboxId },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
        lockedAt: null,
        lockedBy: null,
      },
    })
  }

  async markFailed(outboxId: string, error: string) {
    const outbox = await prisma.outbox.findUnique({
      where: { id: outboxId },
    })

    if (!outbox) throw new Error('Outbox not found')

    const retryCount = outbox.retryCount + 1
    const maxRetries = 5

    if (retryCount >= maxRetries) {
      // Move to dead letter queue
      await prisma.$transaction(async (tx) => {
        await tx.deadLetterQueue.create({
          data: {
            notificationId: outbox.notificationId,
            channel: outbox.channel,
            payload: outbox.payload as any,
            error,
            retryCount,
          },
        })

        await tx.outbox.update({
          where: { id: outboxId },
          data: {
            status: 'DEAD_LETTER',
            lastError: error,
            processedAt: new Date(),
          },
        })
      })

      logger.warn('Outbox moved to dead letter queue', {
        outboxId,
        retryCount,
      })
    } else {
      // Retry with exponential backoff
      const backoffSeconds = Math.pow(2, retryCount) * 60 // 2, 4, 8, 16, 32 minutes
      const nextRetryAt = new Date(Date.now() + backoffSeconds * 1000)

      await prisma.outbox.update({
        where: { id: outboxId },
        data: {
          status: 'FAILED',
          lastError: error,
          retryCount,
          nextRetryAt,
          lockedAt: null,
          lockedBy: null,
        },
      })

      logger.info('Outbox scheduled for retry', {
        outboxId,
        retryCount,
        nextRetryAt,
      })
    }
  }
}
