# CLAUDE.md - AI Assistant Guide

**Project**: Zuno Marketplace Notifications
**Version**: 1.0.0
**Status**: 🚧 Under Development (Planning Phase)
**Last Updated**: 2025-11-15

---

## Quick Start for AI Assistants

This document provides essential context for AI assistants (like Claude) working on the Zuno Marketplace Notifications codebase. Read this file first before making any code changes.

---

## Project Overview

### What This Project Does

An **enterprise-grade, multi-channel notification service** for the Zuno NFT Marketplace ecosystem. It delivers reliable, scalable notifications across Email, WebSocket, Push, and SMS channels using a robust outbox pattern with retry mechanisms.

### Key Characteristics

- **Architecture**: Clean Architecture (Domain → Application → Infrastructure → Presentation)
- **Tech Stack**: Next.js 16, TypeScript, Prisma, PostgreSQL (NeonDB), Redis, Better-Auth
- **Reliability**: At-least-once delivery via Outbox Pattern
- **Scalability**: Horizontal scaling with stateless workers
- **Multi-tenancy**: Organization-based isolation via Better-Auth

### Current Development Phase

**Phase 1: Foundation (Weeks 1-2)** - Currently in planning phase
- ✅ Documentation complete (38 files)
- 🚧 Implementation starting
- Next: Database schema, authentication, core domain entities

---

## Repository Structure

### Current State (Planning Phase)

```
zuno-marketplace-notifications/
├── docs/                      # Complete documentation (8 files exist, 30 planned)
│   ├── 00-INDEX.md           # Master index
│   ├── 01-PROJECT-OVERVIEW.md
│   ├── 02-ARCHITECTURE.md    # System architecture (CRITICAL)
│   ├── 03-DATABASE-SCHEMA.md # Complete Prisma schema
│   ├── 04-PROJECT-SETUP.md   # Setup instructions
│   ├── 05-DIRECTORY-STRUCTURE.md
│   ├── 30-GIT-WORKFLOW.md    # Branch strategy, commits
│   └── 31-PHASE-1-FOUNDATION.md # Implementation guide
├── README.md                  # Public-facing documentation
├── DOCUMENTATION-SUMMARY.md   # Overview of all docs
├── PROJECT-CHECKLIST.md       # Implementation checklist
└── CLAUDE.md                  # This file
```

### Planned Structure (Not Yet Created)

```
src/
├── app/                       # Next.js App Router (API + pages)
│   ├── api/                   # API routes
│   │   ├── notifications/     # Notification endpoints
│   │   ├── templates/         # Template management
│   │   ├── preferences/       # User preferences
│   │   └── webhooks/          # External webhooks
│   └── admin/                 # Admin UI pages
├── core/                      # Domain & Application Layer
│   ├── domain/                # Entities, value objects, events
│   ├── use-cases/             # Business logic
│   └── services/              # Domain services
├── infrastructure/            # External dependencies
│   ├── database/              # Prisma client
│   ├── repositories/          # Data access
│   ├── channels/              # Email, WebSocket, Push, SMS
│   ├── outbox/                # Outbox pattern
│   └── cache/                 # Redis
├── components/                # React components
│   ├── admin/                 # Admin-specific
│   ├── shared/                # Reusable components
│   └── ui/                    # shadcn/ui components
├── lib/                       # Utilities
│   ├── auth/                  # Better-Auth config
│   ├── logger/                # Winston logger
│   ├── utils/                 # Helper functions
│   └── config/                # Environment validation
└── workers/                   # Background workers
```

---

## Critical Architecture Patterns

### 1. Outbox Pattern (MOST IMPORTANT)

**Purpose**: Ensure reliable notification delivery with at-least-once semantics

**How It Works**:
```typescript
// Write to database + outbox in single transaction
await prisma.$transaction(async (tx) => {
  // Create notification record
  await tx.notification.create({ data: notificationData })

  // Create outbox entry (same transaction!)
  await tx.outbox.create({ data: outboxData })
})

// Background worker polls outbox every 1 second
// Processes pending records → sends to channels → updates status
```

**Key Points**:
- ALWAYS write to outbox in same transaction as notification
- Outbox status flow: `pending` → `processing` → `sent` or `failed`
- Worker uses `SELECT FOR UPDATE SKIP LOCKED` to prevent concurrent processing

### 2. Clean Architecture Layers

