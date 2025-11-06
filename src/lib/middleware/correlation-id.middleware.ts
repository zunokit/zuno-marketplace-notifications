import { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'
import { logger } from '@/lib/logger/logger'

export const CORRELATION_ID_HEADER = 'x-correlation-id'

/**
 * Get or generate a correlation ID for request tracking
 */
export function getOrGenerateCorrelationId(request: NextRequest): string {
  // Try to get correlation ID from header
  const existingId = request.headers.get(CORRELATION_ID_HEADER)

  if (existingId) {
    return existingId
  }

  // Generate new correlation ID
  const correlationId = `corr_${nanoid(16)}`

  return correlationId
}

/**
 * Add correlation ID to logger context
 */
export function withCorrelationId<T>(
  _correlationId: string,
  fn: () => T
): T {
  // In a production environment, you'd use AsyncLocalStorage or similar
  // to propagate the correlation ID through the call stack
  return fn()
}

/**
 * Extract request metadata for logging
 */
export function extractRequestMetadata(request: NextRequest) {
  return {
    method: request.method,
    url: request.url,
    pathname: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
  }
}

/**
 * Middleware wrapper that adds correlation ID to all requests
 */
export function withRequestTracking(
  handler: (request: NextRequest, correlationId: string) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    const correlationId = getOrGenerateCorrelationId(request)
    const metadata = extractRequestMetadata(request)

    logger.info('Incoming request', {
      correlationId,
      ...metadata,
    })

    const startTime = Date.now()

    try {
      const response = await handler(request, correlationId)

      const duration = Date.now() - startTime

      logger.info('Request completed', {
        correlationId,
        status: response.status,
        duration,
      })

      // Add correlation ID to response headers
      response.headers.set(CORRELATION_ID_HEADER, correlationId)

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      logger.error('Request failed', {
        correlationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
      })

      throw error
    }
  }
}
