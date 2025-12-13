# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Zuno Marketplace Notifications** is an enterprise-grade, multi-channel notification service for the Zuno NFT Marketplace. It provides reliable, scalable notification delivery across Email, WebSocket, Push (future), and SMS (future) channels.

**Key Technologies**: Next.js 16 (App Router), TypeScript 5, Prisma ORM, Better Auth, PostgreSQL (NeonDB), Redis, shadcn/ui, TanStack Query

## Essential Commands

### Before Commit/Task Completion (MANDATORY)
**ALWAYS run these commands in order before committing or marking a task complete:**

```bash
pnpm lint          # ESLint - fix issues with `pnpm lint:fix`
pnpm typecheck     # TypeScript type checking
pnpm test          # Jest tests (--passWithNoTests)
pnpm build         # Next.js production build
```

### Development

```bash
pnpm dev                    # Start Next.js dev server (localhost:3000)
pnpm docker:up              # Start PostgreSQL, Redis, Mailpit (REQUIRED for dev)
pnpm db:generate            # Generate Prisma Client (run after schema changes)
pnpm db:migrate             # Create and apply database migrations
pnpm db:studio              # Open Prisma Studio (database GUI)
```

### Database Operations

```bash
pnpm db:generate            # Generate Prisma Client from schema
pnpm db:migrate             # Create new migration and apply
pnpm db:migrate:deploy      # Apply pending migrations (production)
pnpm db:seed                # Seed database with test data
pnpm db:reset               # Reset database (DESTRUCTIVE)
```

Note: Prisma schema is at `src/infrastructure/database/prisma/schema.prisma` (not default location)

### Testing

```bash
pnpm test                   # Run tests in watch mode
pnpm test:ci                # Run tests with coverage (CI)
pnpm test:watch             # Run tests in watch mode
```

Test a single file:
```bash
pnpm test src/core/use-cases/notifications/send-notification.use-case.test.ts
```

### Code Quality

```bash
pnpm lint                   # Run ESLint
pnpm lint:fix               # Auto-fix linting issues
pnpm format                 # Format code with Prettier
```

