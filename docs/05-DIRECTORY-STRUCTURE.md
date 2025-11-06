# Directory Structure - Zuno Marketplace Notifications

**Document Version**: 1.0.0
**Last Updated**: 2025-01-06

---

## Overview

This document defines the **complete directory structure** for the Zuno Marketplace Notifications service, following **Clean Architecture** principles with clear separation between domain logic, application logic, and infrastructure.

---

## Complete Directory Tree

```
zuno-marketplace-notifications/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Continuous integration
│   │   ├── deploy-preview.yml        # Preview deployments
│   │   ├── deploy-production.yml     # Production deployment
│   │   └── security-scan.yml         # Secret scanning
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
│
├── .husky/
│   ├── pre-commit                    # Run lint-staged
│   └── pre-push                      # Run typecheck + tests
│
├── .vscode/
│   ├── settings.json                 # Editor settings
│   ├── extensions.json               # Recommended extensions
│   └── launch.json                   # Debug configurations
│
├── docs/                             # All documentation
│   ├── 00-INDEX.md
│   ├── 01-PROJECT-OVERVIEW.md
│   ├── 02-ARCHITECTURE.md
│   ├── 03-DATABASE-SCHEMA.md
│   ├── ...                          # All 38 documentation files
│   └── assets/                      # Diagrams, images
│
├── prisma/
│   ├── schema.prisma                # Complete database schema
│   ├── seed.ts                      # Seed data script
│   ├── migrations/                  # Migration history
│   │   ├── 20250106_init/
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── scripts/
│       ├── backup.ts                # Backup script
│       └── restore.ts               # Restore script
│
├── public/                          # Static assets
│   ├── favicon.ico
│   └── images/
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home page
│   │   ├── globals.css              # Global styles
│   │   │
│   │   ├── api/                     # API Routes
│   │   │   ├── health/
│   │   │   │   └── route.ts         # Health check endpoint
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   ├── send/
│   │   │   │   │   └── route.ts     # POST /api/notifications/send
│   │   │   │   ├── batch/
│   │   │   │   │   └── route.ts     # POST /api/notifications/batch
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── route.ts     # GET/DELETE /api/notifications/:id
│   │   │   │   │   └── resend/
│   │   │   │   │       └── route.ts # POST /api/notifications/:id/resend
│   │   │   │   └── stats/
│   │   │   │       └── route.ts     # GET /api/notifications/stats
│   │   │   │
│   │   │   ├── preferences/
│   │   │   │   ├── [userId]/
│   │   │   │   │   └── route.ts     # GET/PUT /api/preferences/:userId
│   │   │   │   ├── subscribe/
│   │   │   │   │   └── route.ts     # POST /api/preferences/subscribe
│   │   │   │   └── unsubscribe/
│   │   │   │       └── route.ts     # POST /api/preferences/unsubscribe
│   │   │   │
│   │   │   ├── templates/
│   │   │   │   ├── route.ts         # GET/POST /api/templates
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── route.ts     # GET/PUT/DELETE /api/templates/:id
│   │   │   │   │   ├── preview/
│   │   │   │   │   │   └── route.ts # POST /api/templates/:id/preview
│   │   │   │   │   └── publish/
│   │   │   │   │       └── route.ts # POST /api/templates/:id/publish
│   │   │   │   └── search/
│   │   │   │       └── route.ts     # GET /api/templates/search
│   │   │   │
│   │   │   └── webhooks/
│   │   │       ├── inbound/
│   │   │       │   └── route.ts     # POST /api/webhooks/inbound
│   │   │       └── resend/
│   │   │           └── route.ts     # POST /api/webhooks/resend (delivery status)
│   │   │
│   │   ├── admin/                   # Admin UI
│   │   │   ├── layout.tsx           # Admin layout with sidebar
│   │   │   ├── page.tsx             # Admin dashboard
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   ├── page.tsx         # Notifications list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Notification detail
│   │   │   │
│   │   │   ├── templates/
│   │   │   │   ├── page.tsx         # Templates list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx     # Create template
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx     # Template detail
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx # Edit template
│   │   │   │
│   │   │   ├── deliveries/
│   │   │   │   ├── page.tsx         # Delivery tracking
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Delivery attempts
│   │   │   │
│   │   │   ├── preferences/
│   │   │   │   └── page.tsx         # User preferences management
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx         # Analytics dashboard
│   │   │   │
│   │   │   └── settings/
│   │   │       ├── page.tsx         # Organization settings
│   │   │       └── api-keys/
│   │   │           └── page.tsx     # API key management
│   │   │
│   │   ├── auth/                    # Authentication pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Login page
│   │   │   ├── signup/
│   │   │   │   └── page.tsx         # Signup page
│   │   │   └── callback/
│   │   │       └── page.tsx         # OAuth callback
│   │   │
│   │   └── (marketing)/             # Marketing pages (public)
│   │       ├── page.tsx             # Landing page
│   │       ├── pricing/
│   │       │   └── page.tsx
│   │       └── docs/
│   │           └── page.tsx
│   │
│   ├── core/                        # Domain & Application Layer
│   │   │
│   │   ├── domain/                  # Domain entities & logic
│   │   │   ├── entities/
│   │   │   │   ├── notification.entity.ts
│   │   │   │   ├── template.entity.ts
│   │   │   │   ├── user-preference.entity.ts
│   │   │   │   ├── subscription.entity.ts
│   │   │   │   └── organization.entity.ts
│   │   │   │
│   │   │   ├── value-objects/
│   │   │   │   ├── email.vo.ts
│   │   │   │   ├── notification-id.vo.ts
│   │   │   │   ├── template-id.vo.ts
│   │   │   │   └── idempotency-key.vo.ts
│   │   │   │
│   │   │   ├── events/
│   │   │   │   ├── notification-created.event.ts
│   │   │   │   ├── notification-sent.event.ts
│   │   │   │   ├── notification-failed.event.ts
│   │   │   │   └── template-updated.event.ts
│   │   │   │
│   │   │   └── types/
│   │   │       ├── notification.types.ts
│   │   │       ├── channel.types.ts
│   │   │       └── common.types.ts
│   │   │
│   │   ├── use-cases/               # Application business logic
│   │   │   ├── notifications/
│   │   │   │   ├── send-notification.use-case.ts
│   │   │   │   ├── batch-send.use-case.ts
│   │   │   │   ├── get-notification.use-case.ts
│   │   │   │   ├── cancel-notification.use-case.ts
│   │   │   │   └── resend-notification.use-case.ts
│   │   │   │
│   │   │   ├── templates/
│   │   │   │   ├── create-template.use-case.ts
│   │   │   │   ├── update-template.use-case.ts
│   │   │   │   ├── delete-template.use-case.ts
│   │   │   │   ├── publish-template.use-case.ts
│   │   │   │   └── preview-template.use-case.ts
│   │   │   │
│   │   │   ├── preferences/
│   │   │   │   ├── update-preferences.use-case.ts
│   │   │   │   ├── subscribe.use-case.ts
│   │   │   │   └── unsubscribe.use-case.ts
│   │   │   │
│   │   │   └── health/
│   │   │       └── health-check.use-case.ts
│   │   │
│   │   └── services/                # Domain services
│   │       ├── deduplication.service.ts
│   │       ├── rate-limit.service.ts
│   │       ├── template.service.ts
│   │       ├── idempotency.service.ts
│   │       └── notification-validator.service.ts
│   │
│   ├── infrastructure/              # Infrastructure Layer
│   │   │
│   │   ├── database/
│   │   │   ├── prisma.ts            # Prisma client singleton
│   │   │   └── connection-manager.ts
│   │   │
│   │   ├── repositories/            # Data access layer
│   │   │   ├── notification.repository.ts
│   │   │   ├── template.repository.ts
│   │   │   ├── user-preference.repository.ts
│   │   │   ├── subscription.repository.ts
│   │   │   ├── outbox.repository.ts
│   │   │   ├── delivery-attempt.repository.ts
│   │   │   └── audit-log.repository.ts
│   │   │
│   │   ├── channels/                # Notification channels
│   │   │   ├── channel.interface.ts
│   │   │   ├── channel-router.ts
│   │   │   │
│   │   │   ├── email/
│   │   │   │   ├── email.channel.ts
│   │   │   │   ├── resend.provider.ts
│   │   │   │   ├── mailpit.provider.ts
│   │   │   │   └── templates/       # React Email templates
│   │   │   │       ├── welcome.tsx
│   │   │   │       ├── auction-won.tsx
│   │   │   │       └── password-reset.tsx
│   │   │   │
│   │   │   ├── websocket/
│   │   │   │   ├── websocket.channel.ts
│   │   │   │   ├── connection-manager.ts
│   │   │   │   └── websocket-server.ts
│   │   │   │
│   │   │   ├── push/               # Future
│   │   │   │   ├── push.channel.ts
│   │   │   │   ├── fcm.provider.ts
│   │   │   │   └── apns.provider.ts
│   │   │   │
│   │   │   └── sms/                # Future
│   │   │       ├── sms.channel.ts
│   │   │       └── twilio.provider.ts
│   │   │
│   │   ├── outbox/                 # Outbox pattern implementation
│   │   │   ├── outbox.service.ts
│   │   │   └── outbox-processor.ts
│   │   │
│   │   ├── cache/                  # Redis caching
│   │   │   ├── redis.client.ts
│   │   │   └── cache.service.ts
│   │   │
│   │   └── external/               # External API clients
│   │       ├── resend.client.ts
│   │       └── webhook.client.ts
│   │
│   ├── components/                 # React components
│   │   │
│   │   ├── admin/                  # Admin-specific components
│   │   │   ├── notifications/
│   │   │   │   ├── NotificationsList.tsx
│   │   │   │   ├── NotificationDetail.tsx
│   │   │   │   ├── NotificationFilters.tsx
│   │   │   │   └── NotificationStats.tsx
│   │   │   │
│   │   │   ├── templates/
│   │   │   │   ├── TemplatesList.tsx
│   │   │   │   ├── TemplateEditor.tsx
│   │   │   │   ├── TemplatePreview.tsx
│   │   │   │   └── VariableInserter.tsx
│   │   │   │
│   │   │   ├── deliveries/
│   │   │   │   ├── DeliveriesTable.tsx
│   │   │   │   └── DeliveryAttempts.tsx
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   ├── DeliveryChart.tsx
│   │   │   │   ├── ChannelStats.tsx
│   │   │   │   └── ErrorBreakdown.tsx
│   │   │   │
│   │   │   └── layout/
│   │   │       ├── AdminSidebar.tsx
│   │   │       ├── AdminHeader.tsx
│   │   │       └── Breadcrumbs.tsx
│   │   │
│   │   ├── shared/                 # Shared components
│   │   │   ├── DataTable.tsx       # Reusable TanStack Table
│   │   │   ├── SearchInput.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   └── ui/                     # shadcn/ui components (auto-generated)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── toast.tsx
│   │       └── ...
│   │
│   ├── lib/                        # Utilities & helpers
│   │   ├── auth/
│   │   │   ├── better-auth.ts      # Better-Auth configuration
│   │   │   ├── guards.ts           # Authorization guards
│   │   │   └── session.ts          # Session helpers
│   │   │
│   │   ├── logger/
│   │   │   ├── logger.ts           # Winston logger setup
│   │   │   ├── formatters.ts       # Log formatters
│   │   │   └── correlation-id.ts   # Request ID tracking
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts               # Class name merger (from shadcn)
│   │   │   ├── date.ts             # Date utilities
│   │   │   ├── hash.ts             # Hashing utilities
│   │   │   ├── retry.ts            # Retry logic
│   │   │   └── validation.ts       # Common validators
│   │   │
│   │   ├── errors/
│   │   │   ├── app-error.ts        # Base error class
│   │   │   ├── error-codes.ts      # Error code constants
│   │   │   └── error-handler.ts    # Global error handler
│   │   │
│   │   ├── config/
│   │   │   ├── env.ts              # Environment validation (Zod)
│   │   │   └── constants.ts        # Application constants
│   │   │
│   │   └── hooks/                  # React hooks
│   │       ├── useNotifications.ts
│   │       ├── useTemplates.ts
│   │       ├── usePreferences.ts
│   │       └── useDebounce.ts
│   │
│   ├── workers/                    # Background workers
│   │   ├── outbox-poller.worker.ts
│   │   ├── retry.worker.ts
│   │   └── worker-manager.ts
│   │
│   └── types/                      # Shared TypeScript types
│       ├── index.d.ts
│       └── next-auth.d.ts
│
├── tests/                          # Test suites
│   ├── unit/
│   │   ├── core/
│   │   │   ├── entities/
│   │   │   ├── use-cases/
│   │   │   └── services/
│   │   └── lib/
│   │       └── utils/
│   │
│   ├── integration/
│   │   ├── api/
│   │   │   ├── notifications.test.ts
│   │   │   ├── templates.test.ts
│   │   │   └── preferences.test.ts
│   │   └── repositories/
│   │       └── notification.repository.test.ts
│   │
│   ├── e2e/
│   │   ├── notifications.spec.ts
│   │   └── templates.spec.ts
│   │
│   ├── fixtures/
│   │   ├── notifications.fixtures.ts
│   │   ├── templates.fixtures.ts
│   │   └── users.fixtures.ts
│   │
│   └── mocks/
│       ├── prisma.mock.ts
│       ├── resend.mock.ts
│       └── redis.mock.ts
│
├── scripts/                        # Utility scripts
│   ├── generate-api-key.ts
│   ├── migrate-data.ts
│   └── analyze-performance.ts
│
├── .env.example                    # Environment variables template
├── .env.local                      # Local environment (gitignored)
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── docker-compose.yml
├── jest.config.js
├── next.config.js
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

---

## Directory Naming Conventions

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase | `NotificationsList.tsx` |
| **Utilities** | kebab-case | `correlation-id.ts` |
| **API Routes** | kebab-case | `route.ts` (Next.js convention) |
| **Tests** | .test or .spec | `notification.test.ts` |
| **Types** | kebab-case | `notification.types.ts` |
| **Entities** | kebab-case + .entity | `notification.entity.ts` |
| **Value Objects** | kebab-case + .vo | `email.vo.ts` |
| **Use Cases** | kebab-case + .use-case | `send-notification.use-case.ts` |
| **Services** | kebab-case + .service | `rate-limit.service.ts` |
| **Repositories** | kebab-case + .repository | `notification.repository.ts` |

### Folder Naming

- **Lowercase with hyphens**: `user-preferences`, `rate-limiting`
- **Plural for collections**: `entities`, `repositories`, `components`
- **Singular for non-collections**: `database`, `config`, `logger`

---

## Import Path Aliases

Configure in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/core/*": ["./src/core/*"],
      "@/infrastructure/*": ["./src/infrastructure/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/app/*": ["./src/app/*"],
      "@/tests/*": ["./tests/*"]
    }
  }
}
```