**Dependency Rules** (STRICT):
```
Domain Layer (core/domain/)
  ↑ No dependencies - pure business logic

Application Layer (core/use-cases/)
  ↑ Depends on Domain only

Infrastructure Layer (infrastructure/)
  ↑ Depends on Application & Domain

Presentation Layer (app/)
  ↑ Depends on all layers
```

**Never violate these dependencies!** Domain must remain pure.

### 3. Retry with Exponential Backoff

```typescript
// Retry delays: 1s, 2s, 4s, 8s, 16s
delay = BASE_DELAY_MS * Math.pow(2, retryCount)

// After 5 attempts → Dead Letter Queue
if (retryCount >= 5) {
  await moveToDeadLetterQueue(notification)
}
```

### 4. Idempotency

```typescript
// Use idempotency keys to prevent duplicate sends
const idempotencyKey = request.headers['idempotency-key'] || generateKey()

// Check Redis cache (24-hour window)
const existing = await redis.get(`idempotency:${idempotencyKey}`)
if (existing) {
  return JSON.parse(existing) // Return cached response
}
```

---

## Development Workflows

### Git Workflow

**Branch Strategy**:
```
main (production)
└── develop (integration)
    ├── feature/* (new features)
    ├── fix/* (bug fixes)
    └── hotfix/* (critical fixes)
```

**Branch Naming**:
```bash
<type>/<ticket-id>-<short-description>

Examples:
feature/NOT-123-add-websocket-channel
fix/NOT-456-rate-limit-bug
hotfix/NOT-789-critical-email-failure
```

**Conventional Commits**:
```
<type>(<scope>): <subject>

Examples:
feat(email): add template versioning
fix(rate-limit): prevent race condition
docs(api): update endpoint documentation
```

**Pre-Push Checklist** (MANDATORY):
```bash
pnpm typecheck   # TypeScript type checking
pnpm lint        # ESLint
pnpm test        # Jest tests
pnpm build       # Next.js build
```

### Creating Features

1. **Always start from `develop` branch**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/NOT-123-description
   ```

2. **Make atomic commits** (one logical change per commit)

3. **Keep branch updated**:
   ```bash
   git fetch origin develop
   git rebase origin/develop
   ```

4. **Create PR with template** (see `.github/PULL_REQUEST_TEMPLATE.md`)

---

## Coding Standards

### TypeScript Rules

1. **Strict Mode**: No `any` type (use `unknown` instead)
2. **Explicit Return Types**: All functions must declare return types
3. **No Null**: Prefer `undefined` over `null`
4. **Immutability**: Use `readonly` for arrays/objects that shouldn't change

### Import Order (STRICT)

```typescript
// 1. External dependencies
import { z } from 'zod'
import { prisma } from '@prisma/client'

// 2. Internal core (domain, use-cases)
import { Notification } from '@/core/domain/entities/notification.entity'
import { SendNotificationUseCase } from '@/core/use-cases/notifications/send-notification.use-case'

// 3. Infrastructure
import { NotificationRepository } from '@/infrastructure/repositories/notification.repository'

// 4. Components
import { Button } from '@/components/ui/button'

// 5. Utilities
import { logger } from '@/lib/logger/logger'
import { cn } from '@/lib/utils/cn'

// 6. Types
import type { NotificationType } from '@/core/domain/types/notification.types'

// 7. Relative imports (if needed)
import { formatDate } from '../utils/date'
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase | `NotificationsList.tsx` |
| **Files** | kebab-case | `send-notification.use-case.ts` |
| **Functions** | camelCase | `sendNotification()` |
| **Constants** | SCREAMING_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| **Interfaces** | PascalCase with `I` prefix | `INotificationRepository` |
| **Types** | PascalCase | `NotificationStatus` |
| **Enums** | PascalCase | `Channel` |

### File Naming Patterns

```
*.entity.ts        # Domain entities
*.vo.ts            # Value objects
*.use-case.ts      # Use cases
*.service.ts       # Services
*.repository.ts    # Repositories
*.test.ts          # Tests
*.types.ts         # Type definitions
```

### Error Handling

```typescript
// ✅ GOOD: Always use try-catch with logger
try {
  await sendEmail(notification)
  logger.info('Email sent', { notificationId: notification.id })
} catch (error) {
  logger.error('Failed to send email', { error, notificationId: notification.id })
  throw new AppError('EMAIL_SEND_FAILED', { cause: error })
}

// ❌ BAD: Never use console.log
console.log('Email sent') // NEVER DO THIS

// ❌ BAD: Don't swallow errors
try {
  await sendEmail(notification)
} catch (error) {
  // Silent failure - BAD!
}
```