## Architecture Overview

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Presentation Layer (src/app)                                │
│ - Next.js App Router (API routes + pages)                   │
│ - React components + shadcn/ui                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Application Layer (src/core)                                │
│ - Use Cases: Business logic orchestration                   │
│ - Domain Entities & Value Objects                           │
│ - Domain Services                                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Infrastructure Layer (src/infrastructure)                   │
│ - Repositories: Database access (Prisma)                    │
│ - Channels: Email, WebSocket, Push, SMS providers           │
│ - Outbox: Reliable message delivery pattern                 │
│ - Workers: Background processing                             │
└─────────────────────────────────────────────────────────────┘
```

### Critical Patterns

#### 1. Outbox Pattern for Reliability

All notifications use the **Outbox Pattern** to ensure at-least-once delivery:

```typescript
// src/infrastructure/outbox/outbox.repository.ts
async createWithNotification(notificationData, outboxData) {
  return await prisma.$transaction(async (tx) => {
    const notification = await tx.notification.create({ data: notificationData })
    const outbox = await tx.outbox.create({
      data: { ...outboxData, notification: { connect: { id: notification.id } } }
    })
    return { notification, outbox }
  })
}
```

**Flow**:
1. Notification + Outbox entry created in single transaction
2. Background workers (`src/workers/outbox-worker.ts`) poll Outbox table
3. Workers lock and process entries, updating status
4. Failed entries retry with exponential backoff (2, 4, 8, 16, 32 minutes)
5. After 5 retries, moved to Dead Letter Queue

#### 2. Multi-Tenant Organization Model

Better Auth provides organization-based multi-tenancy with RBAC:

- **Organizations**: Top-level tenant isolation
- **OrganizationMember**: User-to-organization mapping with roles (OWNER, ADMIN, EDITOR, VIEWER)
- **All resources** (notifications, templates, etc.) belong to an organization

**Auth**: Configured in `src/lib/auth/better-auth.ts` (not `auth.ts`)

#### 3. Channel Router Pattern

Notifications route through channels based on type:

```typescript
// src/infrastructure/channels/channel-router.ts
route(notification) {
  switch (notification.channel) {
    case 'EMAIL': return emailChannel
    case 'WEBSOCKET': return websocketChannel
    // ...
  }
}
```

Each channel implements `IChannel` interface:
- `send(notification)`: Send via provider
- `validate(payload)`: Validate payload structure

Providers: Resend (email), Mailpit (dev email), WebSocket (custom)

#### 4. Template System

Handlebars-based templates with versioning:

```typescript
// src/infrastructure/templates/template.service.ts
renderTemplate(templateId, variables) {
  const template = await getTemplate(templateId)
  const compiled = Handlebars.compile(template.body)
  return { subject: template.subject, body: compiled(variables) }
}
```

Templates support:
- Multiple versions (version history in `TemplateVersion` table)
- Channel-specific (EMAIL has subject/body, WEBSOCKET has message)
- Variable extraction from Handlebars syntax

## Directory Structure

```
src/
├── app/                           # Next.js App Router
│   ├── api/                       # API routes
│   │   ├── notifications/         # /api/notifications/*
│   │   ├── templates/             # /api/templates/*
│   │   ├── preferences/           # /api/preferences/*
│   │   ├── webhooks/              # /api/webhooks/*
│   │   └── health/                # /api/health
│   ├── (dashboard)/               # Protected dashboard routes
│   └── (auth)/                    # Auth pages (login, signup)
│
├── core/                          # Clean architecture domain layer
│   ├── domain/
│   │   ├── entities/              # Domain entities (Notification, etc.)
│   │   └── value-objects/         # Value objects (Email, NotificationId)
│   ├── use-cases/                 # Application business logic
│   │   └── notifications/         # Notification use cases
│   └── services/                  # Domain services
│       ├── template.service.ts
│       ├── rate-limit.service.ts
│       └── idempotency.service.ts
│
├── infrastructure/                # External dependencies
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # Database schema (NOT in root!)
│   │   │   └── seed.ts
│   │   ├── generated/             # Prisma Client output
│   │   └── prisma.ts              # Prisma client instance
│   ├── repositories/              # Database access layer
│   │   ├── notification.repository.ts
│   │   └── template.repository.ts
│   ├── outbox/                    # Outbox pattern implementation
│   │   └── outbox.repository.ts
│   ├── channels/                  # Notification channels
│   │   ├── channel.interface.ts
│   │   ├── channel-router.ts
│   │   ├── email/
│   │   │   ├── email.channel.ts
│   │   │   ├── resend.provider.ts
│   │   │   └── mailpit-provider.ts
│   │   └── websocket/
│   ├── templates/                 # Template rendering
│   └── rate-limiting/             # Rate limiting with Redis
│
├── workers/                       # Background workers
│   ├── outbox-worker.ts           # Process outbox entries
│   ├── retry-worker.ts            # Retry failed notifications
│   └── scheduler-worker.ts        # Future: scheduled notifications
│
├── components/                    # React components (shadcn/ui)
│   ├── ui/                        # shadcn/ui base components
│   └── features/                  # Feature-specific components
│
└── lib/                           # Utilities & configuration
    ├── auth/
    │   ├── better-auth.ts         # Better Auth config
    │   ├── client.ts              # Client-side auth
    │   └── guards.ts              # Auth guards
    ├── config/
    │   └── env.ts                 # Environment validation (Zod)
    ├── logger/
    │   └── logger.ts              # Winston logger
    ├── middleware/                # Express-style middleware
    └── redis/
        └── client.ts              # Redis client
