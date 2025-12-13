/**
 * Route Authorization Wrapper
 *
 * Higher-order function that wraps authenticated route handlers with
 * authorization checks for specific resources.
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthContext } from '@/lib/api/types'
import {
  authorizationService,
  ResourceType,
  Action,
} from '@/lib/authorization/authorization.service'
import { logger } from '@/lib/logger/logger'

/**
 * Configuration for authorization wrapper
 */
export interface AuthorizationConfig {
  resource: ResourceType
  action: Action
  /**
   * Function to extract resource ID from route params
   * Defaults to params.id if not provided
   */
  getResourceId?: (params: unknown) => string
}

/**
 * Authorized route handler type
 *
 * Handler receives request, auth context, and route params
 * Authorization is already validated - resource exists and user has permission
 */
export type AuthorizedRouteHandler<TParams = unknown> = (
  request: NextRequest,
  context: AuthContext,
  params: TParams
) => Promise<NextResponse> | NextResponse

/**
 * Wrap authenticated route handler with authorization checks
 *
 * Must be used AFTER withAuth() - requires AuthContext from authentication.
 * Validates resource ownership and role permissions before calling handler.
 *
 * @param config - Authorization configuration (resource type, action)
 * @param handler - Route handler to call if authorized
 * @returns Wrapped handler with authorization
 *
 * @example
 * ```typescript
 * // Compose with withAuth
 * export const GET = withAuth(
 *   withAuthorization(
 *     { resource: 'notification', action: 'read' },
 *     async (request, context, params) => {
 *       // User is authenticated AND authorized to read this notification
 *       const notification = await getNotification(params.id)
 *       return NextResponse.json(notification)
 *     }
 *   )
 * )
 *
 * // Custom resource ID extraction
 * export const DELETE = withAuth(
 *   withAuthorization(
 *     {
 *       resource: 'template',
 *       action: 'delete',
 *       getResourceId: (params) => params.templateId
 *     },
 *     async (request, context, params) => {
 *       await deleteTemplate(params.templateId)
 *       return NextResponse.json({ success: true })
 *     }
 *   )
 * )
 * ```
 */
export function withAuthorization<TParams extends { id: string }>(
  config: AuthorizationConfig,
  handler: AuthorizedRouteHandler<TParams>
): (
  request: NextRequest,
  context: AuthContext,
  params: TParams
) => Promise<NextResponse> {
  return async (
    request: NextRequest,
    context: AuthContext,
    params: TParams
  ): Promise<NextResponse> => {
    const { resource, action, getResourceId } = config

    // Extract resource ID from params
    const resourceId = getResourceId
      ? getResourceId(params)
      : (params as { id: string }).id

    if (!resourceId) {
      logger.error('Resource ID not found in params', {
        resource,
        params,
      })
      return NextResponse.json(
        { error: 'Invalid resource ID' },
        { status: 400 }
      )
    }

    // Perform authorization check
    const authorized = await authorizationService.authorize(
      {
        userId: context.user.id,
        organizationId: context.organization.id,
        role: context.organization.role,
      },
      resource,
      resourceId,
      action
    )

    if (!authorized) {
      logger.warn('Authorization denied', {
        userId: context.user.id,
        organizationId: context.organization.id,
        role: context.organization.role,
        resource,
        resourceId,
        action,
        path: request.nextUrl.pathname,
      })

      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions or resource not found' },
        { status: 403 }
      )
    }

    // Authorization passed - call handler
    return await handler(request, context, params)
  }
}

/**
 * Helper to compose withAuth and withAuthorization
 *
 * Syntactic sugar for common pattern of auth + authz
 *
 * @param config - Authorization configuration
 * @param handler - Authorized route handler
 * @returns Fully wrapped handler (auth + authz)
 *
 * @example
 * ```typescript
 * import { withAuthAndAuthorization } from '@/lib/api/with-authorization'
 *
 * export const DELETE = withAuthAndAuthorization(
 *   { resource: 'notification', action: 'delete' },
 *   async (request, context, params) => {
 *     await deleteNotification(params.id)
 *     return NextResponse.json({ success: true })
 *   }
 * )
 * ```
 */
export function withAuthAndAuthorization<TParams extends { id: string }>(
  config: AuthorizationConfig,
  handler: AuthorizedRouteHandler<TParams>
) {
  // Import withAuth dynamically to avoid circular dependency
  const { withAuth } = require('@/lib/api/route-handler')
  return withAuth(withAuthorization(config, handler))
}