### Logging

```typescript
// Use structured logging with correlation IDs
logger.info('Notification created', {
  correlationId: request.correlationId,
  notificationId: notification.id,
  userId: user.id,
  channel: notification.channel
})

// Never use console.log, console.error, etc.
```

---

## Key Technologies & Patterns

### Database (Prisma + PostgreSQL)

**Key Models**:
- `Organization`: Multi-tenant isolation
- `User`: User accounts (Better-Auth managed)
- `Notification`: Notification records
- `Outbox`: Outbox pattern table
- `Template`: Email/notification templates
- `UserPreference`: User notification preferences
- `DeliveryAttempt`: Retry tracking
- `AuditLog`: Compliance & debugging

**Indexing Strategy**:
```prisma
// Optimize for common queries
@@index([organizationId, userId, createdAt]) // User notifications
@@index([status, scheduledAt])               // Outbox polling
@@index([channel, status, createdAt])        // Channel analytics
```

**Transactions**:
```typescript
// Always use transactions for outbox writes
await prisma.$transaction(async (tx) => {
  await tx.notification.create({ data })
  await tx.outbox.create({ data })
})
```

### Authentication (Better-Auth)

```typescript
// Organization-based multi-tenancy
const session = await auth.getSession()
const organizationId = session.user.organizationId

// ALWAYS filter queries by organizationId
await prisma.notification.findMany({
  where: {
    organizationId, // Required for data isolation
    userId
  }
})
```

### Channels

All channels implement `IChannel` interface:
```typescript
export interface IChannel {
  readonly name: ChannelType
  send(notification: ChannelNotification): Promise<ChannelResult>
  validatePayload(payload: unknown): Result<ChannelNotification>
  healthCheck(): Promise<boolean>
}
```

**Supported Channels**:
- **Email**: Resend (prod), Mailpit (dev)
- **WebSocket**: Real-time notifications
- **Push**: Firebase (future)
- **SMS**: Twilio (future)

---

## Common Tasks for AI Assistants

### Task: Add a New Notification Type

1. **Update domain enum**:
   ```typescript
   // src/core/domain/types/notification.types.ts
   export enum NotificationType {
     AUCTION_WON = 'auction_won',
     BID_PLACED = 'bid_placed',
     NEW_LISTING = 'new_listing', // ← Add here
   }
   ```

2. **Update Prisma schema**:
   ```prisma
   enum NotificationType {
     AUCTION_WON
     BID_PLACED
     NEW_LISTING  // ← Add here
   }
   ```

3. **Create migration**:
   ```bash
   pnpm db:migrate:dev --name add_new_listing_type
   ```

4. **Add template** (if email):
   ```typescript
   // src/infrastructure/channels/email/templates/new-listing.tsx
   ```

### Task: Add a New API Endpoint

1. **Create use case** (Application Layer):
   ```typescript
   // src/core/use-cases/notifications/your-use-case.use-case.ts
   export class YourUseCase {
     async execute(input: YourInput): Promise<YourOutput> {
       // Business logic here
     }
   }
   ```

2. **Create API route** (Presentation Layer):
   ```typescript
   // src/app/api/notifications/your-endpoint/route.ts
   import { YourUseCase } from '@/core/use-cases/notifications/your-use-case.use-case'

   export async function POST(request: Request) {
     // Validate, authenticate, execute use case
   }
   ```

3. **Add tests**:
   ```typescript
   // tests/unit/core/use-cases/notifications/your-use-case.test.ts
   // tests/integration/api/notifications/your-endpoint.test.ts
   ```

### Task: Add Database Migration

```bash
# 1. Update prisma/schema.prisma
# 2. Create migration
pnpm db:migrate:dev --name descriptive_name

# 3. Apply to production (when ready)
pnpm db:migrate:deploy
```

### Task: Debug Outbox Processing

```typescript
// Check outbox status
const pending = await prisma.outbox.findMany({
  where: { status: 'pending' },
  orderBy: { createdAt: 'asc' }
})

// Check delivery attempts
const attempts = await prisma.deliveryAttempt.findMany({
  where: { notificationId: 'xyz' },
  orderBy: { attemptedAt: 'desc' }
})

// Check worker logs
logger.debug('Outbox processing', {
  batchSize: pending.length,
  oldestPending: pending[0]?.createdAt
})
```

---

## Testing Strategy

