/**
 * API Layer Types
 *
 * Type definitions for API route handlers and middleware
 */

import { NextRequest, NextResponse } from 'next/server'
import { Role } from '@/infrastructure/database/generated'

/**
 * Authenticated user context
 */
export interface AuthContext {
  user: {
    id: string
    email: string
    name: string | null
    emailVerified: boolean
  }
  organization: {
    id: string
    name: string
    slug: string
    role: Role
  }
  session: {
    id: string
    expiresAt: Date
  }
}

/**
 * API key authentication context
 */
export interface ApiKeyContext {
  apiKey: {
    id: string
    name: string
  }
  organization: {
    id: string
  }
}

/**
 * Route handler with authentication context
 */
export type AuthenticatedRouteHandler<TParams = unknown> = (
  request: NextRequest,
  context: AuthContext,
  params: TParams
) => Promise<NextResponse> | NextResponse

/**
 * Route handler with API key context
 */
export type ApiKeyRouteHandler<TParams = unknown> = (
  request: NextRequest,
  context: ApiKeyContext,
  params: TParams
) => Promise<NextResponse> | NextResponse

/**
 * Standard Next.js route params
 */
export interface RouteParams<T = Record<string, string>> {
  params: T
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string
  details?: unknown
  correlationId?: string
}

/**
 * Success response structure
 */
export interface SuccessResponse<T = unknown> {
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}
