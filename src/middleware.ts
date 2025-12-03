// @ts-expect-error - better-fetch doesn't export types
import { betterFetch } from 'better-fetch'
import type { Session } from 'better-auth/types'
import { NextResponse, type NextRequest } from 'next/server'

import { env } from '@/lib/config/env'

// Routes that require authentication
const protectedRoutes = [
  '/admin',
  '/api/notifications',
  '/api/price-alerts',
  '/api/watchlist',
  '/api/drops',
  '/api/templates',
  '/api/webhooks',
  '/api/preferences',
]

// Routes that are public
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/api/auth',
  '/api/metrics', // Prometheus metrics endpoint (should be protected by network firewall)
]

// Webhook routes that use API key authentication instead of session
const webhookRoutes = [
  '/api/webhooks/price-change',
  '/api/webhooks/floor-price-drop',
  '/api/webhooks/nft-listed',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Handle webhook routes with API key authentication
  if (webhookRoutes.some((route) => pathname.startsWith(route))) {
    const apiKey = request.headers.get('x-api-key')

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'API key required' },
        { status: 401 }
      )
    }

    // Verify API key (will be checked in route handler)
    // Just pass through here, actual verification in route
    return NextResponse.next()
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Check for session
  const { data: session } = await betterFetch<Session>(
    '/api/auth/get-session',
    {
      baseURL: env.BETTER_AUTH_URL,
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    }
  )

  // No session - redirect to login for pages, 401 for API
  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check admin routes
  if (pathname.startsWith('/admin')) {
    // Check if user has admin role
    // Note: Better Auth admin plugin adds isAdmin to session
    const user = session.user as { id: string; email: string; isAdmin?: boolean }
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }
  }

  // Add user info to headers for API routes to access
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', session.user.id)
  requestHeaders.set('x-user-email', session.user.email)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
