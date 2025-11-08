# 🔐 HỆ THỐNG BẢO MẬT - SECURITY GUIDE
## Zuno Marketplace Notifications

---

## 📋 MỤC LỤC

1. [Tổng quan Authentication & Authorization](#1-tổng-quan-authentication--authorization)
2. [Các lớp bảo vệ (Security Layers)](#2-các-lớp-bảo-vệ-security-layers)
3. [Flow Authentication](#3-flow-authentication)
4. [Các loại Authentication](#4-các-loại-authentication)
5. [Middleware Protection](#5-middleware-protection)
6. [API Route Protection](#6-api-route-protection)
7. [Testing Security](#7-testing-security)
8. [Best Practices](#8-best-practices)

---

## 1. TỔNG QUAN AUTHENTICATION & AUTHORIZATION

### 🏗️ Kiến trúc bảo mật 3 lớp:

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 1: MIDDLEWARE                       │
│  • Next.js middleware.ts (Route-level protection)           │
│  • Session verification                                      │
│  • Public vs Protected routes                               │
│  • Redirect unauthenticated users                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                LAYER 2: API AUTH UTILITIES                   │
│  • requireAuth() - Require session                          │
│  • requireOrganizationMembership() - Check org              │
│  • requireRole() - Check role (OWNER/ADMIN/MEMBER)         │
│  • requireResourceOwnership() - Check ownership             │
│  • requireApiKey() - For webhooks/integrations             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  LAYER 3: DATABASE CHECKS                    │
│  • Prisma queries with user/org filters                     │
│  • Row-level security                                       │
│  • Audit logging                                            │
└─────────────────────────────────────────────────────────────┘
```

### 📊 Authentication Flow Matrix:

| Route Type | Auth Method | Authorization | Example |
|------------|-------------|---------------|---------|
| **User Pages** | Session Cookie | User membership | `/admin/notifications` |
| **User API** | Session Cookie | User + Org membership | `/api/price-alerts/create` |
| **Webhooks** | API Key | Org-level | `/api/webhooks/price-change` |
| **Public** | None | None | `/auth/login` |
| **Metrics** | Network firewall | None (internal only) | `/api/metrics` |

---

## 2. CÁC LỚP BẢO VỆ (SECURITY LAYERS)

### Layer 1: Next.js Middleware (`src/middleware.ts`)

```typescript
// ═══════════════════════════════════════════════════════════
// MIDDLEWARE - First line of defense
// ═══════════════════════════════════════════════════════════

export default async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ────────────────────────────────────────────────────────
  // 1. PUBLIC ROUTES - Allow without auth
  // ────────────────────────────────────────────────────────
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/api/auth',
    '/api/metrics', // Protected by network firewall
  ]

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // ────────────────────────────────────────────────────────
  // 2. WEBHOOK ROUTES - Use API key auth
  // ────────────────────────────────────────────────────────
  const webhookRoutes = [
    '/api/webhooks/price-change',
    '/api/webhooks/floor-price-drop',
  ]

  if (webhookRoutes.some(route => pathname.startsWith(route))) {
    const apiKey = request.headers.get('x-api-key')

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'API key required' },
        { status: 401 }
      )
    }

    // Pass through, verification happens in route handler
    return NextResponse.next()
  }

  // ────────────────────────────────────────────────────────
  // 3. PROTECTED ROUTES - Require session
  // ────────────────────────────────────────────────────────
  const protectedRoutes = [
    '/admin',
    '/api/notifications',
    '/api/price-alerts',
    '/api/watchlist',
    '/api/drops',
  ]

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // ────────────────────────────────────────────────────────
  // 4. CHECK SESSION
  // ────────────────────────────────────────────────────────
  const { data: session } = await betterFetch<Session>(
    '/api/auth/get-session',
    {
      baseURL: env.BETTER_AUTH_URL,
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    }
  )

  // No session → 401 for API, redirect for pages
  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Redirect to login with return URL
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ────────────────────────────────────────────────────────
  // 5. ADMIN ROUTES - Check admin role
  // ────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!(session.user as any).isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }
  }

  // ────────────────────────────────────────────────────────
  // 6. ADD USER INFO TO HEADERS (for API routes to use)
  // ────────────────────────────────────────────────────────
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', session.user.id)
  requestHeaders.set('x-user-email', session.user.email)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}
```

### Layer 2: API Auth Utilities (`src/lib/auth/api-auth.ts`)

```typescript
// ═══════════════════════════════════════════════════════════
// API AUTH UTILITIES - Second line of defense
// ═══════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────
// 1. REQUIRE AUTH - Get user from middleware headers
// ────────────────────────────────────────────────────────
export function requireAuth(request: NextRequest): {
  userId: string
  userEmail: string
} {
  const userId = request.headers.get('x-user-id')
  const userEmail = request.headers.get('x-user-email')

  if (!userId || !userEmail) {
    throw new Error('Unauthorized: Authentication required')
  }

  return { userId, userEmail }
}

// ────────────────────────────────────────────────────────
// 2. REQUIRE ORGANIZATION MEMBERSHIP
// ────────────────────────────────────────────────────────
export async function requireOrganizationMembership(
  userId: string
): Promise<{
  organizationId: string
  role: string
}> {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    include: {
      organization: {
        select: {
          id: true,
          isActive: true,
        },
      },
    },
  })

  if (!membership || !membership.organization.isActive) {
    throw new Error('Forbidden: Not a member of any organization')
  }

  return {
    organizationId: membership.organizationId,
    role: membership.role,
  }
}

