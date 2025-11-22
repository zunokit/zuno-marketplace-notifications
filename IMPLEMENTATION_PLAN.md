# IMPLEMENTATION PLAN - P0 Security Issues

## Overview

Mỗi issue sẽ được implement trong 1 branch riêng, với code quality chuẩn senior-level.

**Workflow cho mỗi issue:**
```bash
1. git checkout develop-claude
2. git pull origin develop-claude
3. git checkout -b fix/p0-[issue-name]
4. [Implement changes]
5. pnpm typecheck
6. pnpm lint
7. pnpm test
8. pnpm build
9. git add . && git commit -m "fix: [description]"
10. git push -u origin fix/p0-[issue-name]
```

---

## P0.1: Implement Proper Authentication Middleware

**Branch:** `fix/p0-authentication-middleware`

### Problem
- API routes không có authentication
- Hardcoded `defaultOrgId` ở nhiều nơi
- Bất kỳ ai cũng có thể gọi API

### Solution Architecture

**1. Create Authentication Middleware**
- File: `src/lib/middleware/auth.middleware.ts`
- Pattern: Extract & validate session/API key from request
- Return: `{ user, organization, session }`

**2. Create Route Helpers**
- File: `src/lib/api/route-handler.ts`
- Wrapper functions: `withAuth()`, `withApiKey()`, `withRateLimit()`
- Clean error handling

**3. Update All API Routes**
- Pattern: Wrap handlers with `withAuth()`
- Access user/org from context, không hardcode

### Files to Change

```
CREATE:
  src/lib/middleware/auth.middleware.ts
  src/lib/api/route-handler.ts
  src/lib/api/types.ts
  tests/unit/lib/middleware/auth.middleware.test.ts

UPDATE:
  src/app/api/notifications/send/route.ts
  src/app/api/notifications/batch/route.ts
  src/app/api/notifications/schedule/route.ts
  src/app/api/templates/create/route.ts
  src/app/api/templates/route.ts
  src/app/api/watchlist/add/route.ts
  src/app/api/watchlist/list/route.ts
  src/app/api/price-alerts/create/route.ts
  src/app/api/price-alerts/list/route.ts
  + 15 more API routes
```

### Implementation Details

**auth.middleware.ts:**
```typescript
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/better-auth'

export interface AuthContext {
  user: {
    id: string
    email: string
    name: string | null
  }
  organization: {
    id: string
    slug: string
    role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER'
  }
  session: {
    id: string
    expiresAt: Date
  }
}

export async function authenticate(
  request: NextRequest
): Promise<AuthContext | null> {
  const session = await auth.api.getSession({
    headers: request.headers
  })

  if (!session) {
    return null
  }

  // Get user's active organization
  // Implementation details...

  return {
    user: session.user,
    organization: activeOrg,
    session: session.session
  }
}
```

**route-handler.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { authenticate, AuthContext } from '@/lib/middleware/auth.middleware'
import { logger } from '@/lib/logger/logger'

type AuthenticatedHandler = (
  request: NextRequest,
  context: AuthContext,
  params?: unknown
) => Promise<NextResponse>

