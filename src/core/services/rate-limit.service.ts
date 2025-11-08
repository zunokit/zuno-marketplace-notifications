import { Channel } from '@prisma/client'

import { redis } from '@/infrastructure/cache/redis.client'
import { logger } from '@/lib/logger/logger'

export interface RateLimitConfig {
  maxPerMinute: number
  maxPerHour: number
  maxPerDay: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
  limit: number
}

export class RateLimitService {
  private readonly defaultConfig: RateLimitConfig = {
    maxPerMinute: 100,
    maxPerHour: 1000,
    maxPerDay: 10000,
  }

  async checkRateLimit(
    organizationId: string,
    channel: Channel,
    config?: RateLimitConfig
  ): Promise<RateLimitResult> {
    const rateLimitConfig = config || this.defaultConfig

    // Check all time windows
    const minuteResult = await this.checkWindow(
      organizationId,
      channel,
      'minute',
      60,
      rateLimitConfig.maxPerMinute
    )

    if (!minuteResult.allowed) {
      return minuteResult
    }

    const hourResult = await this.checkWindow(
      organizationId,
      channel,
      'hour',
      3600,
      rateLimitConfig.maxPerHour
    )

    if (!hourResult.allowed) {
      return hourResult
    }

    const dayResult = await this.checkWindow(
      organizationId,
      channel,
      'day',
      86400,
      rateLimitConfig.maxPerDay
    )

    return dayResult
  }

  private async checkWindow(
    organizationId: string,
    channel: Channel,
    window: string,
    ttlSeconds: number,
    limit: number
  ): Promise<RateLimitResult> {
    try {
      await redis.connect()

      const key = this.generateKey(organizationId, channel, window)

      // Increment counter
      const current = await redis.incr(key)

      // Set expiry on first increment
      if (current === 1) {
        await redis.expire(key, ttlSeconds)
      }

      // Get TTL for reset time
      const ttl = await redis.ttl(key)
      const resetAt = new Date(Date.now() + ttl * 1000)

      const allowed = current <= limit
      const remaining = Math.max(0, limit - current)

      if (!allowed) {
        logger.warn('RateLimitService: Rate limit exceeded', {
          organizationId,
          channel,
          window,
          current,
          limit,
        })
      }

      return {
        allowed,
        remaining,
        resetAt,
        limit,
      }
    } catch (error) {
      logger.error('RateLimitService: Error checking rate limit', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      // Fail open - allow request if Redis fails
      return {
        allowed: true,
        remaining: 0,
        resetAt: new Date(),
        limit: 0,
      }
    }
  }

  private generateKey(
    organizationId: string,
    channel: Channel,
    window: string
  ): string {
    const timestamp = this.getWindowTimestamp(window)
    return `rate_limit:${organizationId}:${channel}:${window}:${timestamp}`
  }

  private getWindowTimestamp(window: string): string {
    const now = new Date()

    switch (window) {
      case 'minute':
        return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`
      case 'hour':
        return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`
      case 'day':
        return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
      default:
        return now.toISOString()
    }
  }

  async getRemainingQuota(
    organizationId: string,
    channel: Channel,
    config?: RateLimitConfig
  ): Promise<{
    minute: number
    hour: number
    day: number
  }> {
    const rateLimitConfig = config || this.defaultConfig

    await redis.connect()

    const minuteKey = this.generateKey(organizationId, channel, 'minute')
    const hourKey = this.generateKey(organizationId, channel, 'hour')
    const dayKey = this.generateKey(organizationId, channel, 'day')

    const minuteCurrent = parseInt((await redis.get(minuteKey)) || '0')
    const hourCurrent = parseInt((await redis.get(hourKey)) || '0')
    const dayCurrent = parseInt((await redis.get(dayKey)) || '0')

    return {
      minute: Math.max(0, rateLimitConfig.maxPerMinute - minuteCurrent),
      hour: Math.max(0, rateLimitConfig.maxPerHour - hourCurrent),
      day: Math.max(0, rateLimitConfig.maxPerDay - dayCurrent),
    }
  }

  async resetRateLimit(organizationId: string, channel: Channel): Promise<void> {
    await redis.connect()

    const windows = ['minute', 'hour', 'day']

    for (const window of windows) {
      const key = this.generateKey(organizationId, channel, window)
      await redis.del(key)
    }

    logger.info('RateLimitService: Rate limit reset', {
      organizationId,
      channel,
    })
  }
}
