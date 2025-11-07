import { NextRequest } from 'next/server'
import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'
import * as bcrypt from 'bcryptjs'

/**
 * Get authenticated user from request headers
 * (Set by middleware after session verification)
 */
export function getAuthenticatedUser(request: NextRequest): {
  userId: string
  userEmail: string
} | null {
  const userId = request.headers.get('x-user-id')
  const userEmail = request.headers.get('x-user-email')

  if (!userId || !userEmail) {
    return null
  }

  return {
    userId,
    userEmail,
  }
}

/**
 * Require authenticated user or throw 401
 */
export function requireAuth(request: NextRequest): {
  userId: string
  userEmail: string
} {
  const user = getAuthenticatedUser(request)

  if (!user) {
    throw new Error('Unauthorized: Authentication required')
  }

  return user
}

/**
 * Get user's organization membership
 */
export async function getUserOrganization(userId: string): Promise<{
  organizationId: string
  role: string
} | null> {
  const membership = await prisma.organizationMember.findFirst({
    where: {
      userId,
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc', // Get first/primary organization
    },
  })

  if (!membership || !membership.organization.isActive) {
    return null
  }

  return {
    organizationId: membership.organizationId,
    role: membership.role,
  }
}

/**
 * Require user to be member of organization
 */
export async function requireOrganizationMembership(
  userId: string
): Promise<{
  organizationId: string
  role: string
}> {
  const org = await getUserOrganization(userId)

  if (!org) {
    throw new Error('Forbidden: Not a member of any organization')
  }

  return org
}

/**
 * Check if user has specific role in organization
 */
export async function hasRole(
  userId: string,
  organizationId: string,
  allowedRoles: ('OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER')[]
): Promise<boolean> {
  const membership = await prisma.organizationMember.findFirst({
    where: {
      userId,
      organizationId,
      role: {
        in: allowedRoles,
      },
    },
  })

  return !!membership
}

/**
 * Require specific role or throw 403
 */
export async function requireRole(
  userId: string,
  organizationId: string,
  allowedRoles: ('OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER')[]
): Promise<void> {
  const hasRequiredRole = await hasRole(userId, organizationId, allowedRoles)

  if (!hasRequiredRole) {
    throw new Error(
      `Forbidden: Requires one of roles: ${allowedRoles.join(', ')}`
    )
  }
}

/**
 * Verify API key for webhook/external integrations
 */
export async function verifyApiKey(apiKey: string): Promise<{
  organizationId: string
  apiKeyId: string
  name: string
} | null> {
  try {
    // Find API key by prefix (first 8 chars)
    const keyPrefix = apiKey.substring(0, 8)

    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: {
        keyPrefix,
        isActive: true,
      },
      include: {
        organization: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
    })

    if (!apiKeyRecord || !apiKeyRecord.organization.isActive) {
      return null
    }

    // Verify full key with bcrypt
    const isValid = await bcrypt.compare(apiKey, apiKeyRecord.keyHash)

    if (!isValid) {
      return null
    }

    // Update last used timestamp and increment usage count
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: {
        lastUsedAt: new Date(),
        usageCount: {
          increment: 1,
        },
      },
    })

    logger.info('API key authenticated', {
      apiKeyId: apiKeyRecord.id,
      organizationId: apiKeyRecord.organizationId,
    })

    return {
      organizationId: apiKeyRecord.organizationId,
      apiKeyId: apiKeyRecord.id,
      name: apiKeyRecord.name,
    }
  } catch (error) {
    logger.error('Error verifying API key', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return null
  }
}

/**
 * Require valid API key or throw 401
 */
export async function requireApiKey(request: NextRequest): Promise<{
  organizationId: string
  apiKeyId: string
  name: string
}> {
  const apiKey = request.headers.get('x-api-key')

  if (!apiKey) {
    throw new Error('Unauthorized: API key required')
  }

  const apiKeyData = await verifyApiKey(apiKey)

  if (!apiKeyData) {
    throw new Error('Unauthorized: Invalid API key')
  }

  return apiKeyData
}

/**
 * Check if user owns a resource
 */
export async function checkResourceOwnership(
  userId: string,
  resourceType: 'price_alert' | 'watchlist' | 'notification',
  resourceId: string
): Promise<boolean> {
  switch (resourceType) {
    case 'price_alert': {
      const alert = await prisma.priceAlert.findFirst({
        where: { id: resourceId, userId },
      })
      return !!alert
    }
    case 'watchlist': {
      const watchlist = await prisma.watchlist.findFirst({
        where: { id: resourceId, userId },
      })
      return !!watchlist
    }
    case 'notification': {
      const notification = await prisma.notification.findFirst({
        where: { id: resourceId, userId },
      })
      return !!notification
    }
    default:
      return false
  }
}

/**
 * Require resource ownership or throw 403
 */
export async function requireResourceOwnership(
  userId: string,
  resourceType: 'price_alert' | 'watchlist' | 'notification',
  resourceId: string
): Promise<void> {
  const isOwner = await checkResourceOwnership(userId, resourceType, resourceId)

  if (!isOwner) {
    throw new Error('Forbidden: You do not own this resource')
  }
}