```

## Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `src/lib/config/env.ts` | **Environment validation** - Zod schema validates all env vars on startup |
| `src/infrastructure/database/prisma/schema.prisma` | **Database schema** - Single source of truth (NOTE: not in project root!) |
| `src/lib/auth/better-auth.ts` | **Authentication config** - Better Auth setup with organizations |
| `src/infrastructure/outbox/outbox.repository.ts` | **Outbox pattern** - Transactional notification creation |
| `src/workers/outbox-worker.ts` | **Background processing** - Polls and processes outbox entries |
| `src/infrastructure/channels/channel-router.ts` | **Channel routing** - Routes notifications to correct channel |
| `src/core/use-cases/notifications/send-notification.use-case.ts` | **Send notification** - Main business logic entry point |

## Database Schema Key Concepts

### Notification Lifecycle

```
PENDING → PROCESSING → SENT → DELIVERED
   ↓
FAILED (with retries) → DEAD_LETTER (after max retries)
   ↓
CANCELLED or EXPIRED
```

### Notification Types

50+ notification types for NFT marketplace events:
- Auction events: `AUCTION_STARTED`, `AUCTION_ENDING_SOON`, `AUCTION_WON`, `AUCTION_OUTBID`
- Trading: `BID_PLACED`, `OFFER_RECEIVED`, `LISTING_SOLD`
- Price alerts: `FLOOR_PRICE_DROP`, `PRICE_DROP_ALERT`, `TARGET_PRICE_REACHED`
- Drops: `DROP_ANNOUNCED`, `DROP_LIVE`, `WHITELIST_APPROVED`
- Social: `USER_FOLLOWED`, `COLLECTION_FOLLOWED`
- System: `WELCOME`, `EMAIL_VERIFICATION`, `SECURITY_ALERT`

See `src/infrastructure/database/prisma/schema.prisma` for complete list.

### Important Indexes

- `notifications`: Indexed on `[organizationId, userId, createdAt]`, `[status, createdAt]`, `[nextRetryAt]`
- `outbox`: Indexed on `[status, scheduledAt]`, `[lockedAt, lockedBy]` for worker polling
- `templates`: Indexed on `[organizationId, slug, version]` for version lookups

## Environment Variables

**Required for development** (see `.env.example`):

```bash
# Database
DATABASE_URL="postgresql://..."        # NeonDB or local PostgreSQL

# Auth
BETTER_AUTH_SECRET="..."               # Min 32 chars
BETTER_AUTH_URL="http://localhost:3000"

# Email
RESEND_API_KEY="re_..."                # Production (Resend)
MAILPIT_SMTP_HOST="localhost"          # Dev (Mailpit in Docker)
MAILPIT_SMTP_PORT="1025"

# Cache
REDIS_URL="redis://localhost:6379"

# Application
NODE_ENV="development"
LOG_LEVEL="debug"

