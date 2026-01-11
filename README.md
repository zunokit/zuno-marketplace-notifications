# Zuno Marketplace Notifications

**Version**: 1.0.0
**Status**: 🚧 Under Development
**License**: Proprietary

---

## Overview

Enterprise-grade, multi-channel notification service for the Zuno NFT Marketplace ecosystem. Delivers reliable, scalable, and observable notifications across Email, WebSocket, Push, and SMS channels.

**Key Features:**
*   **Multi-Channel Support**: Email, WebSocket, Push (future), SMS (future).
*   **Reliable Delivery**: At-least-once semantics via Outbox Pattern.
*   **Scalable Architecture**: Horizontal scaling with stateless workers.
*   **Template Management**: Versioned templates with Handlebars.
*   **Rate Limiting**: Per-channel and per-organization quotas.
*   **RBAC**: Organization-based access control via Better-Auth.

---

## Quick Start

### Prerequisites

*   Node.js 18.17.0+
*   pnpm 8.0.0+
*   Docker & Docker Compose
*   NeonDB account
*   Resend API key

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

Local Email Testing: **http://localhost:8025** (Mailpit UI)

---

## Documentation

For comprehensive documentation, refer to the `docs/` directory.

*   **Project Overview & PDR**: [docs/project-overview-pdr.md](./docs/project-overview-pdr.md)
*   **Codebase Summary**: [docs/codebase-summary.md](./docs/codebase-summary.md)
*   **Code Standards**: [docs/code-standards.md](./docs/code-standards.md)
*   **System Architecture**: [docs/system-architecture.md](./docs/system-architecture.md)

---

## Technology Stack

*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript 5
*   **Database**: PostgreSQL (NeonDB) via Prisma ORM
*   **Cache**: Redis
*   **Authentication**: Better Auth
*   **UI**: shadcn/ui + Tailwind CSS
*   **Email**: Resend (prod) / Mailpit (dev)

---

## Contributing

Please refer to [docs/code-standards.md](./docs/code-standards.md) for coding standards and the `.github/PULL_REQUEST_TEMPLATE.md` for PR guidelines.

---

## License

Proprietary - © 2025 Zuno Marketplace. All rights reserved.

---

**Status**: 🚧 Under active development
**Last Updated**: 2025-12-14
**Next Milestone**: Phase 2 - Core Features (Email Channel, Outbox, Retry, Template System)