export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest, { params }: { params?: unknown }) => {
    try {
      const authContext = await authenticate(request)

      if (!authContext) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      return await handler(request, authContext, params)
    } catch (error) {
      logger.error('Authentication error', { error })
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
```

**Updated route example:**
```typescript
// src/app/api/notifications/send/route.ts
import { withAuth } from '@/lib/api/route-handler'

export const POST = withAuth(async (request, { user, organization }) => {
  const body = await request.json()

  // Use organization.id instead of hardcoded value
  const notification = await sendNotificationUseCase.execute({
    organizationId: organization.id, // ✅ From authenticated context
    userId: user.id,
    ...body
  })

  return NextResponse.json(notification)
})
```

### Testing Strategy

```typescript
// tests/unit/lib/middleware/auth.middleware.test.ts
describe('authenticate', () => {
  it('returns null when no session', async () => {
    const request = new NextRequest('http://localhost/api/test')
    const result = await authenticate(request)
    expect(result).toBeNull()
  })

  it('returns auth context with valid session', async () => {
    // Mock auth.api.getSession
    const result = await authenticate(mockRequest)
    expect(result).toMatchObject({
      user: expect.objectContaining({ id: expect.any(String) }),
      organization: expect.objectContaining({ id: expect.any(String) })
    })
  })
})

describe('withAuth', () => {
  it('returns 401 when not authenticated', async () => {
    const handler = withAuth(async () => NextResponse.json({ ok: true }))
    const response = await handler(mockRequest, {})
    expect(response.status).toBe(401)
  })

  it('calls handler with auth context when authenticated', async () => {
    const handlerSpy = jest.fn()
    const handler = withAuth(handlerSpy)
    await handler(mockAuthenticatedRequest, {})
    expect(handlerSpy).toHaveBeenCalledWith(
      mockAuthenticatedRequest,
      expect.objectContaining({ user: expect.any(Object) }),
      {}
    )
  })
})
```

### Validation Checklist

- [ ] All API routes protected với withAuth()
- [ ] No hardcoded organization IDs
- [ ] Error handling comprehensive
- [ ] TypeScript types strict (no `any`)
- [ ] Tests cover success và error cases
- [ ] Logs correlation IDs
- [ ] pnpm typecheck passes
- [ ] pnpm lint passes
- [ ] pnpm test passes
- [ ] pnpm build passes

---

## P0.2: Fix SQL Injection in Notification Repository

**Branch:** `fix/p0-sql-injection`

### Problem
- Raw SQL với template literals
- organizationId không được sanitize
- Nguy cơ SQL injection

### Solution

**Remove all raw SQL queries** và sử dụng Prisma query builder hoặc `Prisma.sql` tagged template.

### Files to Change

```
UPDATE:
  src/infrastructure/repositories/notification.repository.ts
  tests/unit/infrastructure/repositories/notification.repository.test.ts
```

### Implementation

**Before (❌ VULNERABLE):**
```typescript
async getStatistics(organizationId: string) {
  return await prisma.$queryRaw`
    SELECT
      status,
      COUNT(*) as count
    FROM notifications
    WHERE organizationId = ${organizationId}
    GROUP BY status
  `
}
```

**After (✅ SAFE):**
```typescript
import { Prisma } from '@/infrastructure/database/generated'

async getStatistics(organizationId: string): Promise<NotificationStats[]> {
  // Option 1: Use Prisma query builder (preferred)
  const stats = await prisma.notification.groupBy({
    by: ['status'],
    where: {
      organizationId
    },
    _count: {
      status: true
    }
  })

  return stats.map(stat => ({
    status: stat.status,
    count: stat._count.status
  }))
}

// Option 2: Use Prisma.sql for complex queries
async getComplexStats(organizationId: string): Promise<ComplexStats[]> {
  const stats = await prisma.$queryRaw<ComplexStats[]>`
    SELECT
      status,
      channel,
      COUNT(*) as count,
      AVG(retry_count) as avg_retries
    FROM notifications
    WHERE organization_id = ${organizationId}
    GROUP BY status, channel
  `

  return stats
}
```

**Type-safe approach:**
```typescript
import { NotificationStatus } from '@/infrastructure/database/generated'

interface NotificationStats {
  status: NotificationStatus
  count: number
}

async getStatistics(
  organizationId: string
): Promise<NotificationStats[]> {
  const results = await prisma.notification.groupBy({
    by: ['status'],
    where: { organizationId },
    _count: { status: true }
  })

  return results.map(result => ({
    status: result.status,
    count: result._count.status
  }))
}
```

### Testing Strategy

```typescript
describe('NotificationRepository', () => {
  describe('getStatistics', () => {
    it('returns stats grouped by status', async () => {
      const stats = await repository.getStatistics('org-123')

      expect(stats).toEqual([
        { status: 'SENT', count: 10 },
        { status: 'FAILED', count: 2 }
      ])
    })

    it('handles SQL-injection attempts safely', async () => {
      // Prisma will handle this safely
      const maliciousOrgId = "org-123'; DROP TABLE notifications; --"

      await expect(
        repository.getStatistics(maliciousOrgId)
      ).resolves.toEqual([]) // Returns empty, doesn't execute injection
    })

    it('returns properly typed results', async () => {
      const stats = await repository.getStatistics('org-123')

      stats.forEach(stat => {
        expect(stat.status).toMatch(/PENDING|SENT|FAILED|DELIVERED/)
        expect(typeof stat.count).toBe('number')
      })
    })
  })
})
```

### Validation Checklist

- [ ] No raw SQL with template literals
- [ ] All queries use Prisma query builder or Prisma.sql
- [ ] Proper TypeScript types (no `any`)
- [ ] Tests cover injection attempts
- [ ] All queries return typed results
- [ ] pnpm typecheck passes
- [ ] pnpm lint passes
- [ ] pnpm test passes

---

## P0.3: Remove Hardcoded Organization IDs

**Branch:** `fix/p0-remove-hardcoded-org-ids`

### Problem
- `defaultOrgId = 'org-default-123'` ở nhiều files
- Services có hardcoded `organizationId: 'default'`
- Không multi-tenant compliant

### Solution

**Depend on P0.1 (Authentication)** - get organization from auth context

### Files to Change

```
UPDATE:
  src/app/api/notifications/send/route.ts (remove defaultOrgId)
  src/app/api/notifications/batch/route.ts (remove defaultOrgId)
  src/app/api/templates/create/route.ts (remove defaultOrgId)
  src/core/services/watchlist.service.ts (remove line 260)
  src/core/services/drop-notification.service.ts (if any hardcoded values)

REVIEW ALL FILES FOR:
  - 'org-default'
  - 'organizationId: "default"'
  - Hardcoded UUIDs
```

### Implementation

**Before (❌ BAD):**
```typescript
// src/app/api/notifications/send/route.ts
const defaultOrgId = 'org-default-123'

export async function POST(request: Request) {
  const body = await request.json()

  const notification = await sendNotification({
    organizationId: defaultOrgId, // ❌ Hardcoded
    ...body
  })
}
```

**After (✅ GOOD):**
```typescript
import { withAuth } from '@/lib/api/route-handler'

export const POST = withAuth(async (request, { organization }) => {
  const body = await request.json()

  const notification = await sendNotification({
    organizationId: organization.id, // ✅ From auth context
    ...body
  })

  return NextResponse.json(notification)
})
```

**Service layer:**
```typescript
// src/core/services/watchlist.service.ts

// Before (❌)
async createWatchlistItem(userId: string, itemData: WatchlistData) {
  return await prisma.watchlist.create({
    data: {
      organizationId: 'default', // ❌ Hardcoded
      userId,
      ...itemData
    }
  })
}

// After (✅)
async createWatchlistItem(
  organizationId: string,
  userId: string,
  itemData: WatchlistData
): Promise<Watchlist> {
  if (!organizationId) {
    throw new Error('Organization ID is required')
  }

  return await prisma.watchlist.create({
    data: {
      organizationId, // ✅ Parameter
      userId,
      ...itemData
    }
  })
}
```

### Search & Replace Strategy

```bash
# 1. Find all hardcoded org IDs
pnpm grep -r "org-default" src/
pnpm grep -r "organizationId.*default" src/
pnpm grep -r "organizationId.*:" src/ | grep -v "// " | grep -v "organizationId: org"

# 2. Review each occurrence and update
```

### Testing Strategy

```typescript
describe('Watchlist Service', () => {
  it('requires organizationId parameter', async () => {
    await expect(
      watchlistService.createWatchlistItem(
        '', // Empty org ID
        'user-123',
        watchlistData
      )
    ).rejects.toThrow('Organization ID is required')
  })

  it('creates watchlist with provided organization', async () => {
    const result = await watchlistService.createWatchlistItem(
      'org-abc',
      'user-123',
      watchlistData
    )

    expect(result.organizationId).toBe('org-abc')
  })
})
```

### Validation Checklist

- [ ] No hardcoded organization IDs anywhere
- [ ] All services accept organizationId parameter
- [ ] All API routes use auth context organization
- [ ] Tests verify organization isolation
- [ ] pnpm grep returns no hardcoded values
- [ ] pnpm typecheck passes
- [ ] pnpm lint passes
- [ ] pnpm test passes

---

## P0.4: Fix Idempotency Race Condition

**Branch:** `fix/p0-idempotency-race-condition`

### Problem
- `checkIdempotency()` has check-then-create race condition
- 2 concurrent requests có thể cùng pass check
- On error, returns `isDuplicate: false` (fail-open)

### Solution

**Use database unique constraint** để enforce idempotency atomically

### Files to Change

```
UPDATE:
  src/core/services/idempotency.service.ts
  tests/unit/core/services/idempotency.service.test.ts

VERIFY:
  src/infrastructure/database/prisma/schema.prisma
    - Notification.idempotencyKey has @unique ✅
```

### Implementation

**Before (❌ RACE CONDITION):**
```typescript
async checkIdempotency(key: string, organizationId: string) {
  const existing = await prisma.idempotencyKey.findUnique({
    where: { key }
  })

  if (existing) {
    return { isDuplicate: true, existingNotification: existing.notificationId }
  }

  // ⚠️ Race condition here! Another request can execute between check and create

  await prisma.idempotencyKey.create({
    data: { key, organizationId }
  })

  return { isDuplicate: false }
}
```

**After (✅ ATOMIC):**
```typescript
import { Prisma } from '@/infrastructure/database/generated'
import { logger } from '@/lib/logger/logger'

interface IdempotencyCheckResult {
  isDuplicate: boolean
  existingNotificationId?: string
}

export class IdempotencyService {
  /**
   * Check and register idempotency key atomically
   * Uses database unique constraint to prevent race conditions
   */
  async checkAndRegister(
    key: string,
    organizationId: string,
    notificationId?: string
  ): Promise<IdempotencyCheckResult> {
    try {
      // Try to create - will fail if duplicate due to unique constraint
      await prisma.idempotencyKey.create({
        data: {
          key,
          organizationId,
          notificationId,
          createdAt: new Date()
        }
      })

      logger.debug('Idempotency key registered', { key, organizationId })

      return {
        isDuplicate: false
      }
    } catch (error) {
      // Check if error is duplicate key violation
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' // Unique constraint violation
      ) {
        logger.debug('Duplicate idempotency key detected', { key })

        // Fetch existing notification
        const existing = await prisma.idempotencyKey.findUnique({
          where: { key },
          select: { notificationId: true }
        })

        return {
          isDuplicate: true,
          existingNotificationId: existing?.notificationId ?? undefined
        }
      }

      // Other errors - fail closed for safety
      logger.error('Idempotency check failed', { error, key })
      throw new Error('Failed to check idempotency')
    }
  }

  /**
   * Update idempotency record with notification ID after creation
   */
  async updateNotificationId(
    key: string,
    notificationId: string
  ): Promise<void> {
    await prisma.idempotencyKey.update({
      where: { key },
      data: { notificationId }
    })
  }
}
```

**Updated schema (verify exists):**
```prisma
model IdempotencyKey {
  id             String   @id @default(uuid())
  key            String   @unique // ✅ Unique constraint prevents race conditions
  organizationId String
  notificationId String?
  createdAt      DateTime @default(now())
  expiresAt      DateTime // Auto-cleanup after 24h

  @@index([organizationId])
  @@index([createdAt])
  @@map("idempotency_keys")
}
```

**Usage in use case:**
```typescript
// src/core/use-cases/notifications/send-notification.use-case.ts

export class SendNotificationUseCase {
  async execute(input: SendNotificationInput): Promise<Notification> {
    // Check idempotency if key provided
    if (input.idempotencyKey) {
      const idempotencyCheck = await this.idempotencyService.checkAndRegister(
        input.idempotencyKey,
        input.organizationId
      )

      if (idempotencyCheck.isDuplicate) {
        logger.info('Duplicate request detected', {
          idempotencyKey: input.idempotencyKey
        })

        // Return existing notification
        const existing = await this.notificationRepository.findById(
          idempotencyCheck.existingNotificationId!
        )

        return existing
      }
    }

    // Create notification...
    const notification = await this.notificationRepository.create({
      ...input,
      status: 'PENDING'
    })

    // Update idempotency record with notification ID
    if (input.idempotencyKey) {
      await this.idempotencyService.updateNotificationId(
        input.idempotencyKey,
        notification.id
      )
    }

    return notification
  }
}
```

### Testing Strategy

```typescript
describe('IdempotencyService', () => {
  describe('checkAndRegister', () => {
    it('registers new idempotency key', async () => {
      const result = await service.checkAndRegister('key-123', 'org-123')

      expect(result.isDuplicate).toBe(false)
      expect(result.existingNotificationId).toBeUndefined()
    })

    it('detects duplicate key', async () => {
      await service.checkAndRegister('key-123', 'org-123')

      const result = await service.checkAndRegister('key-123', 'org-123')

      expect(result.isDuplicate).toBe(true)
    })

    it('handles concurrent requests correctly', async () => {
      // Simulate race condition with concurrent requests
      const results = await Promise.allSettled([
        service.checkAndRegister('key-concurrent', 'org-123'),
        service.checkAndRegister('key-concurrent', 'org-123'),
        service.checkAndRegister('key-concurrent', 'org-123')
      ])

      const successes = results.filter(r => r.status === 'fulfilled')
      const duplicates = successes.filter(
        r => r.value.isDuplicate === false
      )

      // Only ONE should succeed, others should be duplicates
      expect(duplicates).toHaveLength(1)
    })

    it('throws error on database failure', async () => {
      // Mock Prisma to throw non-duplicate error
      jest.spyOn(prisma.idempotencyKey, 'create')
        .mockRejectedValueOnce(new Error('Database connection failed'))

      await expect(
        service.checkAndRegister('key-123', 'org-123')
      ).rejects.toThrow('Failed to check idempotency')
    })
  })
})
```

### Validation Checklist

- [ ] No check-then-create pattern
- [ ] Uses database unique constraint
- [ ] Handles Prisma P2002 error correctly
- [ ] Concurrent requests handled safely (test proves it)
- [ ] Fail-closed on unknown errors
- [ ] Proper TypeScript types
- [ ] Comprehensive error handling
- [ ] pnpm typecheck passes
- [ ] pnpm lint passes
- [ ] pnpm test passes (including concurrent test)

---

## P0.5: Add Authorization Checks for Resource Access

**Branch:** `fix/p0-authorization-checks`

### Problem
- API routes không check ownership
- User có thể xem/edit resources của organizations khác
- Missing role-based access control (RBAC)

### Solution

**Implement authorization layer** với ownership và role checks

### Files to Change

```
CREATE:
  src/lib/authorization/authorization.service.ts
  src/lib/authorization/types.ts
  src/lib/api/with-authorization.ts
  tests/unit/lib/authorization/authorization.service.test.ts

UPDATE:
  src/app/api/notifications/[id]/route.ts
  src/app/api/notifications/[id]/resend/route.ts
  src/app/api/templates/[id]/route.ts
  src/app/api/price-alerts/[id]/route.ts
  + All resource-specific routes
```

### Implementation

**authorization.service.ts:**
```typescript
import { Role } from '@/infrastructure/database/generated'
import { prisma } from '@/infrastructure/database/prisma'

export interface AuthorizationContext {
  userId: string
  organizationId: string
  role: Role
}

export class AuthorizationService {
  /**
   * Check if user can perform action on resource
   */
  async authorize(
    context: AuthorizationContext,
    resource: 'notification' | 'template' | 'price_alert',
    resourceId: string,
    action: 'read' | 'write' | 'delete'
  ): Promise<boolean> {
    // 1. Verify resource belongs to user's organization
    const belongsToOrg = await this.verifyOrganization(
      resource,
      resourceId,
      context.organizationId
    )

    if (!belongsToOrg) {
      return false
    }

    // 2. Check role permissions
    return this.hasPermission(context.role, action)
  }

  private async verifyOrganization(
    resource: string,
    resourceId: string,
    organizationId: string
  ): Promise<boolean> {
    switch (resource) {
      case 'notification':
        const notification = await prisma.notification.findUnique({
          where: { id: resourceId },
          select: { organizationId: true }
        })
        return notification?.organizationId === organizationId

      case 'template':
        const template = await prisma.template.findUnique({
          where: { id: resourceId },
          select: { organizationId: true }
        })
        return template?.organizationId === organizationId

      case 'price_alert':
        const alert = await prisma.priceAlert.findUnique({
          where: { id: resourceId },
          select: { organizationId: true }
        })
        return alert?.organizationId === organizationId

      default:
        return false
    }
  }

  private hasPermission(role: Role, action: string): boolean {
    const permissions = {
      OWNER: ['read', 'write', 'delete'],
      ADMIN: ['read', 'write', 'delete'],
      EDITOR: ['read', 'write'],
      VIEWER: ['read']
    }

    return permissions[role]?.includes(action) ?? false
  }
}

export const authorizationService = new AuthorizationService()
```

**with-authorization.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { AuthContext } from '@/lib/middleware/auth.middleware'
import { authorizationService } from '@/lib/authorization/authorization.service'
import { logger } from '@/lib/logger/logger'

type AuthorizedHandler = (
  request: NextRequest,
  context: AuthContext,
  params: { id: string }
) => Promise<NextResponse>

interface AuthorizationConfig {
  resource: 'notification' | 'template' | 'price_alert'
  action: 'read' | 'write' | 'delete'
}

export function withAuthorization(
  config: AuthorizationConfig,
  handler: AuthorizedHandler
) {
  return async (
    request: NextRequest,
    authContext: AuthContext,
    { params }: { params: { id: string } }
  ) => {
    const { resource, action } = config
    const resourceId = params.id

    // Check authorization
    const isAuthorized = await authorizationService.authorize(
      {
        userId: authContext.user.id,
        organizationId: authContext.organization.id,
        role: authContext.organization.role
      },
      resource,
      resourceId,
      action
    )

    if (!isAuthorized) {
      logger.warn('Unauthorized access attempt', {
        userId: authContext.user.id,
        resource,
        resourceId,
        action
      })

      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return await handler(request, authContext, params)
  }
}
```

**Updated route:**
```typescript
// src/app/api/notifications/[id]/route.ts
import { withAuth } from '@/lib/api/route-handler'
import { withAuthorization } from '@/lib/api/with-authorization'

// GET /api/notifications/:id
export const GET = withAuth(
  withAuthorization(
    { resource: 'notification', action: 'read' },
    async (request, authContext, params) => {
      const notification = await notificationRepository.findById(params.id)

      if (!notification) {
        return NextResponse.json(
          { error: 'Not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(notification)
    }
  )
)

// DELETE /api/notifications/:id
export const DELETE = withAuth(
  withAuthorization(
    { resource: 'notification', action: 'delete' },
    async (request, authContext, params) => {
      await notificationRepository.delete(params.id)

      return NextResponse.json({ success: true })
    }
  )
)
```

**Composition pattern:**
```typescript
// Clean composition of auth + authorization
const handler = withAuth(
  withAuthorization(
    { resource: 'template', action: 'write' },
    async (request, context, params) => {
      // Handler logic - user is authenticated AND authorized
    }
  )
)
```

### Testing Strategy

```typescript
describe('AuthorizationService', () => {
  describe('authorize', () => {
    it('allows OWNER to delete resources', async () => {
      const result = await service.authorize(
        { userId: 'user-1', organizationId: 'org-1', role: 'OWNER' },
        'notification',
        'notif-123',
        'delete'
      )

      expect(result).toBe(true)
    })

    it('denies VIEWER from writing', async () => {
      const result = await service.authorize(
        { userId: 'user-1', organizationId: 'org-1', role: 'VIEWER' },
        'notification',
        'notif-123',
        'write'
      )

      expect(result).toBe(false)
    })

    it('denies access to resources from other organizations', async () => {
      // User in org-1 tries to access resource from org-2
      const result = await service.authorize(
        { userId: 'user-1', organizationId: 'org-1', role: 'OWNER' },
        'notification',
        'notif-from-org-2',
        'read'
      )

      expect(result).toBe(false)
    })

    it('allows EDITOR to read and write', async () => {
      const readResult = await service.authorize(
        { userId: 'user-1', organizationId: 'org-1', role: 'EDITOR' },
        'template',
        'template-123',
        'read'
      )

      const writeResult = await service.authorize(
        { userId: 'user-1', organizationId: 'org-1', role: 'EDITOR' },
        'template',
        'template-123',
        'write'
      )

      expect(readResult).toBe(true)
      expect(writeResult).toBe(true)
    })
  })
})

describe('withAuthorization', () => {
  it('returns 403 when user not authorized', async () => {
    const handler = withAuthorization(
      { resource: 'notification', action: 'delete' },
      async () => NextResponse.json({ ok: true })
    )

    const response = await handler(
      mockRequest,
      mockViewerContext, // VIEWER role
      { params: { id: 'notif-123' } }
    )

    expect(response.status).toBe(403)
  })

  it('calls handler when authorized', async () => {
    const handlerSpy = jest.fn()
    const handler = withAuthorization(
      { resource: 'notification', action: 'read' },
      handlerSpy
    )

    await handler(
      mockRequest,
      mockOwnerContext,
      { params: { id: 'notif-123' } }
    )

    expect(handlerSpy).toHaveBeenCalled()
  })
})
```

### Validation Checklist

- [ ] All resource routes have authorization
- [ ] RBAC permissions correctly implemented
- [ ] Organization isolation enforced
- [ ] Audit logs for unauthorized attempts
- [ ] Tests cover all roles and actions
- [ ] pnpm typecheck passes
- [ ] pnpm lint passes
- [ ] pnpm test passes

---

## Execution Order

Vì các issues có dependencies, thứ tự implement:

1. **P0.1 Authentication** → Foundation cho tất cả
2. **P0.3 Remove Hardcoded Org IDs** → Depends on P0.1
3. **P0.5 Authorization** → Depends on P0.1
4. **P0.2 SQL Injection** → Independent, có thể parallel
5. **P0.4 Idempotency** → Independent, có thể parallel

**Suggested parallel tracks:**
- Track A: P0.1 → P0.3 → P0.5
- Track B: P0.2, P0.4 (có thể làm song song)

---

## Quality Gates

Mỗi PR phải pass:

```bash
✅ pnpm typecheck     # No TypeScript errors
✅ pnpm lint          # No ESLint errors
✅ pnpm test          # All tests pass
✅ pnpm build         # Production build succeeds
✅ Code review        # Senior engineer approval
✅ Test coverage ≥80% # For changed files
```

---

## Commit Message Format

```bash
fix(auth): implement authentication middleware for API routes

- Created withAuth() wrapper for route handlers
- Extract user & organization from Better Auth session
- Applied to all /api/notifications/* endpoints
- Added comprehensive test coverage

Closes #P0-1

BREAKING CHANGE: All API routes now require authentication
```

---

## Notes

- **Clean code principles**: SOLID, DRY, KISS
- **Error handling**: Always explicit, never swallow errors
- **Logging**: Structured logs với correlation IDs
- **Types**: Strict TypeScript, no `any`, no `!` assertions
- **Tests**: Unit tests cho business logic, integration cho API routes
- **Documentation**: JSDoc cho public APIs

Ready to implement! 🚀
