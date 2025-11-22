/**
 * Authentication Middleware Tests
 */

import { authenticate, requireAuthentication } from '@/lib/middleware/auth.middleware'
import { auth } from '@/lib/auth/better-auth'
import { prisma } from '@/infrastructure/database/prisma'

// Mock NextRequest for Jest environment
const createMockRequest = () => ({
  headers: new Headers(),
  nextUrl: {
    pathname: '/api/test',
  },
  method: 'POST',
  url: 'http://localhost:3000/api/test',
})

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

describe('authenticate', () => {
  let mockRequest: ReturnType<typeof createMockRequest>

  beforeEach(() => {
    mockRequest = createMockRequest()
    jest.clearAllMocks()
  })

  it('returns null when no session exists', async () => {
    ;(auth.api.getSession as jest.Mock).mockResolvedValue(null)

    const result = await authenticate(mockRequest)

    expect(result).toBeNull()
  })

  it('returns null when session is invalid', async () => {
    ;(auth.api.getSession as jest.Mock).mockResolvedValue({
      user: null,
      session: null,
    })

    const result = await authenticate(mockRequest)

    expect(result).toBeNull()
  })

  it('returns null when user has no organization membership', async () => {
    ;(auth.api.getSession as jest.Mock).mockResolvedValue({
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

    ;(prisma.organizationMember.findFirst as jest.Mock).mockResolvedValue(null)

    const result = await authenticate(mockRequest)

    expect(result).toBeNull()
  })

  it('returns null when organization is inactive', async () => {
    ;(auth.api.getSession as jest.Mock).mockResolvedValue({
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

    ;(prisma.organizationMember.findFirst as jest.Mock).mockResolvedValue({
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

    ;(auth.api.getSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.organizationMember.findFirst as jest.Mock).mockResolvedValue(mockMembership)

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
    ;(auth.api.getSession as jest.Mock).mockResolvedValue({
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

    ;(prisma.organizationMember.findFirst as jest.Mock).mockResolvedValue({
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
    ;(auth.api.getSession as jest.Mock).mockResolvedValue({
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

    ;(prisma.organizationMember.findFirst as jest.Mock).mockRejectedValue(
      new Error('Database connection failed')
    )

    const result = await authenticate(mockRequest)

    expect(result).toBeNull()
  })

  it('queries organization membership with correct parameters', async () => {
    ;(auth.api.getSession as jest.Mock).mockResolvedValue({
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

    ;(prisma.organizationMember.findFirst as jest.Mock).mockResolvedValue({
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

    expect(prisma.organizationMember.findFirst).toHaveBeenCalledWith({
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
  let mockRequest: ReturnType<typeof createMockRequest>

  beforeEach(() => {
    mockRequest = createMockRequest()
    jest.clearAllMocks()
  })

  it('throws error when authentication fails', async () => {
    ;(auth.api.getSession as jest.Mock).mockResolvedValue(null)

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

    ;(auth.api.getSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.organizationMember.findFirst as jest.Mock).mockResolvedValue(mockMembership)

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