### Import Examples

```typescript
// Core domain
import { Notification } from '@/core/domain/entities/notification.entity'
import { SendNotificationUseCase } from '@/core/use-cases/notifications/send-notification.use-case'

// Infrastructure
import { prisma } from '@/infrastructure/database/prisma'
import { NotificationRepository } from '@/infrastructure/repositories/notification.repository'

// Components
import { NotificationsList } from '@/components/admin/notifications/NotificationsList'
import { Button } from '@/components/ui/button'

// Utilities
import { logger } from '@/lib/logger/logger'
import { cn } from '@/lib/utils/cn'
```

---

## Clean Architecture Layers

### Layer Responsibilities

```
┌─────────────────────────────────────────────────────────┐
│                     Presentation Layer                   │
│              (src/app, src/components)                   │
│  • Next.js pages & API routes                           │
│  • React components (UI)                                │
│  • User input validation                                │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                   Application Layer                      │
│                    (src/core/use-cases)                  │
│  • Business logic orchestration                         │
│  • Use case implementations                             │
│  • Service coordination                                 │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                      Domain Layer                        │
│                   (src/core/domain)                      │
│  • Entities (business objects)                          │
│  • Value objects (immutable)                            │
│  • Domain events                                        │
│  • Business rules                                       │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                  Infrastructure Layer                    │
│                  (src/infrastructure)                    │
│  • Database access (Prisma)                             │
│  • External APIs (Resend, etc.)                         │
│  • File system, cache, queues                           │
│  • Framework-specific implementations                   │
└─────────────────────────────────────────────────────────┘
```

