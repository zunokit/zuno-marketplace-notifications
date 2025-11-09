import { IdempotencyService } from '@/core/services/idempotency.service'

// Mock Prisma
jest.mock('@/infrastructure/database/prisma', () => ({
  prisma: {
    notification: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}))

// Mock logger
jest.mock('@/lib/logger/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}))

import { prisma } from '@/infrastructure/database/prisma'

describe('IdempotencyService', () => {
  let service: IdempotencyService

  beforeEach(() => {
    service = new IdempotencyService()
    jest.clearAllMocks()
  })

  describe('checkIdempotency', () => {
    it('should return isDuplicate false when no existing notification found', async () => {
      ;(prisma.notification.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await service.checkIdempotency('key-123', 'org-1')

      expect(result.isDuplicate).toBe(false)
      expect(result.existingNotificationId).toBeUndefined()
      expect(prisma.notification.findFirst).toHaveBeenCalledWith({
        where: {
          idempotencyKey: 'key-123',
          organizationId: 'org-1',
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      })
    })

    it('should return isDuplicate true when existing notification found', async () => {
      const existingNotification = {
        id: 'notif-123',
        status: 'SENT',
        createdAt: new Date(),
      }
      ;(prisma.notification.findFirst as jest.Mock).mockResolvedValue(
        existingNotification
      )

      const result = await service.checkIdempotency('key-123', 'org-1')

      expect(result.isDuplicate).toBe(true)
      expect(result.existingNotificationId).toBe('notif-123')
    })

    it('should return isDuplicate false on database error', async () => {
      ;(prisma.notification.findFirst as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const result = await service.checkIdempotency('key-123', 'org-1')

      expect(result.isDuplicate).toBe(false)
    })
  })

  describe('generateIdempotencyKey', () => {
    it('should generate key from basic parameters', () => {
      const key = service.generateIdempotencyKey('org-1', 'user-1', 'WELCOME')

      expect(key).toBe('org-1|user-1|WELCOME')
    })

    it('should include metadata in key', () => {
      const key = service.generateIdempotencyKey('org-1', 'user-1', 'WELCOME', {
        nftId: '123',
        price: 100,
      })

      expect(key).toContain('org-1|user-1|WELCOME')
      expect(key).toContain('nftId:123')
      expect(key).toContain('price:100')
    })

    it('should sort metadata keys for consistency', () => {
      const key1 = service.generateIdempotencyKey('org-1', 'user-1', 'WELCOME', {
        z: 'last',
        a: 'first',
        m: 'middle',
      })

      const key2 = service.generateIdempotencyKey('org-1', 'user-1', 'WELCOME', {
        m: 'middle',
        z: 'last',
        a: 'first',
      })

      expect(key1).toBe(key2)
    })

    it('should generate different keys for different parameters', () => {
      const key1 = service.generateIdempotencyKey('org-1', 'user-1', 'WELCOME')
      const key2 = service.generateIdempotencyKey('org-1', 'user-2', 'WELCOME')
      const key3 = service.generateIdempotencyKey('org-2', 'user-1', 'WELCOME')
      const key4 = service.generateIdempotencyKey('org-1', 'user-1', 'ALERT')

      expect(key1).not.toBe(key2)
      expect(key1).not.toBe(key3)
      expect(key1).not.toBe(key4)
    })

    it('should handle empty metadata', () => {
      const key1 = service.generateIdempotencyKey('org-1', 'user-1', 'WELCOME')
      const key2 = service.generateIdempotencyKey('org-1', 'user-1', 'WELCOME', {})

      expect(key1).toBe(key2)
    })
  })

  describe('checkRateLimit', () => {
    it('should allow notification when no recent notifications', async () => {
      ;(prisma.notification.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await service.checkRateLimit('org-1', 'user-1', 'WELCOME', 60)

      expect(result).toBe(true)
    })

    it('should block notification when sent too recently', async () => {
      const recentNotification = {
        id: 'notif-123',
        createdAt: new Date(Date.now() - 30000), // 30 seconds ago
      }
      ;(prisma.notification.findFirst as jest.Mock).mockResolvedValue(
        recentNotification
      )

      const result = await service.checkRateLimit('org-1', 'user-1', 'WELCOME', 60)

      expect(result).toBe(false)
    })

    it('should allow notification when enough time has passed', async () => {
      // Mock no recent notification found (because it's outside the time window)
      ;(prisma.notification.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await service.checkRateLimit('org-1', 'user-1', 'WELCOME', 60)

      expect(result).toBe(true)
    })

    it('should query with correct time window', async () => {
      ;(prisma.notification.findFirst as jest.Mock).mockResolvedValue(null)

      const minIntervalSeconds = 300 // 5 minutes
      await service.checkRateLimit('org-1', 'user-1', 'WELCOME', minIntervalSeconds)

      const callArgs = (prisma.notification.findFirst as jest.Mock).mock.calls[0][0]
      const cutoffTime = callArgs.where.createdAt.gte

      const expectedCutoff = new Date()
      expectedCutoff.setSeconds(expectedCutoff.getSeconds() - minIntervalSeconds)

      // Allow 1 second difference for test execution time
      expect(Math.abs(cutoffTime.getTime() - expectedCutoff.getTime())).toBeLessThan(
        1000
      )
    })

    it('should allow notification on database error', async () => {
      ;(prisma.notification.findFirst as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const result = await service.checkRateLimit('org-1', 'user-1', 'WELCOME', 60)

      expect(result).toBe(true)
    })

    it('should use default interval when not specified', async () => {
      ;(prisma.notification.findFirst as jest.Mock).mockResolvedValue(null)

      await service.checkRateLimit('org-1', 'user-1', 'WELCOME')

      const callArgs = (prisma.notification.findFirst as jest.Mock).mock.calls[0][0]
      expect(callArgs).toBeDefined()
    })
  })

  describe('cleanupOldKeys', () => {
    it('should cleanup old idempotency keys', async () => {
      ;(prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 150 })

      const count = await service.cleanupOldKeys(30)

      expect(count).toBe(150)
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          idempotencyKey: {
            not: null,
          },
          createdAt: {
            lt: expect.any(Date),
          },
        },
        data: {
          idempotencyKey: null,
        },
      })
    })

    it('should use correct retention period', async () => {
      ;(prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 100 })

      const retentionDays = 60
      await service.cleanupOldKeys(retentionDays)

      const callArgs = (prisma.notification.updateMany as jest.Mock).mock.calls[0][0]
      const cutoffDate = callArgs.where.createdAt.lt

      const expectedCutoff = new Date()
      expectedCutoff.setDate(expectedCutoff.getDate() - retentionDays)

      // Allow 1 day difference for test execution time
      expect(Math.abs(cutoffDate.getTime() - expectedCutoff.getTime())).toBeLessThan(
        86400000
      )
    })

    it('should use default retention of 30 days', async () => {
      ;(prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 50 })

      await service.cleanupOldKeys()

      expect(prisma.notification.updateMany).toHaveBeenCalled()
    })

    it('should return 0 on database error', async () => {
      ;(prisma.notification.updateMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const count = await service.cleanupOldKeys(30)

      expect(count).toBe(0)
    })

    it('should return count of cleaned records', async () => {
      ;(prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 250 })

      const count = await service.cleanupOldKeys(30)

      expect(count).toBe(250)
    })
  })
})