// ────────────────────────────────────────────────────────
// 3. REQUIRE SPECIFIC ROLE
// ────────────────────────────────────────────────────────
export async function requireRole(
  userId: string,
  organizationId: string,
  allowedRoles: string[]
): Promise<void> {
  const membership = await prisma.organizationMember.findFirst({
    where: {
      userId,
      organizationId,
      role: { in: allowedRoles },
    },
  })

  if (!membership) {
    throw new Error(
      `Forbidden: Requires one of roles: ${allowedRoles.join(', ')}`
    )
  }
}

// ────────────────────────────────────────────────────────
// 4. REQUIRE RESOURCE OWNERSHIP
// ────────────────────────────────────────────────────────
export async function requireResourceOwnership(
  userId: string,
  resourceType: 'price_alert' | 'watchlist' | 'notification',
  resourceId: string
): Promise<void> {
  let isOwner = false

  switch (resourceType) {
    case 'price_alert':
      const alert = await prisma.priceAlert.findFirst({
        where: { id: resourceId, userId },
      })
      isOwner = !!alert
      break

    case 'watchlist':
      const watchlist = await prisma.watchlist.findFirst({
        where: { id: resourceId, userId },
      })
      isOwner = !!watchlist
      break

    case 'notification':
      const notification = await prisma.notification.findFirst({
        where: { id: resourceId, userId },
      })
      isOwner = !!notification
      break
  }

  if (!isOwner) {
    throw new Error('Forbidden: You do not own this resource')
  }
}

// ────────────────────────────────────────────────────────
// 5. VERIFY API KEY (for webhooks)
// ────────────────────────────────────────────────────────
export async function verifyApiKey(apiKey: string): Promise<{
  organizationId: string
  apiKeyId: string
  name: string
} | null> {
  // Find by prefix (first 8 chars)
  const keyPrefix = apiKey.substring(0, 8)

  const apiKeyRecord = await prisma.apiKey.findFirst({
    where: {
      key: { startsWith: keyPrefix },
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
  const isValid = await bcrypt.compare(apiKey, apiKeyRecord.key)

  if (!isValid) {
    return null
  }

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKeyRecord.id },
    data: { lastUsedAt: new Date() },
  })

  return {
    organizationId: apiKeyRecord.organizationId,
    apiKeyId: apiKeyRecord.id,
    name: apiKeyRecord.name,
  }
}