### Dependency Rules

1. **Domain** → No dependencies (pure business logic)
2. **Application** → Depends on Domain only
3. **Infrastructure** → Depends on Application & Domain
4. **Presentation** → Depends on all layers

---

## Code Organization Principles

### 1. Feature-Based Organization

For API routes, organize by feature:

```
src/app/api/
├── notifications/
│   ├── send/route.ts
│   ├── batch/route.ts
│   └── [id]/route.ts
├── templates/
│   ├── route.ts
│   └── [id]/route.ts
└── preferences/
    └── [userId]/route.ts
```

### 2. Colocation

Keep related files together:

```
src/components/admin/notifications/
├── NotificationsList.tsx         # Main component
├── NotificationFilters.tsx       # Related component
├── useNotificationFilters.ts     # Hook (if only used here)
└── notifications.constants.ts    # Constants (if only used here)
```

### 3. Index Files

Use `index.ts` for public exports:

```typescript
// src/core/domain/entities/index.ts
export * from './notification.entity'
export * from './template.entity'
export * from './user-preference.entity'

// Usage
import { Notification, Template } from '@/core/domain/entities'
```

---

## Environment-Specific Files

### Local Development

```
.env.local           # Local dev environment
.env.test            # Test environment
docker-compose.yml   # Local services
```

