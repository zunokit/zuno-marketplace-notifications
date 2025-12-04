/**
 * API Key Authentication Middleware Tests
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock next/server before importing anything
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body: any, init?: any) => ({
      status: init?.status || 200,
      json: async () => body,
    })),
  },
}))

// Mock dependencies
jest.mock('@/infrastructure/database/prisma', () => ({
  prisma: {
    apiKey: {
      findMany: jest.fn(),
      update: jest.fn(),
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

jest.mock('better-auth/crypto', () => ({
  verifyPassword: jest.fn(),
}))

import {
  authenticateApiKey,
  hasScope,
  withApiKey,
  ApiKeyContext,
} from '@/lib/middleware/api-key.middleware'
import { prisma } from '@/infrastructure/database/prisma'
import { verifyPassword } from 'better-auth/crypto'

// Helper to create mock request with Authorization header
const createMockRequest = (authHeader?: string): any => {
  const headers = new Headers()
  if (authHeader) {
    headers.set('Authorization', authHeader)
  }
  return {
    headers,
    nextUrl: {
      pathname: '/api/notifications',
    },
    method: 'POST',
    url: 'http://localhost:3000/api/notifications',
  }
}

// Typed mock helpers
const mockFindMany = prisma.apiKey.findMany as unknown as jest.Mock
const mockUpdate = prisma.apiKey.update as unknown as jest.Mock
const mockVerifyPassword = verifyPassword as unknown as jest.Mock

describe('authenticateApiKey', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Missing or Invalid Authorization Header', () => {
    it('returns error when Authorization header is missing', async () => {
      const request = createMockRequest()

      const result = await authenticateApiKey(request)

      expect(result.authenticated).toBe(false)
      expect(result.error).toBe('Missing or invalid Authorization header')
      expect(result.context).toBeUndefined()
    })

    it('returns error when Authorization header does not start with Bearer', async () => {
      const request = createMockRequest('Basic sometoken')

      const result = await authenticateApiKey(request)

      expect(result.authenticated).toBe(false)
      expect(result.error).toBe('Missing or invalid Authorization header')
    })

    it('returns error when Authorization header is just "Bearer"', async () => {
      const request = createMockRequest('Bearer ')

      const result = await authenticateApiKey(request)

      expect(result.authenticated).toBe(false)
      // "Bearer " passes startsWith check, but empty API key after substring fails
      expect(result.error).toBe('Missing or invalid Authorization header')
    })

    it('returns error when API key is too short (less than 32 characters)', async () => {
      const request = createMockRequest('Bearer short_key')

      const result = await authenticateApiKey(request)

      expect(result.authenticated).toBe(false)
      expect(result.error).toBe('Invalid API key format')
    })
  })

  describe('API Key Not Found', () => {
    it('returns error when no API key matches the prefix', async () => {
      const apiKey = 'zuno_test1234567890123456789012345'
      const request = createMockRequest(`Bearer ${apiKey}`)

      mockFindMany.mockResolvedValue([])

      const result = await authenticateApiKey(request)

      expect(result.authenticated).toBe(false)
      expect(result.error).toBe('Invalid API key')
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          keyPrefix: 'zuno_tes',
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
    })
  })

  describe('API Key Hash Mismatch', () => {
    it('returns error when hash does not match', async () => {
      const apiKey = 'zuno_test1234567890123456789012345'
      const request = createMockRequest(`Bearer ${apiKey}`)

      mockFindMany.mockResolvedValue([
        {
          id: 'key-1',
          keyPrefix: 'zuno_tes',
          keyHash: 'hashedKey',
          organizationId: 'org-123',
          scopes: ['*'],
          name: 'Test Key',
          isActive: true,
          expiresAt: null,
          organization: {
            id: 'org-123',
            isActive: true,
          },
        },
      ])

      mockVerifyPassword.mockResolvedValue(false)

      const result = await authenticateApiKey(request)

      expect(result.authenticated).toBe(false)
      expect(result.error).toBe('Invalid API key')
    })

    it('tries all matching keys until one matches', async () => {
      const apiKey = 'zuno_test1234567890123456789012345'
      const request = createMockRequest(`Bearer ${apiKey}`)

      mockFindMany.mockResolvedValue([
        {
          id: 'key-1',
          keyPrefix: 'zuno_tes',
          keyHash: 'hashedKey1',
          organizationId: 'org-123',
          scopes: ['read'],
          name: 'Test Key 1',
          isActive: true,
          expiresAt: null,
          organization: {
            id: 'org-123',
            isActive: true,
          },
        },
        {
          id: 'key-2',
          keyPrefix: 'zuno_tes',
          keyHash: 'hashedKey2',
          organizationId: 'org-456',
          scopes: ['*'],
          name: 'Test Key 2',
          isActive: true,
          expiresAt: null,
          organization: {
            id: 'org-456',
            isActive: true,
          },
        },
      ])

      // First key doesn't match, second does
      mockVerifyPassword.mockResolvedValueOnce(false).mockResolvedValueOnce(true)
      mockUpdate.mockResolvedValue({})

      const result = await authenticateApiKey(request)

      expect(result.authenticated).toBe(true)
      expect(result.context?.apiKey.id).toBe('key-2')
      expect(mockVerifyPassword).toHaveBeenCalledTimes(2)
    })
  })

  describe('Organization Checks', () => {
    it('returns error when organization is inactive', async () => {
      const apiKey = 'zuno_test1234567890123456789012345'
      const request = createMockRequest(`Bearer ${apiKey}`)

      mockFindMany.mockResolvedValue([
        {
          id: 'key-1',
          keyPrefix: 'zuno_tes',
          keyHash: 'hashedKey',
          organizationId: 'org-123',
          scopes: ['*'],
          name: 'Test Key',
          isActive: true,
          expiresAt: null,
          organization: {
            id: 'org-123',
            isActive: false, // Inactive organization
          },
        },
      ])

      mockVerifyPassword.mockResolvedValue(true)

      const result = await authenticateApiKey(request)

      expect(result.authenticated).toBe(false)
      expect(result.error).toBe('Organization is inactive')
    })
  })

  describe('Expiry Checks', () => {
    it('returns error when API key has expired', async () => {
      const apiKey = 'zuno_test1234567890123456789012345'
      const request = createMockRequest(`Bearer ${apiKey}`)

      const expiredDate = new Date()
      expiredDate.setDate(expiredDate.getDate() - 1) // Yesterday

      mockFindMany.mockResolvedValue([
        {
          id: 'key-1',
          keyPrefix: 'zuno_tes',
          keyHash: 'hashedKey',
          organizationId: 'org-123',
          scopes: ['*'],
          name: 'Test Key',
          isActive: true,
          expiresAt: expiredDate,
          organization: {
            id: 'org-123',
            isActive: true,
          },
        },
      ])

      mockVerifyPassword.mockResolvedValue(true)

      const result = await authenticateApiKey(request)

      expect(result.authenticated).toBe(false)
      expect(result.error).toBe('API key has expired')
    })

    it('accepts API key with future expiry date', async () => {
      const apiKey = 'zuno_test1234567890123456789012345'
      const request = createMockRequest(`Bearer ${apiKey}`)

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30) // 30 days from now

      mockFindMany.mockResolvedValue([
        {
          id: 'key-1',
          keyPrefix: 'zuno_tes',
          keyHash: 'hashedKey',
          organizationId: 'org-123',
          scopes: ['*'],
          name: 'Test Key',
          isActive: true,
          expiresAt: futureDate,
          organization: {
            id: 'org-123',
            isActive: true,
          },
        },
      ])

      mockVerifyPassword.mockResolvedValue(true)
      mockUpdate.mockResolvedValue({})

      const result = await authenticateApiKey(request)

      expect(result.authenticated).toBe(true)
    })

    it('accepts API key with null expiry (never expires)', async () => {
      const apiKey = 'zuno_test1234567890123456789012345'
      const request = createMockRequest(`Bearer ${apiKey}`)

      mockFindMany.mockResolvedValue([
        {
          id: 'key-1',
          keyPrefix: 'zuno_tes',
          keyHash: 'hashedKey',
          organizationId: 'org-123',
          scopes: ['*'],
          name: 'Test Key',
          isActive: true,
          expiresAt: null,
          organization: {
            id: 'org-123',
            isActive: true,
          },
        },
      ])

      mockVerifyPassword.mockResolvedValue(true)
      mockUpdate.mockResolvedValue({})

      const result = await authenticateApiKey(request)

      expect(result.authenticated).toBe(true)
    })
  })

  describe('Successful Authentication', () => {
    it('returns context with API key details on success', async () => {
      const apiKey = 'zuno_test1234567890123456789012345'
      const request = createMockRequest(`Bearer ${apiKey}`)

      mockFindMany.mockResolvedValue([
        {
          id: 'key-1',
          keyPrefix: 'zuno_tes',
          keyHash: 'hashedKey',
          organizationId: 'org-123',
          scopes: ['notifications:read', 'notifications:write'],
          name: 'Production Key',
          isActive: true,
          expiresAt: null,
          organization: {
            id: 'org-123',
            isActive: true,
          },
        },
      ])

      mockVerifyPassword.mockResolvedValue(true)
      mockUpdate.mockResolvedValue({})

      const result = await authenticateApiKey(request)

      expect(result.authenticated).toBe(true)
      expect(result.context).toEqual({
        apiKey: {
          id: 'key-1',
          organizationId: 'org-123',
          name: 'Production Key',
          scopes: ['notifications:read', 'notifications:write'],
        },
      })
    })

    it('updates usage stats on successful authentication', async () => {
      const apiKey = 'zuno_test1234567890123456789012345'
      const request = createMockRequest(`Bearer ${apiKey}`)

      mockFindMany.mockResolvedValue([
        {
          id: 'key-1',
          keyPrefix: 'zuno_tes',
          keyHash: 'hashedKey',
          organizationId: 'org-123',
          scopes: ['*'],
          name: 'Test Key',
          isActive: true,
          expiresAt: null,
          organization: {
            id: 'org-123',
            isActive: true,
          },
        },
      ])

      mockVerifyPassword.mockResolvedValue(true)
      mockUpdate.mockResolvedValue({})

      await authenticateApiKey(request)

      // Give time for fire-and-forget update
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'key-1' },
        data: {
          lastUsedAt: expect.any(Date),
          usageCount: { increment: 1 },
        },
      })
    })
  })

  describe('Error Handling', () => {
    it('returns error on database failure', async () => {
      const apiKey = 'zuno_test1234567890123456789012345'
      const request = createMockRequest(`Bearer ${apiKey}`)

      mockFindMany.mockRejectedValue(new Error('Database connection failed'))

      const result = await authenticateApiKey(request)

      expect(result.authenticated).toBe(false)
      expect(result.error).toBe('Authentication failed')
    })

    it('handles bcrypt comparison failure gracefully', async () => {
      const apiKey = 'zuno_test1234567890123456789012345'
      const request = createMockRequest(`Bearer ${apiKey}`)

      mockFindMany.mockResolvedValue([
        {
          id: 'key-1',
          keyPrefix: 'zuno_tes',
          keyHash: 'hashedKey',
          organizationId: 'org-123',
          scopes: ['*'],
          name: 'Test Key',
          isActive: true,
          expiresAt: null,
          organization: {
            id: 'org-123',
            isActive: true,
          },
        },
      ])

      mockVerifyPassword.mockRejectedValue(new Error('Bcrypt error'))

      const result = await authenticateApiKey(request)

      expect(result.authenticated).toBe(false)
      expect(result.error).toBe('Authentication failed')
    })
  })
})

describe('hasScope', () => {
  it('returns true when context has wildcard scope', () => {
    const context: ApiKeyContext = {
      apiKey: {
        id: 'key-1',
        organizationId: 'org-123',
        name: 'Test Key',
        scopes: ['*'],
      },
    }

    expect(hasScope(context, 'notifications:read')).toBe(true)
    expect(hasScope(context, 'notifications:write')).toBe(true)
    expect(hasScope(context, 'any:scope')).toBe(true)
  })

  it('returns true when context has the exact required scope', () => {
    const context: ApiKeyContext = {
      apiKey: {
        id: 'key-1',
        organizationId: 'org-123',
        name: 'Test Key',
        scopes: ['notifications:read', 'notifications:write'],
      },
    }

    expect(hasScope(context, 'notifications:read')).toBe(true)
    expect(hasScope(context, 'notifications:write')).toBe(true)
  })

  it('returns false when context does not have the required scope', () => {
    const context: ApiKeyContext = {
      apiKey: {
        id: 'key-1',
        organizationId: 'org-123',
        name: 'Test Key',
        scopes: ['notifications:read'],
      },
    }

    expect(hasScope(context, 'notifications:write')).toBe(false)
    expect(hasScope(context, 'templates:read')).toBe(false)
  })

  it('returns false when scopes array is empty', () => {
    const context: ApiKeyContext = {
      apiKey: {
        id: 'key-1',
        organizationId: 'org-123',
        name: 'Test Key',
        scopes: [],
      },
    }

    expect(hasScope(context, 'notifications:read')).toBe(false)
  })
})

describe('withApiKey', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 response when authentication fails', async () => {
    const request = createMockRequest() // No auth header

    const result = await withApiKey(request)

    expect(result.authorized).toBe(false)
    expect(result.response?.status).toBe(401)

    const responseBody = await result.response?.json()
    expect(responseBody.error).toBe('Missing or invalid Authorization header')
  })

  it('returns 403 response when required scope is missing', async () => {
    const apiKey = 'zuno_test1234567890123456789012345'
    const request = createMockRequest(`Bearer ${apiKey}`)

    mockFindMany.mockResolvedValue([
      {
        id: 'key-1',
        keyPrefix: 'zuno_tes',
        keyHash: 'hashedKey',
        organizationId: 'org-123',
        scopes: ['notifications:read'], // Only read scope
        name: 'Test Key',
        isActive: true,
        expiresAt: null,
        organization: {
          id: 'org-123',
          isActive: true,
        },
      },
    ])

    mockVerifyPassword.mockResolvedValue(true)
    mockUpdate.mockResolvedValue({})

    const result = await withApiKey(request, ['notifications:write'])

    expect(result.authorized).toBe(false)
    expect(result.response?.status).toBe(403)

    const responseBody = await result.response?.json()
    expect(responseBody.error).toBe('Insufficient permissions')
  })

  it('returns 403 when one of multiple required scopes is missing', async () => {
    const apiKey = 'zuno_test1234567890123456789012345'
    const request = createMockRequest(`Bearer ${apiKey}`)

    mockFindMany.mockResolvedValue([
      {
        id: 'key-1',
        keyPrefix: 'zuno_tes',
        keyHash: 'hashedKey',
        organizationId: 'org-123',
        scopes: ['notifications:read', 'templates:read'],
        name: 'Test Key',
        isActive: true,
        expiresAt: null,
        organization: {
          id: 'org-123',
          isActive: true,
        },
      },
    ])

    mockVerifyPassword.mockResolvedValue(true)
    mockUpdate.mockResolvedValue({})

    const result = await withApiKey(request, ['notifications:read', 'notifications:write'])

    expect(result.authorized).toBe(false)
    expect(result.response?.status).toBe(403)
  })

  it('returns authorized with context when all scopes are present', async () => {
    const apiKey = 'zuno_test1234567890123456789012345'
    const request = createMockRequest(`Bearer ${apiKey}`)

    mockFindMany.mockResolvedValue([
      {
        id: 'key-1',
        keyPrefix: 'zuno_tes',
        keyHash: 'hashedKey',
        organizationId: 'org-123',
        scopes: ['notifications:read', 'notifications:write'],
        name: 'Test Key',
        isActive: true,
        expiresAt: null,
        organization: {
          id: 'org-123',
          isActive: true,
        },
      },
    ])

    mockVerifyPassword.mockResolvedValue(true)
    mockUpdate.mockResolvedValue({})

    const result = await withApiKey(request, ['notifications:read', 'notifications:write'])

    expect(result.authorized).toBe(true)
    expect(result.context?.apiKey.id).toBe('key-1')
    expect(result.response).toBeUndefined()
  })

  it('returns authorized when no scopes are required', async () => {
    const apiKey = 'zuno_test1234567890123456789012345'
    const request = createMockRequest(`Bearer ${apiKey}`)

    mockFindMany.mockResolvedValue([
      {
        id: 'key-1',
        keyPrefix: 'zuno_tes',
        keyHash: 'hashedKey',
        organizationId: 'org-123',
        scopes: [],
        name: 'Test Key',
        isActive: true,
        expiresAt: null,
        organization: {
          id: 'org-123',
          isActive: true,
        },
      },
    ])

    mockVerifyPassword.mockResolvedValue(true)
    mockUpdate.mockResolvedValue({})

    const result = await withApiKey(request, [])

    expect(result.authorized).toBe(true)
  })

  it('returns authorized when wildcard scope matches any requirement', async () => {
    const apiKey = 'zuno_test1234567890123456789012345'
    const request = createMockRequest(`Bearer ${apiKey}`)

    mockFindMany.mockResolvedValue([
      {
        id: 'key-1',
        keyPrefix: 'zuno_tes',
        keyHash: 'hashedKey',
        organizationId: 'org-123',
        scopes: ['*'],
        name: 'Admin Key',
        isActive: true,
        expiresAt: null,
        organization: {
          id: 'org-123',
          isActive: true,
        },
      },
    ])

    mockVerifyPassword.mockResolvedValue(true)
    mockUpdate.mockResolvedValue({})

    const result = await withApiKey(request, ['notifications:admin', 'templates:delete'])

    expect(result.authorized).toBe(true)
  })
})

describe('API Key Format Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('accepts standard zuno format API key', async () => {
    const apiKey = 'zuno_xxxxxxxxxxxxxxxxxxx_admin_xxxxxxxxxxxxxxxxxxx_01'
    const request = createMockRequest(`Bearer ${apiKey}`)

    mockFindMany.mockResolvedValue([
      {
        id: 'key-1',
        keyPrefix: 'zuno_xxx',
        keyHash: 'hashedKey',
        organizationId: 'org-123',
        scopes: ['*'],
        name: 'Admin Key',
        isActive: true,
        expiresAt: null,
        organization: {
          id: 'org-123',
          isActive: true,
        },
      },
    ])

    mockVerifyPassword.mockResolvedValue(true)
    mockUpdate.mockResolvedValue({})

    const result = await authenticateApiKey(request)

    expect(result.authenticated).toBe(true)
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        keyPrefix: 'zuno_xxx',
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
  })

  it('extracts correct 8-character prefix from API key', async () => {
    const apiKey = 'abcdefgh1234567890123456789012345'
    const request = createMockRequest(`Bearer ${apiKey}`)

    mockFindMany.mockResolvedValue([])

    await authenticateApiKey(request)

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        keyPrefix: 'abcdefgh',
        isActive: true,
      },
      include: expect.any(Object),
    })
  })
})