### Test Pyramid

```
       E2E (10%)
      /         \
     /           \
    / Integration \
   /     (20%)     \
  /                 \
 /_____Unit (70%)____\
```

### Test Locations

```
tests/
├── unit/                      # Unit tests (70% of tests)
│   ├── core/
│   │   ├── entities/
│   │   ├── use-cases/
│   │   └── services/
│   └── lib/utils/
├── integration/               # Integration tests (20%)
│   ├── api/
│   └── repositories/
└── e2e/                       # E2E tests (10%)
    └── critical-flows/
```

### Test Naming

```typescript
// Pattern: describe what, test should/when/given
describe('SendNotificationUseCase', () => {
  it('should create notification and outbox entry in transaction', async () => {
    // Arrange, Act, Assert
  })

  it('should reject when user preferences are disabled', async () => {
    // Test
  })
})
```

### Coverage Requirements

- **Minimum**: 80% overall
- **Critical paths**: 100% (outbox, retry, payment flows)

---

## Environment & Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
BETTER_AUTH_SECRET="..."          # 32+ chars
BETTER_AUTH_URL="http://localhost:3000"

# Email
RESEND_API_KEY="re_..."           # Production
MAILPIT_SMTP_HOST="localhost"     # Local dev
MAILPIT_SMTP_PORT="1025"

# Cache & Rate Limiting
REDIS_URL="redis://localhost:6379"

# Application
NODE_ENV="development"
PORT="3000"
LOG_LEVEL="debug"

# Feature Flags
ENABLE_WEBSOCKET="true"
ENABLE_PUSH="false"
ENABLE_SMS="false"
```

### Local Development Services

```bash
# Start Docker services
pnpm docker:up

# Services:
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
# - Mailpit UI: localhost:8025
```

---

## Performance Considerations

### Database Optimization

1. **Use indexes** for all frequent queries
2. **Avoid N+1 queries** - use `include` or `select`
3. **Paginate large result sets** (max 100 records)
4. **Use connection pooling** (configured in Prisma)

### Caching Strategy

```typescript
// Use Redis for:
// 1. Rate limiting (token bucket)
// 2. Idempotency keys (24-hour TTL)
// 3. Session storage (Better-Auth)
// 4. User preferences (5-minute TTL)

await redis.setex(`cache:preferences:${userId}`, 300, JSON.stringify(prefs))
```

### Rate Limiting

```typescript
// Per-channel limits
email: 1000/hour per organization
websocket: unlimited (connection-based)
sms: 100/hour per organization
push: 10000/hour per organization
```

---

## Security Checklist

When implementing features, ensure:

- [ ] Input validation with Zod schemas
- [ ] Authentication via Better-Auth middleware
- [ ] Authorization checks (organizationId filtering)
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React escapes by default)
- [ ] Rate limiting on API endpoints
- [ ] Secrets in environment variables (never hardcoded)
- [ ] Audit logging for sensitive operations
- [ ] HTTPS/TLS for all external communication

---

## Observability

### Logging

```typescript
// Use correlation IDs to trace requests
logger.info('Processing notification', {
  correlationId: req.correlationId,
  notificationId: notification.id,
  userId: user.id,
  channel: notification.channel
})
```

### Metrics to Track

- Notification send rate (per channel)
- Delivery success rate
- Retry rate
- Outbox queue depth
- API latency (P50, P95, P99)
- Error rate by type

### Health Checks

```typescript
// GET /api/health
{
  "status": "healthy",
  "timestamp": "2025-11-15T12:34:56.789Z",
  "checks": {
    "database": "healthy",
    "cache": "healthy",
    "email": "healthy",
    "websocket": "healthy"
  }
}
```

---

## Documentation References

### Must-Read Documents

1. **[docs/02-ARCHITECTURE.md](./docs/02-ARCHITECTURE.md)** - System architecture (READ FIRST)
2. **[docs/03-DATABASE-SCHEMA.md](./docs/03-DATABASE-SCHEMA.md)** - Complete database schema
3. **[docs/05-DIRECTORY-STRUCTURE.md](./docs/05-DIRECTORY-STRUCTURE.md)** - Code organization
4. **[docs/30-GIT-WORKFLOW.md](./docs/30-GIT-WORKFLOW.md)** - Branch strategy & commits
5. **[docs/31-PHASE-1-FOUNDATION.md](./docs/31-PHASE-1-FOUNDATION.md)** - Implementation guide

### Reference Documents

- **[README.md](./README.md)** - Public-facing documentation
- **[DOCUMENTATION-SUMMARY.md](./DOCUMENTATION-SUMMARY.md)** - Overview of all docs
- **[docs/00-INDEX.md](./docs/00-INDEX.md)** - Master index of 38 documentation files

---

## Common Pitfalls to Avoid

### ❌ DON'T

1. **Skip transactions** when writing to outbox
   ```typescript
   // ❌ BAD - Notification and outbox created separately
   await prisma.notification.create({ data })
   await prisma.outbox.create({ data }) // Could fail after notification created!
   ```

2. **Forget organizationId filtering**
   ```typescript
   // ❌ BAD - Leaks data across organizations
   await prisma.notification.findMany({
     where: { userId }
   })
   ```

3. **Use console.log** for logging
   ```typescript
   // ❌ BAD
   console.log('Email sent')

   // ✅ GOOD
   logger.info('Email sent', { notificationId })
   ```

4. **Violate layer dependencies**
   ```typescript
   // ❌ BAD - Domain importing from Infrastructure
   import { prisma } from '@/infrastructure/database/prisma'
   ```

5. **Hardcode secrets**
   ```typescript
   // ❌ BAD
   const apiKey = 're_abc123'

   // ✅ GOOD
   const apiKey = process.env.RESEND_API_KEY
   ```

### ✅ DO

1. **Use transactions** for outbox writes
2. **Always filter by organizationId** for multi-tenancy
3. **Use structured logging** with correlation IDs
4. **Follow Clean Architecture** layer dependencies
5. **Validate all inputs** with Zod schemas
6. **Write tests** for all business logic
7. **Add comments** explaining "why", not "what"
8. **Use TypeScript strict mode** (no `any`)

---

## Quick Reference Commands

```bash
# Development
pnpm dev                  # Start Next.js dev server
pnpm workers              # Start background workers
pnpm docker:up            # Start PostgreSQL, Redis, Mailpit