### CI/CD

```
.env.ci              # CI environment (GitHub Actions)
.env.staging         # Staging deployment
.env.production      # Production deployment (encrypted)
```

---

## File Size Guidelines

| File Type | Max Lines | Reason |
|-----------|-----------|--------|
| **Components** | 300 | Readability, testability |
| **Use Cases** | 200 | Single responsibility |
| **Repositories** | 400 | Multiple CRUD methods |
| **API Routes** | 150 | Simple request handlers |
| **Utils** | 100 | Pure functions, easy to test |

When files exceed limits, split into smaller modules.

---

## Module Boundaries

### Public APIs (Exports)

Each module should have clear public API:

```typescript
// src/core/use-cases/notifications/index.ts
export { SendNotificationUseCase } from './send-notification.use-case'
export { BatchSendUseCase } from './batch-send.use-case'
// Do NOT export internal helpers
```

### Private Internals

Use naming conventions to indicate internal files:

```
src/core/services/
├── rate-limit.service.ts        # Public API
└── _token-bucket.helper.ts      # Private (prefix with _)
```

---

## Testing Directory Structure

### Mirror Source Structure

```
src/core/use-cases/notifications/
└── send-notification.use-case.ts

tests/unit/core/use-cases/notifications/
└── send-notification.use-case.test.ts
```

