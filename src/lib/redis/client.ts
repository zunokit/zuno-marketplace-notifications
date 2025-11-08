import { createClient } from 'redis'

import { env } from '@/lib/config/env'
import { logger } from '@/lib/logger/logger'

const globalForRedis = global as unknown as { redis: ReturnType<typeof createClient> }

export const redis =
  globalForRedis.redis ||
  createClient({
    url: env.REDIS_URL,
  })

if (!redis.isOpen) {
  redis
    .connect()
    .then(() => logger.info('Redis connected'))
    .catch((err) => logger.error('Redis connection error', { error: err.message }))
}

if (env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}

export default redis
