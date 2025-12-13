# Zuno Marketplace Notifications

**Version**: 1.0.0
**Status**: 🚧 Under Development
**License**: Proprietary

---

## Overview

Enterprise-grade, multi-channel notification service for the Zuno NFT Marketplace ecosystem. Delivers reliable, scalable, and observable notifications across Email, WebSocket, Push, and SMS channels.

### Key Features

- ✅ **Multi-Channel Support**: Email, WebSocket, Push (future), SMS (future)
- ✅ **Reliable Delivery**: At-least-once semantics via Outbox Pattern
- ✅ **Scalable Architecture**: Horizontal scaling with stateless workers
- ✅ **Template Management**: Versioned templates with Handlebars
- ✅ **Rate Limiting**: Per-channel and per-organization quotas
- ✅ **Observability**: Structured logging, metrics, correlation IDs
- ✅ **RBAC**: Organization-based access control via Better-Auth
- ✅ **Admin UI**: shadcn/ui-powered management dashboard

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 16.x | Full-stack React framework |
| **Language** | TypeScript | 5.x | Type safety |
| **Database** | NeonDB (PostgreSQL) | 15+ | Serverless PostgreSQL |
| **ORM** | Prisma | Latest | Type-safe database access |
| **Auth** | Better-Auth | 1.3+ | Authentication & organizations |
| **UI** | shadcn/ui + Tailwind | Latest | Component library |
| **Email** | Resend (prod) / Mailpit (dev) | Latest | Email delivery |
| **Cache** | Redis | 7.x | Rate limiting, sessions |
| **State** | TanStack Query | 5.x | Data fetching & caching |
| **Testing** | Jest + Testing Library | Latest | Unit & integration tests |
| **CI/CD** | GitHub Actions | - | Automation |
| **Deployment** | Vercel | - | Hosting |

---

## Quick Start

### Prerequisites

- Node.js 18.17.0+
- pnpm 8.0.0+
- Docker & Docker Compose
- NeonDB account
- Resend API key

### Installation

```bash
# Clone repository
git clone https://github.com/zunokit/zuno-marketplace-notifications.git
cd zuno-marketplace-notifications

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Start Docker services (PostgreSQL, Redis, Mailpit)
pnpm docker:up

# Run database migrations
pnpm db:migrate

# Seed database (optional)
pnpm db:seed

# Start development server
pnpm dev

# In separate terminal, start workers
pnpm workers
```

Visit **http://localhost:3000**

### Local Email Testing

Mailpit UI: **http://localhost:8025**

All emails sent locally are captured by Mailpit (no real emails sent).

---

## Documentation

### 📚 Complete Documentation (38 Files)

See **[docs/00-INDEX.md](./docs/00-INDEX.md)** for full documentation structure.

#### Quick Links

| Document | Description |
|----------|-------------|
| **[01-PROJECT-OVERVIEW](./docs/01-PROJECT-OVERVIEW.md)** | Goals, success metrics, tech stack |
| **[02-ARCHITECTURE](./docs/02-ARCHITECTURE.md)** | System architecture, event flows |
| **[03-DATABASE-SCHEMA](./docs/03-DATABASE-SCHEMA.md)** | Complete Prisma schema |
| **[04-PROJECT-SETUP](./docs/04-PROJECT-SETUP.md)** | Step-by-step setup guide |
| **[05-DIRECTORY-STRUCTURE](./docs/05-DIRECTORY-STRUCTURE.md)** | Complete directory tree |
| **[30-GIT-WORKFLOW](./docs/30-GIT-WORKFLOW.md)** | Branch strategy, commits, PRs |

---

## Architecture

### High-Level Overview

```
External Events → API Gateway → Use Cases → Outbox → Workers → Channels → Providers
                       ↓
                  Database (PostgreSQL + Redis)
```

### Key Patterns

1. **Outbox Pattern**: Transactional writes ensure message durability
2. **Retry with Exponential Backoff**: Failed messages retry intelligently
3. **Idempotency**: Prevent duplicate sends via idempotency keys
4. **Circuit Breaker**: Protect against provider failures
5. **Rate Limiting**: Token bucket algorithm per channel/org

See [docs/02-ARCHITECTURE.md](./docs/02-ARCHITECTURE.md) for details.

---

## Project Structure

```
zuno-marketplace-notifications/
├── src/
│   ├── app/                    # Next.js App Router (API + pages)
│   ├── core/                   # Domain & application logic
│   │   ├── domain/             # Entities, value objects
│   │   ├── use-cases/          # Business logic
│   │   └── services/           # Domain services
│   ├── infrastructure/         # External dependencies
│   │   ├── repositories/       # Database access
│   │   ├── channels/           # Email, WebSocket, Push, SMS
│   │   └── outbox/             # Outbox pattern implementation
│   ├── components/             # React components
│   ├── lib/                    # Utilities, auth, logger
│   └── workers/                # Background workers
├── prisma/                     # Database schema & migrations
├── tests/                      # Unit, integration, E2E tests
└── docs/                       # 38 documentation files
```

