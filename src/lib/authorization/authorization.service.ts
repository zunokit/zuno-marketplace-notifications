/**
 * Authorization Service
 *
 * Provides role-based access control (RBAC) and resource ownership validation.
 * Ensures users can only access resources within their organization and
 * according to their role permissions.
 */

import { Role } from '@/infrastructure/database/generated'
import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'

/**
 * Authorization context from authenticated session
 */
export interface AuthorizationContext {
  userId: string
  organizationId: string
  role: Role
}

/**
 * Resource types that can be authorized
 */
export type ResourceType = 'notification' | 'template' | 'price_alert' | 'watchlist'

/**
 * Actions that can be performed on resources
 */
export type Action = 'read' | 'write' | 'delete'

/**
 * Role-based permission matrix
 *
 * Defines what actions each role can perform
 */
const ROLE_PERMISSIONS: Record<Role, Action[]> = {
  OWNER: ['read', 'write', 'delete'],
  ADMIN: ['read', 'write', 'delete'],
  EDITOR: ['read', 'write'],
  VIEWER: ['read'],
}

/**
 * Authorization service for RBAC and ownership validation
 *
 * @example
 * ```typescript
 * const authorized = await authz.authorize(
 *   { userId: 'user-1', organizationId: 'org-1', role: 'EDITOR' },
 *   'notification',
 *   'notif-123',
 *   'write'
 * )
 * ```
 */
export class AuthorizationService {
  /**
   * Check if user is authorized to perform action on resource
   *
   * Validates both:
   * 1. Resource belongs to user's organization (multi-tenant isolation)
   * 2. User's role has permission for the action (RBAC)
   *
   * @param context - Authorization context (user, org, role)
   * @param resourceType - Type of resource being accessed
   * @param resourceId - ID of the specific resource
   * @param action - Action being performed (read/write/delete)
   * @returns True if authorized, false otherwise
   */
  async authorize(
    context: AuthorizationContext,
    resourceType: ResourceType,
    resourceId: string,
    action: Action
  ): Promise<boolean> {
    try {
      // Step 1: Check role permissions (fast, in-memory)
      if (!this.hasPermission(context.role, action)) {
        logger.warn('Insufficient role permissions', {
          userId: context.userId,
          role: context.role,
          action,
          resourceType,
          resourceId,
        })
        return false
      }

      // Step 2: Verify resource belongs to user's organization (database query)
      const belongsToOrg = await this.verifyOrganizationOwnership(
        resourceType,
        resourceId,
        context.organizationId
      )

      if (!belongsToOrg) {
        logger.warn('Resource does not belong to user organization', {
          userId: context.userId,
          organizationId: context.organizationId,
          resourceType,
          resourceId,
        })
        return false
      }

      logger.debug('Authorization granted', {
        userId: context.userId,
        organizationId: context.organizationId,
        role: context.role,
        resourceType,
        resourceId,
        action,
      })

      return true
    } catch (error) {
      logger.error('Authorization check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: context.userId,
        resourceType,
        resourceId,
        action,
      })

      // Fail closed - deny access on errors
      return false
    }
  }

  /**
   * Check if role has permission for action
   *
   * @param role - User's role
   * @param action - Action to perform
   * @returns True if role has permission
   */
  private hasPermission(role: Role, action: Action): boolean {
    const permissions = ROLE_PERMISSIONS[role]
    return permissions.includes(action)
  }

  /**
   * Verify resource belongs to organization
   *
   * @param resourceType - Type of resource
   * @param resourceId - Resource ID
   * @param organizationId - Organization ID to verify against
   * @returns True if resource belongs to organization
   */
  private async verifyOrganizationOwnership(
    resourceType: ResourceType,
    resourceId: string,
    organizationId: string
  ): Promise<boolean> {
    switch (resourceType) {
      case 'notification': {
        const notification = await prisma.notification.findUnique({
          where: { id: resourceId },
          select: { organizationId: true },
        })
        return notification?.organizationId === organizationId
      }

      case 'template': {
        const template = await prisma.template.findUnique({
          where: { id: resourceId },
          select: { organizationId: true },
        })
        return template?.organizationId === organizationId
      }

      case 'price_alert': {
        const alert = await prisma.priceAlert.findUnique({
          where: { id: resourceId },
          select: { organizationId: true },
        })
        return alert?.organizationId === organizationId
      }

      case 'watchlist': {
        const watchlist = await prisma.watchlist.findUnique({
          where: { id: resourceId },
          select: { organizationId: true },
        })
        return watchlist?.organizationId === organizationId
      }

      default: {
        logger.error('Unknown resource type', { resourceType })
        return false
      }
    }
  }

  /**
   * Get permissions for a role
   *
   * @param role - Role to get permissions for
   * @returns Array of allowed actions
   */
  getPermissionsForRole(role: Role): Action[] {
    return ROLE_PERMISSIONS[role]
  }

  /**
   * Check if user can perform action (role check only, no resource)
   *
   * Useful for checking general capabilities without specific resource
   *
   * @param role - User's role
   * @param action - Action to check
   * @returns True if role can perform action
   */
  canPerformAction(role: Role, action: Action): boolean {
    return this.hasPermission(role, action)
  }
}

/**
 * Singleton instance
 */
export const authorizationService = new AuthorizationService()
