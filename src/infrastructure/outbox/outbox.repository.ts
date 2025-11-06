import { Outbox, OutboxStatus, Channel } from '@prisma/client'

import { prisma } from '@/infrastructure/database/prisma'

export interface CreateOutboxDto {
  id: string
  notificationId: string
  channel: Channel
  payload: Record<string, unknown>
  status: OutboxStatus
  scheduledAt: Date
}

export interface UpdateOutboxDto {
  status?: OutboxStatus
  processingAt?: Date
  processedAt?: Date
  lockedAt?: Date
  lockedBy?: string
  retryCount?: number
  lastError?: string
  nextRetryAt?: Date
}

export class OutboxRepository {
  async create(data: CreateOutboxDto): Promise<Outbox> {
    return prisma.outbox.create({
      data,
    })
  }

  async findById(id: string): Promise<Outbox | null> {
    return prisma.outbox.findUnique({
      where: { id },
      include: {
        notification: true,
      },
    })
  }

  async findPendingMessages(
    limit: number = 100,
    workerId: string
  ): Promise<Outbox[]> {
    // Use FOR UPDATE SKIP LOCKED pattern for distributed workers
    return prisma.$queryRaw`
      UPDATE outbox
      SET
        status = 'PROCESSING'::outbox_status,
        "lockedAt" = NOW(),
        "lockedBy" = ${workerId},
        "processingAt" = NOW()
      WHERE id IN (
        SELECT id FROM outbox
        WHERE status = 'PENDING'::outbox_status
          AND "scheduledAt" <= NOW()
        ORDER BY "createdAt" ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING *
    `
  }

  async findFailedForRetry(limit: number = 100): Promise<Outbox[]> {
    return prisma.outbox.findMany({
      where: {
        status: 'FAILED',
        nextRetryAt: {
          lte: new Date(),
        },
        retryCount: {
          lt: 5, // Max retries
        },
      },
      take: limit,
      orderBy: { nextRetryAt: 'asc' },
      include: {
        notification: true,
      },
    })
  }

  async update(id: string, data: UpdateOutboxDto): Promise<Outbox> {
    return prisma.outbox.update({
      where: { id },
      data,
    })
  }

  async markAsProcessed(id: string): Promise<Outbox> {
    return this.update(id, {
      status: 'PROCESSED',
      processedAt: new Date(),
    })
  }

  async markAsFailed(
    id: string,
    error: string,
    nextRetryAt?: Date
  ): Promise<Outbox> {
    const outbox = await this.findById(id)
    if (!outbox) {
      throw new Error(`Outbox message ${id} not found`)
    }

    return this.update(id, {
      status: 'FAILED',
      lastError: error,
      retryCount: outbox.retryCount + 1,
      nextRetryAt,
    })
  }

  async moveToDeadLetter(id: string): Promise<void> {
    const outbox = await this.findById(id)
    if (!outbox) {
      throw new Error(`Outbox message ${id} not found`)
    }

    await prisma.$transaction([
      // Create dead letter entry
      prisma.deadLetterQueue.create({
        data: {
          notificationId: outbox.notificationId,
          channel: outbox.channel,
          payload: outbox.payload,
          error: outbox.lastError || 'Max retries exceeded',
          retryCount: outbox.retryCount,
        },
      }),
      // Mark outbox as dead letter
      prisma.outbox.update({
        where: { id },
        data: { status: 'DEAD_LETTER' },
      }),
    ])
  }

  async countByStatus(status: OutboxStatus): Promise<number> {
    return prisma.outbox.count({
      where: { status },
    })
  }
}