See [docs/05-DIRECTORY-STRUCTURE.md](./docs/05-DIRECTORY-STRUCTURE.md) for complete structure.

---

## Development Workflow

### Branch Strategy

```
main (production)
└── develop (integration)
    ├── feature/* (new features)
    ├── fix/* (bug fixes)
    └── hotfix/* (critical fixes)
```

### Conventional Commits

```
feat(email): add template versioning
fix(rate-limit): prevent race condition
docs(api): update endpoint documentation
```

See [docs/30-GIT-WORKFLOW.md](./docs/30-GIT-WORKFLOW.md) for full workflow.

### Pre-Push Checklist

**MUST PASS** before pushing:

```bash
pnpm typecheck   # TypeScript type checking
pnpm lint        # ESLint
pnpm test        # Jest tests
pnpm build       # Next.js build
```

---

## Scripts

### Development

```bash
pnpm dev                  # Start Next.js dev server (port 3000)
pnpm workers              # Start background workers
pnpm db:studio            # Open Prisma Studio (database GUI)
```

### Testing

```bash
pnpm test                 # Run tests in watch mode
pnpm test:ci              # Run tests with coverage (CI)
pnpm test:e2e             # Run E2E tests (Playwright)
```

### Database

```bash
pnpm db:generate          # Generate Prisma client
pnpm db:migrate           # Create & apply migration
pnpm db:migrate:deploy    # Apply migrations (production)
pnpm db:seed              # Seed database with test data
pnpm db:reset             # Reset database (WARNING: destructive)
```

### Code Quality

```bash
pnpm lint                 # Run ESLint
pnpm lint:fix             # Auto-fix linting issues
pnpm format               # Format with Prettier
pnpm typecheck            # TypeScript type checking
```

### Docker

```bash
pnpm docker:up            # Start services (PostgreSQL, Redis, Mailpit)
pnpm docker:down          # Stop services
pnpm docker:logs          # View service logs
```

---

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
BETTER_AUTH_SECRET="..."          # 32+ chars
BETTER_AUTH_URL="http://localhost:3000"

# Email
RESEND_API_KEY="re_..."           # Production email
MAILPIT_SMTP_HOST="localhost"     # Local email testing
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

See [docs/28-ENVIRONMENT-CONFIG.md](./docs/28-ENVIRONMENT-CONFIG.md) for all variables.

---

## API Endpoints

### Notifications

```bash
POST   /api/notifications/send           # Send single notification
POST   /api/notifications/batch          # Send batch
GET    /api/notifications/:id            # Get notification
DELETE /api/notifications/:id            # Cancel notification
POST   /api/notifications/:id/resend     # Resend notification
GET    /api/notifications/stats          # Get statistics
```

### Templates

```bash
GET    /api/templates                    # List templates
POST   /api/templates                    # Create template
GET    /api/templates/:id                # Get template
PUT    /api/templates/:id                # Update template
DELETE /api/templates/:id                # Delete template
POST   /api/templates/:id/preview        # Preview template
POST   /api/templates/:id/publish        # Publish template
```

### User Preferences

```bash
GET    /api/preferences/:userId          # Get preferences
PUT    /api/preferences/:userId          # Update preferences
POST   /api/preferences/subscribe        # Subscribe
POST   /api/preferences/unsubscribe      # Unsubscribe
```

### Webhooks

```bash
POST   /api/webhooks/inbound             # Receive external events
POST   /api/webhooks/resend              # Resend delivery status
```

### Health Check

```bash
GET    /api/health                       # Health check
```

See [docs/35-API-REFERENCE.md](./docs/35-API-REFERENCE.md) for complete API docs.

---

## Testing

### Unit Tests

```bash
pnpm test src/core/use-cases/notifications/send-notification.use-case.test.ts
```

### Integration Tests

```bash
pnpm test tests/integration/api/notifications.test.ts
```

### E2E Tests

```bash
pnpm test:e2e
```

### Coverage

```bash
pnpm test:ci
# Target: ≥ 80% coverage
```

See [docs/22-TESTING-STRATEGY.md](./docs/22-TESTING-STRATEGY.md) for testing guide.

---

## Deployment

### Environments

| Environment | Branch | URL | Database |
|------------|--------|-----|----------|
| **Development** | `develop` | localhost:3000 | Local/Neon dev |
| **Staging** | `develop` | staging.zuno.market | Neon staging |
| **Production** | `main` | notifications.zuno.market | Neon prod |

