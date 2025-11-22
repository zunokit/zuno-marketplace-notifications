import { Prisma } from '@/infrastructure/database/generated'
import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'

export interface IdempotencyResult {
  isDuplicate: boolean
  existingNotificationId?: string
}

/**
 * Service for handling idempotency and deduplication of notifications
 *
 * Uses database unique constraint on idempotencyKey to prevent race conditions.
 * The database enforces atomicity - no check-then-act anti-pattern.
 */
export class IdempotencyService {
  /**
   * Get existing notification by idempotency key (if duplicate)
   *
   * This method is called AFTER a create attempt fails with unique constraint violation.
   * The database unique constraint ensures race-condition-free idempotency.
   *
   * @param idempotencyKey - Unique key to check
   * @param organizationId - Organization for additional validation
   * @returns Existing notification ID if found, undefined otherwise
   *
   * @example
   * ```typescript
   * try {
   *   await prisma.notification.create({ data: { ...data, idempotencyKey } })
   * } catch (error) {
   *   if (error.code === 'P2002') {
   *     const existingId = await idempotencyService.getExistingNotification(key, orgId)
   *     return existingNotification
   *   }
   *   throw error
   * }
   * ```
   */
  async getExistingNotification(
    idempotencyKey: string,
    organizationId: string
  ): Promise<string | undefined> {
    try {
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
        logger.info('Retrieved duplicate notification after constraint violation', {
          idempotencyKey,
          existingId: existing.id,
          status: existing.status,
        })

        return existing.id
      }

      // Edge case: unique constraint violated but record not found
      // This shouldn't happen but handle gracefully
      logger.warn('Unique constraint violation but notification not found', {
        idempotencyKey,
        organizationId,
      })

      return undefined
    } catch (error) {
      logger.error('Error retrieving existing notification', {
        idempotencyKey,
        organizationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return undefined
    }
  }

  /**
   * Check if error is a duplicate key violation (Prisma P2002)
   *
   * @param error - Error to check
   * @returns True if error is unique constraint violation
   */
  isDuplicateKeyError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    )
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
