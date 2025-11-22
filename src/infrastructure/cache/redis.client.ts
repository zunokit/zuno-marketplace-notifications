import { createClient, RedisClientType } from 'redis'

import { env } from '@/lib/config/env'
import { logger } from '@/lib/logger/logger'

class RedisClient {
  private static instance: RedisClient
  private client: RedisClientType | null = null
  private isConnected = false

  private constructor() {}

  static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient()
    }
    return RedisClient.instance
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return
    }

    try {
      this.client = createClient({
        url: env.REDIS_URL,
      })

      this.client.on('error', (error) => {
        logger.error('Redis: Connection error', { error: error.message })
      })

      this.client.on('connect', () => {
        logger.info('Redis: Connected')
      })

      this.client.on('disconnect', () => {
        logger.warn('Redis: Disconnected')
        this.isConnected = false
      })

      await this.client.connect()
      this.isConnected = true

      logger.info('Redis: Client initialized')
    } catch (error) {
      logger.error('Redis: Initialization failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit()
      this.isConnected = false
      logger.info('Redis: Disconnected')
    }
  }

  getClient(): RedisClientType {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected')
    }
    return this.client
  }

  async get(key: string): Promise<string | null> {
    const client = this.getClient()
    return client.get(key)
  }

  async set(
    key: string,
    value: string,
    options?: { EX?: number; PX?: number }
  ): Promise<void> {
    const client = this.getClient()
    if (options?.EX) {
      await client.set(key, value, { EX: options.EX })
    } else if (options?.PX) {
      await client.set(key, value, { PX: options.PX })
    } else {
      await client.set(key, value)
    }
  }

  async del(key: string): Promise<void> {
    const client = this.getClient()
    await client.del(key)
  }

  async incr(key: string): Promise<number> {
    const client = this.getClient()
    return client.incr(key)
  }

  async expire(key: string, seconds: number): Promise<void> {
    const client = this.getClient()
    await client.expire(key, seconds)
  }

  async ttl(key: string): Promise<number> {
    const client = this.getClient()
    return client.ttl(key)
  }

  async exists(key: string): Promise<boolean> {
    const client = this.getClient()
    const result = await client.exists(key)
    return result === 1
  }
}

export const redis = RedisClient.getInstance()