### Shared Test Utilities

```
tests/
├── fixtures/            # Test data
├── mocks/              # Mock implementations
└── utils/              # Test utilities
    ├── setup.ts
    └── helpers.ts
```

---

## Generated Files (Never Edit Manually)

```
node_modules/                # Dependencies
.next/                      # Next.js build output
dist/                       # Build output
coverage/                   # Test coverage
prisma/migrations/          # Generated migrations (review before commit)
src/components/ui/          # shadcn/ui components (OK to customize after generation)
```

---

## Documentation Colocation

Keep docs close to code:

```
src/infrastructure/channels/
├── email/
│   ├── email.channel.ts
│   ├── README.md              # Channel-specific docs
│   └── templates/
│       ├── welcome.tsx
│       └── TEMPLATE_GUIDE.md  # Template authoring guide
```

---

## Next Steps

1. ✅ Review directory structure
2. 📁 Create directories via script: `pnpm setup:dirs`
3. 📝 Begin implementing [06-AUTHENTICATION.md](./06-AUTHENTICATION.md)
4. 🚀 Start [31-PHASE-1-FOUNDATION.md](./31-PHASE-1-FOUNDATION.md)

---

## Related Documents

- [04-PROJECT-SETUP.md](./04-PROJECT-SETUP.md) - Initial setup
- [29-CODING-STANDARDS.md](./29-CODING-STANDARDS.md) - Coding conventions
- [30-GIT-WORKFLOW.md](./30-GIT-WORKFLOW.md) - Branch strategy
