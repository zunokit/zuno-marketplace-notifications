// Mock Prisma generated client
jest.mock('@/infrastructure/database/prisma', () => ({
  Channel: {
    EMAIL: 'EMAIL',
    SMS: 'SMS',
    WEBSOCKET: 'WEBSOCKET',
    PUSH: 'PUSH',
  },
  prisma: {},
}))

import { RateLimitService } from '@/core/services/rate-limit.service'
import { Channel } from '@/infrastructure/database/prisma'

// Mock Redis
jest.mock('@/infrastructure/cache/redis.client', () => ({
  redis: {
    connect: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
    ttl: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  },
}))

// Mock logger
jest.mock('@/lib/logger/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

import { redis } from '@/infrastructure/cache/redis.client'

// Type the mocks properly
const mockRedis = jest.mocked(redis)

describe('RateLimitService', () => {
  let service: RateLimitService

  beforeEach(() => {
    service = new RateLimitService()
    jest.clearAllMocks()
  })

  describe('checkRateLimit', () => {
    it('should allow request when under all limits', async () => {
      mockRedis.connect.mockResolvedValue(undefined)
      mockRedis.incr.mockResolvedValue(1)
      mockRedis.ttl.mockResolvedValue(3600)

      const result = await service.checkRateLimit('org-1', Channel.EMAIL)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBeGreaterThan(0)
      expect(mockRedis.connect).toHaveBeenCalled()
      expect(mockRedis.incr).toHaveBeenCalled()
    })

    it('should deny request when minute limit exceeded', async () => {
      mockRedis.connect.mockResolvedValue(undefined)
      mockRedis.incr.mockResolvedValue(101) // Over default maxPerMinute of 100
      mockRedis.ttl.mockResolvedValue(60)

      const result = await service.checkRateLimit('org-1', Channel.EMAIL)

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should deny request when hour limit exceeded', async () => {
      mockRedis.connect.mockResolvedValue(undefined)
      // First check (minute) passes
      mockRedis.incr.mockResolvedValueOnce(50)
      mockRedis.ttl.mockResolvedValueOnce(60)
      // Second check (hour) fails
      mockRedis.incr.mockResolvedValueOnce(1001) // Over default maxPerHour of 1000
      mockRedis.ttl.mockResolvedValueOnce(3600)

      const result = await service.checkRateLimit('org-1', Channel.EMAIL)

      expect(result.allowed).toBe(false)
    })

    it('should deny request when day limit exceeded', async () => {
      mockRedis.connect.mockResolvedValue(undefined)
      // Minute and hour checks pass
      mockRedis.incr.mockResolvedValueOnce(50)
      mockRedis.ttl.mockResolvedValueOnce(60)
      mockRedis.incr.mockResolvedValueOnce(500)
      mockRedis.ttl.mockResolvedValueOnce(3600)
      // Day check fails
      mockRedis.incr.mockResolvedValueOnce(10001) // Over default maxPerDay of 10000
      mockRedis.ttl.mockResolvedValueOnce(86400)

      const result = await service.checkRateLimit('org-1', Channel.EMAIL)

      expect(result.allowed).toBe(false)
    })

    it('should use custom rate limit config', async () => {
      mockRedis.connect.mockResolvedValue(undefined)
      mockRedis.incr.mockResolvedValue(51)
      mockRedis.ttl.mockResolvedValue(60)

      const customConfig = {
        maxPerMinute: 50,
        maxPerHour: 500,
        maxPerDay: 5000,
      }

      const result = await service.checkRateLimit('org-1', Channel.EMAIL, customConfig)

      expect(result.allowed).toBe(false) // Over custom limit of 50
    })

    it('should set expiry on first increment', async () => {
      mockRedis.connect.mockResolvedValue(undefined)
      mockRedis.incr.mockResolvedValue(1)
      mockRedis.ttl.mockResolvedValue(60)

      await service.checkRateLimit('org-1', Channel.EMAIL)

      expect(mockRedis.expire).toHaveBeenCalled()
    })

    it('should not set expiry on subsequent increments', async () => {
      mockRedis.connect.mockResolvedValue(undefined)
      mockRedis.incr.mockResolvedValue(5) // Not first increment
      mockRedis.ttl.mockResolvedValue(55)

      await service.checkRateLimit('org-1', Channel.EMAIL)

      expect(mockRedis.expire).not.toHaveBeenCalled()
    })

    it('should fail open on Redis error', async () => {
      mockRedis.connect.mockRejectedValue(new Error('Redis connection failed'))

      const result = await service.checkRateLimit('org-1', Channel.EMAIL)

      expect(result.allowed).toBe(true) // Fail open
    })

    it('should calculate remaining quota correctly', async () => {
      mockRedis.connect.mockResolvedValue(undefined)
      // Minute check
      mockRedis.incr.mockResolvedValueOnce(25) // 25 out of 100
      mockRedis.ttl.mockResolvedValueOnce(60)
      // Hour check
      mockRedis.incr.mockResolvedValueOnce(100)
      mockRedis.ttl.mockResolvedValueOnce(3600)
      // Day check
      mockRedis.incr.mockResolvedValueOnce(500)
      mockRedis.ttl.mockResolvedValueOnce(86400)

      const result = await service.checkRateLimit('org-1', Channel.EMAIL)

      // Should return the day window result since all checks pass
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBeGreaterThan(0)
    })

    it('should return correct reset time', async () => {
      mockRedis.connect.mockResolvedValue(undefined)
      mockRedis.incr.mockResolvedValue(1)
      mockRedis.ttl.mockResolvedValue(3600) // 1 hour

      const result = await service.checkRateLimit('org-1', Channel.EMAIL)

      const expectedResetTime = new Date(Date.now() + 3600 * 1000)
      // Allow 1 second difference for test execution time
      expect(
        Math.abs(result.resetAt.getTime() - expectedResetTime.getTime())
      ).toBeLessThan(1000)
    })

    it('should work with different channels', async () => {
      mockRedis.connect.mockResolvedValue(undefined)
      mockRedis.incr.mockResolvedValue(1)
      mockRedis.ttl.mockResolvedValue(60)

      await service.checkRateLimit('org-1', Channel.EMAIL)
      await service.checkRateLimit('org-1', Channel.SMS)
      await service.checkRateLimit('org-1', Channel.WEBSOCKET)

      expect(mockRedis.incr).toHaveBeenCalled()
    })
  })

  describe('getRemainingQuota', () => {
    it('should return remaining quota for all time windows', async () => {
      mockRedis.connect.mockResolvedValue(undefined)
      mockRedis.get.mockResolvedValueOnce('25') // minute
      mockRedis.get.mockResolvedValueOnce('250') // hour
      mockRedis.get.mockResolvedValueOnce('2500') // day

      const quota = await service.getRemainingQuota('org-1', Channel.EMAIL)

      expect(quota.minute).toBe(75) // 100 - 25
      expect(quota.hour).toBe(750) // 1000 - 250
      expect(quota.day).toBe(7500) // 10000 - 2500
    })

    it('should return full quota when no usage', async () => {
      mockRedis.connect.mockResolvedValue(undefined)
      mockRedis.get.mockResolvedValue(null)

      const quota = await service.getRemainingQuota('org-1', Channel.EMAIL)

      expect(quota.minute).toBe(100)
      expect(quota.hour).toBe(1000)
      expect(quota.day).toBe(10000)
    })

    it('should use custom config', async () => {
      mockRedis.connect.mockResolvedValue(undefined)
      mockRedis.get.mockResolvedValueOnce('10')
      mockRedis.get.mockResolvedValueOnce('100')
      mockRedis.get.mockResolvedValueOnce('1000')

      const customConfig = {
        maxPerMinute: 50,
        maxPerHour: 500,
        maxPerDay: 5000,
      }

      const quota = await service.getRemainingQuota(
        'org-1',
        Channel.EMAIL,
        customConfig
      )

      expect(quota.minute).toBe(40) // 50 - 10
      expect(quota.hour).toBe(400) // 500 - 100
      expect(quota.day).toBe(4000) // 5000 - 1000
    })

    it('should not return negative quotas', async () => {
      mockRedis.connect.mockResolvedValue(undefined)
      mockRedis.get.mockResolvedValueOnce('150') // Over limit
      mockRedis.get.mockResolvedValueOnce('1500')
      mockRedis.get.mockResolvedValueOnce('15000')

      const quota = await service.getRemainingQuota('org-1', Channel.EMAIL)

      expect(quota.minute).toBe(0)
      expect(quota.hour).toBe(0)
      expect(quota.day).toBe(0)
    })
  })

  describe('resetRateLimit', () => {
    it('should delete all time window keys', async () => {
      mockRedis.connect.mockResolvedValue(undefined)
      mockRedis.del.mockResolvedValue(undefined)

      await service.resetRateLimit('org-1', Channel.EMAIL)

      expect(mockRedis.del).toHaveBeenCalledTimes(3) // minute, hour, day
      expect(mockRedis.connect).toHaveBeenCalled()
    })

    it('should work with different organizations', async () => {
      mockRedis.connect.mockResolvedValue(undefined)
      mockRedis.del.mockResolvedValue(undefined)

      await service.resetRateLimit('org-1', Channel.EMAIL)
      await service.resetRateLimit('org-2', Channel.EMAIL)

      expect(mockRedis.del).toHaveBeenCalledTimes(6) // 3 windows x 2 orgs
    })

    it('should work with different channels', async () => {
      mockRedis.connect.mockResolvedValue(undefined)
      mockRedis.del.mockResolvedValue(undefined)

      await service.resetRateLimit('org-1', Channel.EMAIL)
      await service.resetRateLimit('org-1', Channel.SMS)

      expect(mockRedis.del).toHaveBeenCalledTimes(6) // 3 windows x 2 channels
    })
  })

  describe('key generation', () => {
    it('should generate consistent keys for same inputs', async () => {
      mockRedis.connect.mockResolvedValue(undefined)
      mockRedis.incr.mockResolvedValue(1)
      mockRedis.ttl.mockResolvedValue(60)

      await service.checkRateLimit('org-1', Channel.EMAIL)
      const firstCall = mockRedis.incr.mock.calls[0][0]

      jest.clearAllMocks()
      mockRedis.incr.mockResolvedValue(2)

      // Call again immediately (same minute)
      await service.checkRateLimit('org-1', Channel.EMAIL)
      const secondCall = mockRedis.incr.mock.calls[0][0]

      expect(firstCall).toBe(secondCall)
    })
  })
})
