/**
 * Authentication Middleware
 *
 * Handles session validation and organization membership extraction
 * for API route handlers.
 */

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/better-auth'
import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'
import { AuthContext } from '@/lib/api/types'

/**
 * Extract and validate authentication from request
 *
 * @param request - Next.js request object
 * @returns AuthContext if authenticated, null otherwise
 *
 * @example
 * ```typescript
 * const authContext = await authenticate(request)
 * if (!authContext) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 * }
 * ```
 */
export async function authenticate(
  request: NextRequest
): Promise<AuthContext | null> {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || !session.user || !session.session) {
      logger.debug('No valid session found')
      return null
    }

    // Get user's primary organization membership
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Get oldest (primary) organization
      },
    })

    if (!membership) {
      logger.warn('User has no organization membership', {
        userId: session.user.id,
      })
      return null
    }

    if (!membership.organization.isActive) {
      logger.warn('User organization is inactive', {
        userId: session.user.id,
        organizationId: membership.organizationId,
      })
      return null
    }

    logger.debug('User authenticated successfully', {
      userId: session.user.id,
      organizationId: membership.organizationId,
      role: membership.role,
    })

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? null,
        emailVerified: session.user.emailVerified,
      },
      organization: {
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
        role: membership.role,
      },
      session: {
        id: session.session.id,
        expiresAt: session.session.expiresAt,
      },
    }
  } catch (error) {
    logger.error('Authentication error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return null
  }
}

/**
 * Extract authentication from request or throw error
 *
 * @param request - Next.js request object
 * @returns AuthContext
 * @throws Error if not authenticated
 *
 * @example
 * ```typescript
 * try {
 *   const context = await requireAuthentication(request)
 *   // Use context.user, context.organization
 * } catch (error) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 * }
 * ```
 */
export async function requireAuthentication(
  request: NextRequest
): Promise<AuthContext> {
  const authContext = await authenticate(request)

  if (!authContext) {
    throw new Error('Unauthorized: Valid session required')
  }

  return authContext
}