# Feature Flags
ENABLE_WEBSOCKET="true"
ENABLE_PUSH="false"
ENABLE_SMS="false"
```

**CI/CD Note**: Set `SKIP_ENV_VALIDATION=true` in CI to allow builds with dummy env vars.

## TypeScript Configuration

- **Strict mode** enabled
- **Path aliases**:
  - `@/*` → `src/*`
  - `@/core/*` → `src/core/*`
  - `@/infrastructure/*` → `src/infrastructure/*`
- **Target**: ES2022
- **Module resolution**: bundler (Next.js)
- Prisma Client auto-generated to `src/infrastructure/database/generated/`

## Git Workflow

**Branch Strategy**:
```
main (production)
└── develop (integration)
    ├── feature/* (new features)
    ├── fix/* (bug fixes)
    └── develop-claude/** (Claude Code branches)
```

**Conventional Commits**:
```
feat(notifications): add batch send API
fix(email): resolve template rendering bug
chore(deps): update Prisma to 6.1.0
docs(readme): update setup instructions
```

**CI Pipeline** (`.github/workflows/ci.yml`):
1. **Lint** → `pnpm lint`
2. **Typecheck** → `pnpm db:generate && pnpm typecheck`
3. **Test** → `pnpm db:generate && pnpm test:ci`
4. **Build** → `pnpm db:generate && pnpm build` (with `SKIP_ENV_VALIDATION=true`)

All checks must pass before merge.

## Development Workflow

### Starting Development

1. Start Docker services: `pnpm docker:up`
2. Run migrations: `pnpm db:migrate`
3. Generate Prisma Client: `pnpm db:generate`
4. Start dev server: `pnpm dev`
5. (Optional) Seed data: `pnpm db:seed`

### Making Database Changes

1. Edit `src/infrastructure/database/prisma/schema.prisma`
2. Run `pnpm db:migrate` (creates migration + applies)
3. Run `pnpm db:generate` (updates Prisma Client)
4. Commit both schema and migration files

### Testing Email Locally

- Mailpit runs on `http://localhost:8025` (Docker)
- All emails sent in development are captured (no real sending)
- View emails in Mailpit UI

### Adding New Notification Type

1. Add type to `NotificationType` enum in `schema.prisma`
2. Run `pnpm db:migrate`
3. Create template (if needed) in database or via API
4. Use in notification send payload

## Common Patterns

### Creating Notifications with Use Case

```typescript
// src/core/use-cases/notifications/send-notification.use-case.ts
import { SendNotificationUseCase } from '@/core/use-cases/notifications/send-notification.use-case'

const useCase = new SendNotificationUseCase()
const notification = await useCase.execute({
  organizationId: 'org-123',
  userId: 'user-456',
  type: 'AUCTION_ENDING_SOON',
  channel: 'EMAIL',
  templateSlug: 'auction-ending-soon',
  payload: { auctionTitle: 'CryptoPunk #123', endTime: '2025-01-10T12:00:00Z' },
  idempotencyKey: 'auction-123-reminder',
})
```

### Accessing Prisma

```typescript
import { prisma } from '@/infrastructure/database/prisma'

const notifications = await prisma.notification.findMany({
  where: { organizationId: 'org-123' },
  include: { user: true, template: true },
})
```

### Logging

```typescript
import { logger } from '@/lib/logger/logger'

logger.info('Notification sent', { notificationId: '123', channel: 'EMAIL' })
logger.error('Failed to send', { error: err.message, correlationId })
```

**Never use `console.log`** - always use `logger`.

## Troubleshooting

### Prisma Client Not Found
```bash
pnpm db:generate
```

### Docker Services Won't Start
```bash
pnpm docker:down
pnpm docker:up
```

### Type Errors After Schema Change
```bash
pnpm db:generate
pnpm typecheck
```

### Build Fails with Env Validation
Set `SKIP_ENV_VALIDATION=true` for CI builds only.

## Important Notes

1. **Prisma schema location**: `src/infrastructure/database/prisma/schema.prisma` (NOT `prisma/schema.prisma`)
2. **Prisma Client output**: `src/infrastructure/database/generated/` (configured in schema)
3. **Better Auth config**: `src/lib/auth/better-auth.ts` (not `auth.ts`)
4. **Always use transactions** for notification creation (via `OutboxRepository.createWithNotification`)
5. **Idempotency**: Use `idempotencyKey` to prevent duplicate sends
6. **Rate limiting**: Configured per-organization, per-channel in `RateLimitConfig` table
7. **Correlation IDs**: Generated with `nanoid()` for request tracing
8. **Feature flags**: Use env vars (`ENABLE_WEBSOCKET`, etc.) to toggle channels

## Testing Strategy

- **Unit tests**: Use cases, domain entities, value objects
- **Integration tests**: API routes, database operations
- **Test utilities**: Located in `tests/setup/`
- **Coverage target**: ≥80%
- **CI**: Tests must pass with `--passWithNoTests` flag

## Worker Architecture (Future)

Background workers will run as separate processes:

```bash
# Future commands (not yet implemented)
pnpm workers              # Start all workers
pnpm worker:outbox        # Outbox processor only
pnpm worker:retry         # Retry processor only
pnpm worker:scheduler     # Scheduled notifications only
```

Workers poll database tables and process entries concurrently.