### Deploy to Production

```bash
# 1. Merge to main (via PR)
git checkout main
git pull origin main

# 2. Vercel deploys automatically

# 3. Run migrations (if needed)
DATABASE_URL="prod_url" pnpm db:migrate:deploy

# 4. Monitor health
curl https://notifications.zuno.market/api/health
```

See [docs/27-DEPLOYMENT.md](./docs/27-DEPLOYMENT.md) for full deployment guide.

---

## Observability

### Logging

Structured JSON logs with correlation IDs:

```json
{
  "level": "info",
  "timestamp": "2025-01-06T12:34:56.789Z",
  "correlationId": "abc123",
  "message": "Notification sent",
  "context": {
    "notificationId": "xyz789",
    "channel": "email",
    "userId": "user123"
  }
}
```

### Metrics

Key metrics tracked:

- Notification sent/delivered/failed counts
- Delivery latency (P50, P95, P99)
- Queue depth
- Channel error rates

### Health Check

```bash
curl http://localhost:3000/api/health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2025-01-06T12:34:56.789Z",
  "checks": {
    "database": "healthy",
    "cache": "healthy",
    "email": "healthy"
  }
}
```

See [docs/19-LOGGING.md](./docs/19-LOGGING.md) and [docs/20-METRICS.md](./docs/20-METRICS.md).

---

## Contributing

### Development Process

1. Create feature branch from `develop`
2. Make changes following [coding standards](./docs/29-CODING-STANDARDS.md)
3. Write tests (≥ 80% coverage)
4. Run pre-push checks
5. Create PR using [template](./.github/PULL_REQUEST_TEMPLATE.md)
6. Address review comments
7. Squash and merge to `develop`

### Coding Standards

- **TypeScript**: Strict mode, no `any`
- **Imports**: Sorted by category (external → internal)
- **Naming**: PascalCase for components, camelCase for functions
- **Comments**: Explain "why", not "what"
- **Error Handling**: Always use try-catch, log errors
- **Logging**: Use logger, never `console.log`

See [docs/29-CODING-STANDARDS.md](./docs/29-CODING-STANDARDS.md) for complete standards.

---

## Roadmap

### Phase 1: Foundation (Weeks 1-2) ✅
- [x] Project setup
- [x] Database schema
- [x] Authentication (Better-Auth)
- [x] Basic API endpoints

### Phase 2: Core Features (Weeks 3-4) 🚧
- [ ] Email channel (Resend)
- [ ] Outbox pattern
- [ ] Retry mechanism
- [ ] Template system

### Phase 3: Advanced (Weeks 5-6) 📅
- [ ] WebSocket channel
- [ ] Admin UI (shadcn/ui)
- [ ] Observability (logging, metrics)
- [ ] Rate limiting

### Phase 4: Production (Weeks 7-8) 📅
- [ ] CI/CD pipeline
- [ ] Security hardening
- [ ] Performance optimization
- [ ] Documentation completion

### Future (v1.1+)
- [ ] Push notifications (Firebase, APNs)
- [ ] SMS notifications (Twilio)
- [ ] A/B testing
- [ ] Analytics dashboard
- [ ] Multi-language support (i18n)

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
pnpm db:studio

# Reset database
pnpm db:reset
```

### Docker Services Not Starting

```bash
# Check for port conflicts
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Restart services
pnpm docker:down
pnpm docker:up
```

### Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install

# Regenerate Prisma client
pnpm db:generate
```

See [docs/36-TROUBLESHOOTING.md](./docs/36-TROUBLESHOOTING.md) for more solutions.

---

## Support

### Documentation

- **Full Docs**: [docs/00-INDEX.md](./docs/00-INDEX.md)
- **Architecture**: [docs/02-ARCHITECTURE.md](./docs/02-ARCHITECTURE.md)
- **API Reference**: [docs/35-API-REFERENCE.md](./docs/35-API-REFERENCE.md)
- **Troubleshooting**: [docs/36-TROUBLESHOOTING.md](./docs/36-TROUBLESHOOTING.md)

### Contact

- **Team Lead**: [TBD]
- **GitHub Issues**: [Create Issue](https://github.com/zunokit/zuno-marketplace-notifications/issues)
- **Slack**: #notifications (internal)

---

## License

Proprietary - © 2025 Zuno Marketplace. All rights reserved.

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Better-Auth](https://better-auth.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Resend](https://resend.com/)
- [TanStack Query](https://tanstack.com/query)

---

**Status**: 🚧 Under active development
**Last Updated**: 2025-01-06
**Next Milestone**: Phase 2 - Email Channel Implementation
