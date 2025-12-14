import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword } from 'better-auth/crypto'
import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'

export interface ApiKeyContext {
  apiKey: {
    id: string
    organizationId: string
    name: string
    scopes: string[]
  }
}

/**
 * Middleware to authenticate API requests using API keys
 */
export async function authenticateApiKey(
  request: NextRequest
): Promise<{ authenticated: boolean; context?: ApiKeyContext; error?: string }> {
  // Extract API key from Authorization header
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'Missing or invalid Authorization header',
    }
  }

  const apiKey = authHeader.substring(7) // Remove 'Bearer ' prefix

  if (!apiKey || apiKey.length < 32) {
    return {
      authenticated: false,
      error: 'Invalid API key format',
    }
  }

  try {
    // Extract key prefix (first 8 characters)
    const keyPrefix = apiKey.substring(0, 8)

    // Find API key by prefix
    const storedKeys = await prisma.apiKey.findMany({
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

    if (storedKeys.length === 0) {
      logger.warn('API key not found', { keyPrefix })
      return {
        authenticated: false,
        error: 'Invalid API key',
      }
    }

    // Check hash for each matching key
    let matchedKey = null
    for (const key of storedKeys) {
      const isMatch = await verifyPassword({ hash: key.keyHash, password: apiKey })
      if (isMatch) {
        matchedKey = key
        break
      }
    }

    if (!matchedKey) {
      logger.warn('API key hash mismatch', { keyPrefix })
      return {
        authenticated: false,
        error: 'Invalid API key',
      }
    }

    // Check if organization is active
    if (!matchedKey.organization.isActive) {
      logger.warn('Organization inactive', {
        organizationId: matchedKey.organizationId,
      })
      return {
        authenticated: false,
        error: 'Organization is inactive',
      }
    }

    // Check expiry
    if (matchedKey.expiresAt && matchedKey.expiresAt < new Date()) {
      logger.warn('API key expired', { keyId: matchedKey.id })
      return {
        authenticated: false,
        error: 'API key has expired',
      }
    }

    // Update usage stats (fire and forget)
    prisma.apiKey
      .update({
        where: { id: matchedKey.id },
        data: {
          lastUsedAt: new Date(),
          usageCount: { increment: 1 },
        },
      })
      .catch((error) => {
        logger.error('Failed to update API key usage', {
          error: error.message,
          keyId: matchedKey.id,
        })
      })

    logger.info('API key authenticated', {
      keyId: matchedKey.id,
      organizationId: matchedKey.organizationId,
    })

    return {
      authenticated: true,
      context: {
        apiKey: {
          id: matchedKey.id,
          organizationId: matchedKey.organizationId,
          name: matchedKey.name,
          scopes: matchedKey.scopes,
        },
      },
    }
  } catch (error) {
    logger.error('Error authenticating API key', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return {
      authenticated: false,
      error: 'Authentication failed',
    }
  }
}

/**
 * Check if API key has required scope
 */
export function hasScope(context: ApiKeyContext, requiredScope: string): boolean {
  return context.apiKey.scopes.includes('*') || context.apiKey.scopes.includes(requiredScope)
}

/**
 * Middleware wrapper for API routes
 */
export async function withApiKey(
  request: NextRequest,
  requiredScopes: string[] = []
): Promise<{ authorized: boolean; context?: ApiKeyContext; response?: NextResponse }> {
  const authResult = await authenticateApiKey(request)

  if (!authResult.authenticated) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      ),
    }
  }

  // Check scopes
  if (requiredScopes.length > 0) {
    const hasRequiredScopes = requiredScopes.every((scope) =>
      hasScope(authResult.context!, scope)
    )

    if (!hasRequiredScopes) {
      logger.warn('Insufficient API key scopes', {
        keyId: authResult.context!.apiKey.id,
        required: requiredScopes,
        actual: authResult.context!.apiKey.scopes,
      })
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        ),
      }
    }
  }

  return {
    authorized: true,
    context: authResult.context,
  }
}
