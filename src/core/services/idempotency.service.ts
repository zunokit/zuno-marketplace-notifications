import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'

export interface IdempotencyResult {
  isDuplicate: boolean
  existingNotificationId?: string
}

/**
 * Service for handling idempotency and deduplication of notifications
 */
export class IdempotencyService {
  /**
   * Check if a notification with the given idempotency key already exists
   */
  async checkIdempotency(
    idempotencyKey: string,
    organizationId: string
  ): Promise<IdempotencyResult> {
    try {
      // Find existing notification with this idempotency key
      const existing = await prisma.notification.findFirst({
        where: {
          idempotencyKey,
          organizationId,
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      })

      if (existing) {
        logger.info('Duplicate notification detected', {
          idempotencyKey,
          existingId: existing.id,
          status: existing.status,
        })

        return {
          isDuplicate: true,
          existingNotificationId: existing.id,
        }
      }

      return {
        isDuplicate: false,
      }
    } catch (error) {
      logger.error('Error checking idempotency', {
        idempotencyKey,
        organizationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      // On error, allow the notification to proceed
      return {
        isDuplicate: false,
      }
    }
  }

  /**
   * Generate an idempotency key based on notification attributes
   */
  generateIdempotencyKey(
    organizationId: string,
    userId: string,
    type: string,
    metadata?: Record<string, unknown>
  ): string {
    // Create a deterministic key from the notification attributes
    const parts = [organizationId, userId, type]

    // Add metadata if provided
    if (metadata) {
      // Sort keys to ensure consistent ordering
      const sortedKeys = Object.keys(metadata).sort()
      for (const key of sortedKeys) {
        parts.push(`${key}:${metadata[key]}`)
      }
    }

    return parts.join('|')
  }

  /**
   * Check if enough time has passed since the last notification
   * This helps prevent spam even with different idempotency keys
   */
  async checkRateLimit(
    organizationId: string,
    userId: string,
    type: string,
    minIntervalSeconds: number = 60
  ): Promise<boolean> {
    try {
      const cutoffTime = new Date()
      cutoffTime.setSeconds(cutoffTime.getSeconds() - minIntervalSeconds)

      const recent = await prisma.notification.findFirst({
        where: {
          organizationId,
          userId,
          type: type as any,
          createdAt: {
            gte: cutoffTime,
          },
        },
        select: {
          id: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      if (recent) {
        const secondsSinceLastNotification =
          (Date.now() - recent.createdAt.getTime()) / 1000

        logger.warn('Notification sent too recently', {
          organizationId,
          userId,
          type,
          lastNotificationId: recent.id,
          secondsSinceLastNotification,
        })

        return false
      }

      return true
    } catch (error) {
      logger.error('Error checking rate limit', {
        organizationId,
        userId,
        type,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      // On error, allow the notification to proceed
      return true
    }
  }

  /**
   * Clean up old idempotency keys to prevent database bloat
   * Should be run periodically (e.g., daily)
   */
  async cleanupOldKeys(retentionDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      const result = await prisma.notification.updateMany({
        where: {
          idempotencyKey: {
            not: null,
          },
          createdAt: {
            lt: cutoffDate,
          },
        },
        data: {
          idempotencyKey: null,
        },
      })

      logger.info('Cleaned up old idempotency keys', {
        count: result.count,
        retentionDays,
      })

      return result.count
    } catch (error) {
      logger.error('Error cleaning up idempotency keys', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return 0
    }
  }
}
