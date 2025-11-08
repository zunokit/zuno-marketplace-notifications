import type { Channel } from '@prisma/client'

import redis from '@/lib/redis/client'
import { logger } from '@/lib/logger/logger'

export interface RateLimitConfig {
  maxPerMinute: number
  maxPerHour: number
  maxPerDay: number
}

export class RateLimiterService {
  private keyPrefix = 'rate_limit'

  async checkLimit(
    organizationId: string,
    channel: Channel,
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; reason?: string }> {
    const now = Date.now()
    const minuteKey = `${this.keyPrefix}:${organizationId}:${channel}:minute:${Math.floor(now / 60000)}`
    const hourKey = `${this.keyPrefix}:${organizationId}:${channel}:hour:${Math.floor(now / 3600000)}`
    const dayKey = `${this.keyPrefix}:${organizationId}:${channel}:day:${Math.floor(now / 86400000)}`

    try {
      // Increment counters
      const [minuteCount, hourCount, dayCount] = await Promise.all([
        this.incrementCounter(minuteKey, 60),
        this.incrementCounter(hourKey, 3600),
        this.incrementCounter(dayKey, 86400),
      ])

      // Check limits
      if (minuteCount > config.maxPerMinute) {
        logger.warn('Rate limit exceeded (minute)', {
          organizationId,
          channel,
          count: minuteCount,
          limit: config.maxPerMinute,
        })
        return { allowed: false, reason: 'Minute limit exceeded' }
      }

      if (hourCount > config.maxPerHour) {
        logger.warn('Rate limit exceeded (hour)', {
          organizationId,
          channel,
          count: hourCount,
          limit: config.maxPerHour,
        })
        return { allowed: false, reason: 'Hour limit exceeded' }
      }

      if (dayCount > config.maxPerDay) {
        logger.warn('Rate limit exceeded (day)', {
          organizationId,
          channel,
          count: dayCount,
          limit: config.maxPerDay,
        })
        return { allowed: false, reason: 'Day limit exceeded' }
      }

      return { allowed: true }
    } catch (error) {
      logger.error('Rate limiting error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      // Fail open - allow the request if Redis is down
      return { allowed: true }
    }
  }

  private async incrementCounter(key: string, ttl: number): Promise<number> {
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, ttl)
    }
    return count
  }

  async getRemainingQuota(
    organizationId: string,
    channel: Channel,
    config: RateLimitConfig
  ): Promise<{
    minuteRemaining: number
    hourRemaining: number
    dayRemaining: number
  }> {
    const now = Date.now()
    const minuteKey = `${this.keyPrefix}:${organizationId}:${channel}:minute:${Math.floor(now / 60000)}`
    const hourKey = `${this.keyPrefix}:${organizationId}:${channel}:hour:${Math.floor(now / 3600000)}`
    const dayKey = `${this.keyPrefix}:${organizationId}:${channel}:day:${Math.floor(now / 86400000)}`

    const [minuteCount, hourCount, dayCount] = await Promise.all([
      redis.get(minuteKey).then((v) => parseInt(v || '0')),
      redis.get(hourKey).then((v) => parseInt(v || '0')),
      redis.get(dayKey).then((v) => parseInt(v || '0')),
    ])

    return {
      minuteRemaining: Math.max(0, config.maxPerMinute - minuteCount),
      hourRemaining: Math.max(0, config.maxPerHour - hourCount),
      dayRemaining: Math.max(0, config.maxPerDay - dayCount),
    }
  }
}
