/**
 * Route Handler Wrappers
 *
 * Higher-order functions that wrap Next.js route handlers with
 * authentication, error handling, and logging.
 */

import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { authenticate } from '@/lib/middleware/auth.middleware'
import { logger } from '@/lib/logger/logger'
import {
  AuthenticatedRouteHandler,
  ErrorResponse,
  RouteParams,
} from '@/lib/api/types'

/**
 * Wrap route handler with authentication
 *
 * Automatically extracts and validates session, provides AuthContext to handler.
 * Handles errors and returns appropriate HTTP responses.
 *
 * @param handler - Authenticated route handler function
 * @returns Next.js route handler
 *
 * @example
 * ```typescript
 * export const POST = withAuth(async (request, { user, organization }) => {
 *   const body = await request.json()
 *
 *   // Use organization.id instead of hardcoded value
 *   const notification = await createNotification({
 *     organizationId: organization.id,
 *     userId: user.id,
 *     ...body
 *   })
 *
 *   return NextResponse.json(notification, { status: 201 })
 * })
 * ```
 */
export function withAuth<TParams = unknown>(
  handler: AuthenticatedRouteHandler<TParams>
) {
  return async (
    request: NextRequest,
    routeParams?: RouteParams<TParams>
  ): Promise<NextResponse> => {
    const correlationId = nanoid()
    const startTime = Date.now()

    try {
      // Extract authentication context
      const authContext = await authenticate(request)

      if (!authContext) {
        logger.warn('Unauthorized access attempt', {
          correlationId,
          path: request.nextUrl.pathname,
          method: request.method,
        })

        return NextResponse.json<ErrorResponse>(
          {
            error: 'Unauthorized',
            correlationId,
          },
          { status: 401 }
        )
      }

      logger.info('Request authenticated', {
        correlationId,
        userId: authContext.user.id,
        organizationId: authContext.organization.id,
        path: request.nextUrl.pathname,
        method: request.method,
      })

      // Call the actual handler with auth context
      const response = await handler(
        request,
        authContext,
        routeParams?.params as TParams
      )

      const duration = Date.now() - startTime

      logger.info('Request completed', {
        correlationId,
        userId: authContext.user.id,
        status: response.status,
        duration,
      })

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      logger.error('Request failed', {
        correlationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        path: request.nextUrl.pathname,
        method: request.method,
        duration,
      })

      // Don't leak internal errors to client
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Internal server error',
          correlationId,
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Wrap route handler with optional authentication
 *
 * Similar to withAuth but allows unauthenticated requests.
 * AuthContext will be null if not authenticated.
 *
 * @param handler - Route handler that accepts optional AuthContext
 * @returns Next.js route handler
 *
 * @example
 * ```typescript
 * export const GET = withOptionalAuth(async (request, authContext) => {
 *   if (authContext) {
 *     // Authenticated user - return personalized data
 *     return getPersonalizedData(authContext.user.id)
 *   } else {
 *     // Anonymous user - return public data
 *     return getPublicData()
 *   }
 * })
 * ```
 */
export function withOptionalAuth<TParams = unknown>(
  handler: (
    request: NextRequest,
    authContext: Awaited<ReturnType<typeof authenticate>>,
    params?: TParams
  ) => Promise<NextResponse> | NextResponse
) {
  return async (
    request: NextRequest,
    routeParams?: RouteParams<TParams>
  ): Promise<NextResponse> => {
    const correlationId = nanoid()
    const startTime = Date.now()

    try {
      // Try to extract authentication, but don't fail if not present
      const authContext = await authenticate(request)

      logger.info('Request received', {
        correlationId,
        authenticated: !!authContext,
        userId: authContext?.user.id,
        path: request.nextUrl.pathname,
        method: request.method,
      })

      const response = await handler(
        request,
        authContext,
        routeParams?.params as TParams
      )

      const duration = Date.now() - startTime

      logger.info('Request completed', {
        correlationId,
        status: response.status,
        duration,
      })

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      logger.error('Request failed', {
        correlationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        path: request.nextUrl.pathname,
        method: request.method,
        duration,
      })

      return NextResponse.json<ErrorResponse>(
        {
          error: 'Internal server error',
          correlationId,
        },
        { status: 500 }
      )
    }
  }
}