# Database
pnpm db:generate          # Generate Prisma client
pnpm db:migrate:dev       # Create & apply migration
pnpm db:studio            # Open Prisma Studio GUI
pnpm db:seed              # Seed test data
pnpm db:reset             # Reset database (destructive!)

# Testing
pnpm test                 # Run tests in watch mode
pnpm test:ci              # Run tests with coverage
pnpm test:e2e             # Run E2E tests

# Code Quality
pnpm typecheck            # TypeScript type checking
pnpm lint                 # ESLint
pnpm lint:fix             # Auto-fix linting issues
pnpm format               # Prettier formatting

# Pre-push (MUST PASS)
pnpm typecheck && pnpm lint && pnpm test && pnpm build

# Git
git checkout develop && git pull
git checkout -b feature/NOT-123-description
git commit -m "feat(scope): description"
git push origin feature/NOT-123-description
```

---

## AI Assistant Tips

### When Asked to Add a Feature

1. **Read architecture docs first** (especially docs/02-ARCHITECTURE.md)
2. **Follow Clean Architecture** layers strictly
3. **Check existing patterns** before inventing new ones
4. **Write tests** alongside implementation
5. **Update documentation** if behavior changes
6. **Use conventional commits** for all commits

### When Debugging

1. **Check outbox status** first (most issues are delivery-related)
2. **Look at delivery attempts** for retry history
3. **Search logs** using correlation IDs
4. **Verify user preferences** (user may have opted out)
5. **Check rate limits** (may be throttled)

### When Reviewing Code

1. **Verify layer dependencies** (Domain must be pure)
2. **Check transaction usage** (outbox writes must be transactional)
3. **Ensure organizationId filtering** (multi-tenancy)
4. **Validate input schemas** (Zod validation present)
5. **Look for hardcoded values** (should be in env or constants)

---

## Contact & Support

For questions about this codebase:

1. **Documentation Issues**: Check [docs/36-TROUBLESHOOTING.md](./docs/36-TROUBLESHOOTING.md) (when created)
2. **Architecture Questions**: Read [docs/02-ARCHITECTURE.md](./docs/02-ARCHITECTURE.md)
3. **Setup Issues**: Follow [docs/04-PROJECT-SETUP.md](./docs/04-PROJECT-SETUP.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-15 | Initial CLAUDE.md creation |

---

**Remember**: This project uses Clean Architecture. Keep domain logic pure, respect layer boundaries, and always use the outbox pattern for reliable delivery. When in doubt, check the documentation in `docs/`.
