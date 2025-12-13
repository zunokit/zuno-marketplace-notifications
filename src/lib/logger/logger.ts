import winston from 'winston'

import { env } from '@/lib/config/env'

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
)

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  levels,
  format,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
})

// Context logger with correlation ID
export function createContextLogger(correlationId: string) {
  return {
    debug: (message: string, meta?: Record<string, unknown>) =>
      logger.debug(message, { correlationId, ...meta }),
    info: (message: string, meta?: Record<string, unknown>) =>
      logger.info(message, { correlationId, ...meta }),
    warn: (message: string, meta?: Record<string, unknown>) =>
      logger.warn(message, { correlationId, ...meta }),
    error: (message: string, meta?: Record<string, unknown>) =>
      logger.error(message, { correlationId, ...meta }),
  }
}
