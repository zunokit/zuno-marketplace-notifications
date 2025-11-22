/**
 * Authentication Middleware Tests
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { authenticate, requireAuthentication } from '@/lib/middleware/auth.middleware'
import { auth } from '@/lib/auth/better-auth'
import { prisma } from '@/infrastructure/database/prisma'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/auth/better-auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}))

jest.mock('@/infrastructure/database/prisma', () => ({
  prisma: {
    organizationMember: {
      findFirst: jest.fn(),
    },
  },
}))

jest.mock('@/lib/logger/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

// Helper to create mock request
const createMockRequest = (): NextRequest =>
  ({
    headers: new Headers(),
    nextUrl: {
      pathname: '/api/test',
    },
    method: 'POST',
    url: 'http://localhost:3000/api/test',
  }) as any

// Typed mock helpers
const mockGetSession = auth.api.getSession as unknown as jest.Mock
const mockFindFirst = prisma.organizationMember.findFirst as unknown as jest.Mock

describe('authenticate', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    mockRequest = createMockRequest()
    jest.clearAllMocks()
  })

  it('returns null when no session exists', async () => {
    mockGetSession.mockResolvedValue(null)

    const result = await authenticate(mockRequest)

    expect(result).toBeNull()
  })

  it('returns null when session is invalid', async () => {
    mockGetSession.mockResolvedValue({
      user: null,
      session: null,
    })

    const result = await authenticate(mockRequest)

    expect(result).toBeNull()
  })

  it('returns null when user has no organization membership', async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
      },
      session: {
        id: 'session-123',
        expiresAt: new Date('2025-12-31'),
      },
    })

    mockFindFirst.mockResolvedValue(null)

    const result = await authenticate(mockRequest)

    expect(result).toBeNull()
  })

  it('returns null when organization is inactive', async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
      },
      session: {
        id: 'session-123',
        expiresAt: new Date('2025-12-31'),
      },
    })

    mockFindFirst.mockResolvedValue({
      organizationId: 'org-123',
      role: 'OWNER',
      organization: {
        id: 'org-123',
        name: 'Test Org',
        slug: 'test-org',
        isActive: false, // Inactive organization
      },
    })

    const result = await authenticate(mockRequest)

    expect(result).toBeNull()
  })

  it('returns auth context with valid session and organization', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
      },
      session: {
        id: 'session-123',
        expiresAt: new Date('2025-12-31'),
      },
    }

    const mockMembership = {
      organizationId: 'org-123',
      role: 'OWNER' as const,
      organization: {
        id: 'org-123',
        name: 'Test Org',
        slug: 'test-org',
        isActive: true,
      },
    }

    mockGetSession.mockResolvedValue(mockSession)
    mockFindFirst.mockResolvedValue(mockMembership)

    const result = await authenticate(mockRequest)

    expect(result).toEqual({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
      },
      organization: {
        id: 'org-123',
        name: 'Test Org',
        slug: 'test-org',
        role: 'OWNER',
      },
      session: {
        id: 'session-123',
        expiresAt: mockSession.session.expiresAt,
      },
    })
  })

  it('handles null user name gracefully', async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: null, // Null name
        emailVerified: false,
      },
      session: {
        id: 'session-123',
        expiresAt: new Date('2025-12-31'),
      },
    })

    mockFindFirst.mockResolvedValue({
      organizationId: 'org-123',
      role: 'VIEWER',
      organization: {
        id: 'org-123',
        name: 'Test Org',
        slug: 'test-org',
        isActive: true,
      },
    })

    const result = await authenticate(mockRequest)

    expect(result).not.toBeNull()
    expect(result?.user.name).toBeNull()
  })

  it('returns null and logs error on database failure', async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
      },
      session: {
        id: 'session-123',
        expiresAt: new Date('2025-12-31'),
      },
    })

    mockFindFirst.mockRejectedValue(new Error('Database connection failed'))

    const result = await authenticate(mockRequest)

    expect(result).toBeNull()
  })

  it('queries organization membership with correct parameters', async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
      },
      session: {
        id: 'session-123',
        expiresAt: new Date('2025-12-31'),
      },
    })

    mockFindFirst.mockResolvedValue({
      organizationId: 'org-123',
      role: 'ADMIN',
      organization: {
        id: 'org-123',
        name: 'Test Org',
        slug: 'test-org',
        isActive: true,
      },
    })

    await authenticate(mockRequest)

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        userId: 'user-123',
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
        createdAt: 'asc',
      },
    })
  })
})

describe('requireAuthentication', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    mockRequest = createMockRequest()
    jest.clearAllMocks()
  })

  it('throws error when authentication fails', async () => {
    mockGetSession.mockResolvedValue(null)

    await expect(requireAuthentication(mockRequest)).rejects.toThrow(
      'Unauthorized: Valid session required'
    )
  })

  it('returns auth context when authenticated', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
      },
      session: {
        id: 'session-123',
        expiresAt: new Date('2025-12-31'),
      },
    }

    const mockMembership = {
      organizationId: 'org-123',
      role: 'EDITOR' as const,
      organization: {
        id: 'org-123',
        name: 'Test Org',
        slug: 'test-org',
        isActive: true,
      },
    }

    mockGetSession.mockResolvedValue(mockSession)
    mockFindFirst.mockResolvedValue(mockMembership)

    const result = await requireAuthentication(mockRequest)

    expect(result).toEqual({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
      },
      organization: {
        id: 'org-123',
        name: 'Test Org',
        slug: 'test-org',
        role: 'EDITOR',
      },
      session: {
        id: 'session-123',
        expiresAt: mockSession.session.expiresAt,
      },
    })
  })
})
