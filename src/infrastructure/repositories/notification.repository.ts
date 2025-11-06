import { Notification, NotificationStatus, NotificationType, Channel, Priority } from '@prisma/client'

import { prisma } from '@/infrastructure/database/prisma'

export interface CreateNotificationDto {
  id: string
  organizationId: string
  userId: string
  type: NotificationType
  channel: Channel
  templateId?: string
  status: NotificationStatus
  priority: Priority
  payload: Record<string, unknown>
  idempotencyKey?: string
  correlationId?: string
  metadata?: Record<string, unknown>
  retryCount: number
  maxRetries: number
}

export interface UpdateNotificationDto {
  status?: NotificationStatus
  sentAt?: Date
  deliveredAt?: Date
  failedAt?: Date
  retryCount?: number
  lastError?: string
  errorCategory?: string
}

export class NotificationRepository {
  async create(data: CreateNotificationDto): Promise<Notification> {
    return prisma.notification.create({
      data,
    })
  }

  async findById(id: string): Promise<Notification | null> {
    return prisma.notification.findUnique({
      where: { id },
      include: {
        user: true,
        organization: true,
        template: true,
      },
    })
  }

  async findByIdempotencyKey(key: string): Promise<Notification | null> {
    return prisma.notification.findUnique({
      where: { idempotencyKey: key },
    })
  }

  async findByOrganization(
    organizationId: string,
    options?: {
      limit?: number
      offset?: number
      status?: NotificationStatus
      channel?: Channel
    }
  ): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: {
        organizationId,
        ...(options?.status && { status: options.status }),
        ...(options?.channel && { channel: options.channel }),
      },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        template: true,
      },
    })
  }

  async findByUser(
    userId: string,
    options?: {
      limit?: number
      offset?: number
    }
  ): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findPendingForRetry(limit: number = 100): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: {
        status: 'FAILED',
        nextRetryAt: {
          lte: new Date(),
        },
      },
      take: limit,
      orderBy: { nextRetryAt: 'asc' },
    })
  }

  async update(id: string, data: UpdateNotificationDto): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.notification.delete({
      where: { id },
    })
  }

  async countByOrganization(
    organizationId: string,
    filters?: {
      status?: NotificationStatus
      channel?: Channel
      startDate?: Date
      endDate?: Date
    }
  ): Promise<number> {
    return prisma.notification.count({
      where: {
        organizationId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.channel && { channel: filters.channel }),
        ...(filters?.startDate && {
          createdAt: { gte: filters.startDate },
        }),
        ...(filters?.endDate && {
          createdAt: { lte: filters.endDate },
        }),
      },
    })
  }
}