export async function requireApiKey(request: NextRequest) {
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
```

---

## 3. FLOW AUTHENTICATION

### 🔄 Session-based Auth Flow (User routes):

```
1. User logs in
   POST /api/auth/sign-in/email
   { email, password }
   │
   ├─→ Better Auth verifies credentials
   ├─→ Creates session in DB
   └─→ Sets session cookie (httpOnly, secure, sameSite)

2. User makes request
   GET /api/price-alerts/list
   Cookie: better-auth.session_token=xxx
   │
   ├─→ Middleware intercepts request
   ├─→ Calls Better Auth GET /api/auth/get-session
   ├─→ Verifies session cookie
   │
   ├─ If VALID:
   │   ├─→ Adds x-user-id, x-user-email to headers
   │   └─→ Pass to route handler
   │
   └─ If INVALID:
       ├─→ API routes: Return 401
       └─→ Pages: Redirect to /auth/login?redirect=/current-page

3. Route handler
   GET /api/price-alerts/list
   Headers: x-user-id, x-user-email (from middleware)
   │
   ├─→ requireAuth(request) → Get userId from headers
   ├─→ requireOrganizationMembership(userId) → Get organizationId
   ├─→ Query DB with filters: WHERE userId AND organizationId
   └─→ Return filtered results
```

### 🔑 API Key Auth Flow (Webhooks):

```
1. Admin generates API key
   POST /api/admin/api-keys
   { name: "NFT Marketplace Integration" }
   │
   ├─→ Generate random key: zuno_1234567890abcdef...
   ├─→ Hash with bcrypt (store hash in DB)
   └─→ Return key to admin (show once, cannot retrieve)

2. External service makes request
   POST /api/webhooks/price-change
   Headers: x-api-key: zuno_1234567890abcdef...
   Body: { itemType, itemId, currentPrice, ... }
   │
   ├─→ Middleware checks for x-api-key header
   │   ├─ If missing → 401
   │   └─ If present → Pass through
   │
   ├─→ Route handler calls requireApiKey(request)
   │   ├─→ Extract API key from header
   │   ├─→ Find by prefix in DB
   │   ├─→ Verify with bcrypt.compare()
   │   │   ├─ If invalid → 401
   │   │   └─ If valid → Return organizationId
   │   └─→ Update lastUsedAt timestamp
   │
   └─→ Process webhook with organizationId context
```

---

## 4. CÁC LOẠI AUTHENTICATION

### A. Session-based (Better Auth)

**Dùng cho:** User-facing routes (web, mobile)

**Ưu điểm:**
- ✅ Secure (httpOnly cookie)
- ✅ Automatic session management
- ✅ Built-in CSRF protection
- ✅ Easy revocation (delete session from DB)

**Nhược điểm:**
- ❌ Requires cookie support
- ❌ Not suitable for server-to-server

**Implementation:**
```typescript
// Login
await signIn.email({
  email: 'user@example.com',
  password: 'password123',
})

// Middleware auto-verifies session
// Route handler gets userId from headers
const { userId } = requireAuth(request)
```

### B. API Key Authentication

**Dùng cho:** Server-to-server, webhooks, integrations

**Ưu điểm:**
- ✅ Simple for external integrations
- ✅ No cookie/session needed
- ✅ Easy to rotate
- ✅ Can have different permissions

**Nhược điểm:**
- ❌ Key management complexity
- ❌ Risk if key leaked

**Implementation:**
```typescript
// Generate
const apiKey = crypto.randomBytes(32).toString('hex')
const hashedKey = await bcrypt.hash(apiKey, 10)

await prisma.apiKey.create({
  data: {
    key: hashedKey,
    organizationId: 'org-123',
    name: 'Marketplace Integration',
  },
})

// Use
curl -H "x-api-key: zuno_abc123..." \
  https://api.example.com/webhooks/price-change
```

---

## 5. MIDDLEWARE PROTECTION

### Route Protection Matrix:

| Pattern | Auth Type | Action | Status Code |
|---------|-----------|--------|-------------|
| `/auth/**` | None | Allow | 200 |
| `/api/auth/**` | None | Allow | 200 |
| `/api/metrics` | Network firewall | Allow | 200 |
| `/api/webhooks/**` | API Key | Check header | 401 if missing |
| `/api/**` | Session | Check cookie | 401 if invalid |
| `/admin/**` | Session + Admin | Check isAdmin | 403 if not admin |
| `/**` (pages) | Session | Redirect to login | 302 if invalid |

### Middleware Configuration:

```typescript
// src/middleware.ts

export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 6. API ROUTE PROTECTION

### Example 1: Price Alert Create (User auth)

```typescript
// src/app/api/price-alerts/create/route.ts

export async function POST(request: NextRequest) {
  try {
    // ─────────────────────────────────────────────────────
    // 1. AUTHENTICATE USER
    // ─────────────────────────────────────────────────────
    const { userId } = requireAuth(request)
    // Throws if no x-user-id header (middleware failed)

    // ─────────────────────────────────────────────────────
    // 2. GET USER'S ORGANIZATION
    // ─────────────────────────────────────────────────────
    const { organizationId } = await requireOrganizationMembership(userId)
    // Throws if user not in any org

    // ─────────────────────────────────────────────────────
    // 3. VALIDATE INPUT
    // ─────────────────────────────────────────────────────
    const body = await request.json()
    const validatedData = createPriceAlertSchema.parse(body)

    // ─────────────────────────────────────────────────────
    // 4. CREATE RESOURCE (scoped to user + org)
    // ─────────────────────────────────────────────────────
    const priceAlert = await priceAlertService.createPriceAlert({
      userId,              // From auth
      organizationId,      // From membership
      ...validatedData,    // From request body
    })

    return NextResponse.json({ success: true, data: priceAlert })

  } catch (error) {
    // Handle auth errors
    if (error instanceof Error && error.message.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.startsWith('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    // ... other error handling
  }
}
```

### Example 2: Price Alert Delete (Resource ownership)

```typescript
// src/app/api/price-alerts/[id]/route.ts

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ─────────────────────────────────────────────────────
    // 1. AUTHENTICATE USER
    // ─────────────────────────────────────────────────────
    const { userId } = requireAuth(request)

    // ─────────────────────────────────────────────────────
    // 2. VERIFY OWNERSHIP
    // ─────────────────────────────────────────────────────
    await requireResourceOwnership(userId, 'price_alert', params.id)
    // Throws if user doesn't own this alert

    // ─────────────────────────────────────────────────────
    // 3. DELETE (or deactivate)
    // ─────────────────────────────────────────────────────
    const priceAlert = await prisma.priceAlert.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true, data: priceAlert })

  } catch (error) {
    // ... error handling
  }
}
```

### Example 3: Webhook (API key auth)

```typescript
// src/app/api/webhooks/price-change/route.ts

export async function POST(request: NextRequest) {
  try {
    // ─────────────────────────────────────────────────────
    // 1. VERIFY API KEY
    // ─────────────────────────────────────────────────────
    const { organizationId, apiKeyId } = await requireApiKey(request)
    // Throws if invalid/missing API key

    // ─────────────────────────────────────────────────────
    // 2. VALIDATE WEBHOOK PAYLOAD
    // ─────────────────────────────────────────────────────
    const body = await request.json()
    const validated = webhookSchema.parse(body)

    // ─────────────────────────────────────────────────────
    // 3. PROCESS (scoped to organization)
    // ─────────────────────────────────────────────────────
    await priceAlertService.checkPriceAlerts({
      organizationId,    // From API key
      ...validated,
    })

    // ─────────────────────────────────────────────────────
    // 4. LOG API KEY USAGE
    // ─────────────────────────────────────────────────────
    logger.info('Webhook received', {
      apiKeyId,
      organizationId,
      endpoint: '/webhooks/price-change',
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    // ... error handling
  }
}
```

---

## 7. TESTING SECURITY

### A. Manual Testing

```bash
# ═══════════════════════════════════════════════════════════
# 1. TEST UNAUTHENTICATED ACCESS (should fail)
# ═══════════════════════════════════════════════════════════
curl -X POST http://localhost:3000/api/price-alerts/create \
  -H "Content-Type: application/json" \
  -d '{
    "itemType": "nft",
    "itemId": "nft-123",
    "targetPrice": 50,
    "condition": "below"
  }'

# Expected: 401 Unauthorized


# ═══════════════════════════════════════════════════════════
# 2. TEST WITH VALID SESSION
# ═══════════════════════════════════════════════════════════
# First login
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }' \
  -c cookies.txt

# Then use session cookie
curl -X POST http://localhost:3000/api/price-alerts/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "itemType": "nft",
    "itemId": "nft-123",
    "targetPrice": 50,
    "condition": "below"
  }'

# Expected: 200 OK with created alert


# ═══════════════════════════════════════════════════════════
# 3. TEST RESOURCE OWNERSHIP (try to delete someone else's alert)
# ═══════════════════════════════════════════════════════════
curl -X DELETE http://localhost:3000/api/price-alerts/another-users-alert-id \
  -b cookies.txt

# Expected: 403 Forbidden


# ═══════════════════════════════════════════════════════════
# 4. TEST API KEY AUTH
# ═══════════════════════════════════════════════════════════
curl -X POST http://localhost:3000/api/webhooks/price-change \
  -H "Content-Type: application/json" \
  -H "x-api-key: zuno_abc123def456..." \
  -d '{
    "itemType": "nft",
    "itemId": "nft-123",
    "currentPrice": 45,
    "itemName": "Bored Ape #123",
    "imageUrl": "https://..."
  }'

# Expected: 200 OK


# ═══════════════════════════════════════════════════════════
# 5. TEST ADMIN ACCESS (non-admin trying to access admin route)
# ═══════════════════════════════════════════════════════════
curl http://localhost:3000/admin/api-keys \
  -b cookies.txt

# Expected: 403 Forbidden (if not admin)
```

### B. Automated Testing

```typescript
// tests/security/auth.test.ts

describe('Authentication', () => {
  it('should reject unauthenticated requests', async () => {
    const res = await fetch('/api/price-alerts/create', {
      method: 'POST',
      body: JSON.stringify({ ... }),
    })

    expect(res.status).toBe(401)
  })

  it('should accept authenticated requests', async () => {
    // Login first
    const session = await login('user@example.com', 'password')

    const res = await fetch('/api/price-alerts/create', {
      method: 'POST',
      headers: {
        'Cookie': session.cookie,
      },
      body: JSON.stringify({ ... }),
    })

    expect(res.status).toBe(200)
  })

  it('should enforce resource ownership', async () => {
    const user1Session = await login('user1@example.com', 'pass')
    const user2Session = await login('user2@example.com', 'pass')

    // User1 creates alert
    const alert = await createAlert(user1Session)

    // User2 tries to delete User1's alert
    const res = await fetch(`/api/price-alerts/${alert.id}`, {
      method: 'DELETE',
      headers: {
        'Cookie': user2Session.cookie,
      },
    })

    expect(res.status).toBe(403) // Forbidden
  })

  it('should verify API keys', async () => {
    const validKey = 'zuno_validkey123'
    const invalidKey = 'zuno_invalidkey'

    const validRes = await fetch('/api/webhooks/price-change', {
      method: 'POST',
      headers: {
        'x-api-key': validKey,
      },
      body: JSON.stringify({ ... }),
    })

    const invalidRes = await fetch('/api/webhooks/price-change', {
      method: 'POST',
      headers: {
        'x-api-key': invalidKey,
      },
      body: JSON.stringify({ ... }),
    })

    expect(validRes.status).toBe(200)
    expect(invalidRes.status).toBe(401)
  })
})
```

---

## 8. BEST PRACTICES

### ✅ DO's:

1. **Always authenticate at route level**
   ```typescript
   const { userId } = requireAuth(request) // Always first line
   ```

2. **Check organization membership**
   ```typescript
   const { organizationId } = await requireOrganizationMembership(userId)
   ```

3. **Filter queries by userId and organizationId**
   ```typescript
   const alerts = await prisma.priceAlert.findMany({
     where: {
       userId,           // Prevents seeing other users' data
       organizationId,   // Prevents cross-org access
     },
   })
   ```

4. **Verify resource ownership before mutations**
   ```typescript
   await requireResourceOwnership(userId, 'price_alert', alertId)
   await prisma.priceAlert.update({ where: { id: alertId }, ... })
   ```

5. **Use API keys for webhooks**
   ```typescript
   const { organizationId } = await requireApiKey(request)
   ```

6. **Log security events**
   ```typescript
   logger.warn('Unauthorized access attempt', {
     userId,
     endpoint: request.url,
     ip: request.headers.get('x-forwarded-for'),
   })
   ```

7. **Return appropriate status codes**
   - 401: Unauthenticated (no/invalid session/API key)
   - 403: Forbidden (authenticated but not authorized)
   - 404: Not found (or hide existence from unauthorized users)

### ❌ DON'Ts:

1. **Never trust client-provided IDs without verification**
   ```typescript
   // ❌ BAD
   const { userId } = await request.json() // Client can fake this!

   // ✅ GOOD
   const { userId } = requireAuth(request) // From middleware
   ```

2. **Never skip authentication**
   ```typescript
   // ❌ BAD
   export async function POST(request: NextRequest) {
     const body = await request.json()
     await createAlert(body) // No auth check!
   }

   // ✅ GOOD
   export async function POST(request: NextRequest) {
     const { userId } = requireAuth(request) // Always check
     // ...
   }
   ```

3. **Never return error details to unauthorized users**
   ```typescript
   // ❌ BAD
   catch (error) {
     return NextResponse.json({
       error: error.message, // May leak sensitive info
       stack: error.stack,   // Definitely leaks info
     })
   }

   // ✅ GOOD
   catch (error) {
     logger.error('Error', { error }) // Log internally
     return NextResponse.json({
       error: 'Internal server error', // Generic message
     }, { status: 500 })
   }
   ```

4. **Never store API keys in plaintext**
   ```typescript
   // ❌ BAD
   await prisma.apiKey.create({
     data: { key: apiKey }, // Plaintext!
   })

   // ✅ GOOD
   const hashedKey = await bcrypt.hash(apiKey, 10)
   await prisma.apiKey.create({
     data: { key: hashedKey },
   })
   ```

5. **Never expose internal IDs in errors**
   ```typescript
   // ❌ BAD
   return NextResponse.json({
     error: 'User user-internal-id-123 not found',
   })

   // ✅ GOOD
   return NextResponse.json({
     error: 'Resource not found',
   }, { status: 404 })
   ```

---

## 🎯 CHECKLIST TRIỂN KHAI

### Phase 1: Core Security (COMPLETED ✅)
- [x] Middleware.ts created
- [x] API auth utilities created
- [x] Session-based auth working
- [x] API key generation working

### Phase 2: Route Protection (IN PROGRESS 🚧)
- [x] Price alerts routes protected
- [ ] Watchlist routes protected
- [ ] Drops routes protected
- [ ] Webhooks use API keys
- [ ] Admin routes check isAdmin

### Phase 3: Testing (PENDING ⏳)
- [ ] Unit tests for auth utilities
- [ ] Integration tests for protected routes
- [ ] Security penetration testing
- [ ] Load testing with auth

### Phase 4: Documentation (COMPLETED ✅)
- [x] Security guide created
- [ ] API documentation with auth examples
- [ ] Client integration guide

---

## 📞 LIÊN HỆ VÀ HỖ TRỢ

Nếu có vấn đề về security:
1. Kiểm tra logs: `src/logs/`
2. Xem Better Auth session: Database table `session`
3. Test middleware: Add console.log in `src/middleware.ts`
4. Verify API key: Check `api_keys` table

**Critical security issues:** Email security@example.com
