import { prisma } from '@/infrastructure/database/prisma'
import { Prisma } from '@/infrastructure/database/prisma'

export class NotificationRepository {
  /**
   * Create notification with idempotency check
   */
  async create(data: {
    organizationId: string
    userId: string
    type: string
    channel: string
    templateId?: string
    status?: string
    priority?: string
    payload: Record<string, unknown>
    idempotencyKey?: string
    correlationId?: string
    metadata?: Record<string, unknown>
    scheduledAt?: Date
  }) {
    return await prisma.notification.create({
      data: {
        type: data.type as any,
        channel: data.channel as any,
        status: (data.status as any) || 'PENDING',
        priority: (data.priority as any) || 'NORMAL',
        payload: data.payload as any,
        idempotencyKey: data.idempotencyKey,
        correlationId: data.correlationId,
        metadata: data.metadata as any,
        scheduledAt: data.scheduledAt,
        organizationId: data.organizationId,
        userId: data.userId,
        templateId: data.templateId,
      },
    })
  }

  /**
   * Find notification by ID
   */
  async findById(id: string) {
    return await prisma.notification.findUnique({
      where: { id },
      include: {
        user: true,
        organization: true,
        template: true,
        deliveryAttempts: {
          orderBy: { attemptedAt: 'desc' },
        },
      },
    })
  }

  /**
   * Find by idempotency key
   */
  async findByIdempotencyKey(idempotencyKey: string, organizationId: string) {
    return await prisma.notification.findFirst({
      where: {
        idempotencyKey,
        organizationId,
      },
    })
  }

  /**
   * Update notification status
   */
  async updateStatus(
    id: string,
    status: string,
    updates?: {
      sentAt?: Date
      deliveredAt?: Date
      failedAt?: Date
      lastError?: string
    }
  ) {
    return await prisma.notification.update({
      where: { id },
      data: {
        status: status as any,
        ...updates,
      },
    })
  }

  /**
   * List notifications with filters
   */
  async list(params: {
    organizationId?: string
    userId?: string
    status?: string
    channel?: string
    type?: string
    limit?: number
    offset?: number
  }) {
    const where: Prisma.NotificationWhereInput = {}

    if (params.organizationId) where.organizationId = params.organizationId
    if (params.userId) where.userId = params.userId
    if (params.status) where.status = params.status as any
    if (params.channel) where.channel = params.channel as any
    if (params.type) where.type = params.type as any

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: params.limit || 50,
        skip: params.offset || 0,
      }),
      prisma.notification.count({ where }),
    ])

    return { notifications, total }
  }

  /**
   * Get notification statistics
   */
  async getStats(organizationId?: string) {
    const where: Prisma.NotificationWhereInput = organizationId
      ? { organizationId }
      : {}

    const [
      total,
      byStatus,
      byChannel,
      byType,
      avgDeliveryTime,
    ] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.notification.groupBy({
        by: ['channel'],
        where,
        _count: true,
      }),
      prisma.notification.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
      prisma.$queryRaw<Array<{ avg: number }>>`
        SELECT AVG(EXTRACT(EPOCH FROM (sent_at - created_at))) as avg
        FROM notifications
        WHERE sent_at IS NOT NULL
        ${organizationId ? Prisma.sql`AND organization_id = ${organizationId}` : Prisma.empty}
      `,
    ])

    return {
      total,
      byStatus,
      byChannel,
      byType,
      avgDeliveryTimeSeconds: avgDeliveryTime[0]?.avg || 0,
    }
  }

  /**
   * Record delivery attempt
   */
  async recordDeliveryAttempt(data: {
    notificationId: string
    attemptNumber: number
    channel: string
    provider: string
    success: boolean
    responseCode?: number
    error?: string
    duration: number
    providerMessageId?: string
  }) {
    return await prisma.deliveryAttempt.create({
      data: {
        notificationId: data.notificationId,
        attemptNumber: data.attemptNumber,
        channel: data.channel as any,
        provider: data.provider,
        success: data.success,
        responseCode: data.responseCode,
        responseBody: Prisma.DbNull,
        error: data.error,
        duration: data.duration,
        providerMessageId: data.providerMessageId,
        providerMetadata: Prisma.DbNull,
        attemptedAt: new Date(),
      },
    })
  }

  /**
   * Mark notification for retry
   */
  async markForRetry(id: string, nextRetryAt: Date) {
    return await prisma.notification.update({
      where: { id },
      data: {
        status: 'FAILED',
        retryCount: { increment: 1 },
        lastRetryAt: new Date(),
        nextRetryAt,
      },
    })
  }

  /**
   * Get failed notifications ready for retry
   */
  async getReadyForRetry(limit = 50) {
    return await prisma.notification.findMany({
      where: {
        status: 'FAILED',
        nextRetryAt: {
          lte: new Date(),
        },
        retryCount: {
          lt: 5,
        },
      },
      take: limit,
      orderBy: { nextRetryAt: 'asc' },
      include: {
        user: true,
        organization: true,
      },
    })
  }
}
