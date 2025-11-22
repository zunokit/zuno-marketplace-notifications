import { prisma } from '@/infrastructure/database/prisma'
import {
  Prisma,
  NotificationType,
  Channel,
  NotificationStatus,
  Priority,
  Notification,
} from '@/infrastructure/database/generated'

/**
 * Input for creating a notification
 */
export interface CreateNotificationInput {
  organizationId: string
  userId: string
  type: NotificationType
  channel: Channel
  templateId?: string
  status?: NotificationStatus
  priority?: Priority
  payload: Prisma.JsonValue
  idempotencyKey?: string
  correlationId?: string
  metadata?: Prisma.JsonValue
  scheduledAt?: Date
}

/**
 * Repository for notification database operations
 *
 * Provides type-safe database access using Prisma generated types.
 * All methods use proper TypeScript types without `any` assertions.
 */
export class NotificationRepository {
  /**
   * Create notification with proper type safety
   *
   * @param data - Notification data with type-safe enum values
   * @returns Created notification entity
   *
   * @example
   * ```typescript
   * const notification = await repository.create({
   *   organizationId: 'org-123',
   *   userId: 'user-456',
   *   type: 'AUCTION_WON',
   *   channel: 'EMAIL',
   *   priority: 'HIGH',
   *   payload: { auctionTitle: 'CryptoPunk #123' }
   * })
   * ```
   */
  async create(data: CreateNotificationInput): Promise<Notification> {
    return await prisma.notification.create({
      data: {
        type: data.type,
        channel: data.channel,
        status: data.status || 'PENDING',
        priority: data.priority || 'NORMAL',
        payload: data.payload ?? Prisma.JsonNull,
        idempotencyKey: data.idempotencyKey,
        correlationId: data.correlationId,
        metadata: data.metadata ?? Prisma.JsonNull,
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
   *
   * @param id - Notification ID
   * @param status - New status (type-safe enum)
   * @param updates - Optional timestamp updates
   * @returns Updated notification
   */
  async updateStatus(
    id: string,
    status: NotificationStatus,
    updates?: {
      sentAt?: Date
      deliveredAt?: Date
      failedAt?: Date
      lastError?: string
    }
  ): Promise<Notification> {
    return await prisma.notification.update({
      where: { id },
      data: {
        status,
        ...updates,
      },
    })
  }

  /**
   * List notifications with type-safe filters
   *
   * @param params - Filter parameters with type-safe enums
   * @returns Paginated notification list with total count
   */
  async list(params: {
    organizationId?: string
    userId?: string
    status?: NotificationStatus
    channel?: Channel
    type?: NotificationType
    limit?: number
    offset?: number
  }): Promise<{
    notifications: Array<
      Notification & {
        user: { id: string; email: string; name: string | null }
        organization: { id: string; name: string }
      }
    >
    total: number
  }> {
    const where: Prisma.NotificationWhereInput = {}

    if (params.organizationId) where.organizationId = params.organizationId
    if (params.userId) where.userId = params.userId
    if (params.status) where.status = params.status
    if (params.channel) where.channel = params.channel
    if (params.type) where.type = params.type

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
   * Record delivery attempt with type safety
   *
   * @param data - Delivery attempt data
   * @returns Created delivery attempt record
   */
  async recordDeliveryAttempt(data: {
    notificationId: string
    attemptNumber: number
    channel: Channel
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
        channel: data.channel,
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
