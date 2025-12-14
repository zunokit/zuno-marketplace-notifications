# Codebase Summary

This document provides a high-level overview of the Zuno Marketplace Notifications codebase structure, modules, and key files.

## Project Structure

The project follows a modular structure, primarily organized into `src/`, `components/`, `lib/`, and `workers/` directories.

```
src/
├── app/                    # Next.js App Router
│   └── api/               # API Routes
│       ├── notifications/ # send, batch, [id], schedule, resend
│       ├── templates/     # CRUD, preview, publish
│       ├── price-alerts/  # create, list, [id]
│       ├── watchlist/     # add, remove, list
│       ├── drops/         # create, [id], whitelist
│       ├── webhooks/      # subscribe, [id], test
│       ├── api-keys/      # create, list, [id]
│       ├── preferences/   # [userId]
│       ├── auth/          # Better Auth routes
│       ├── health/        # Health check
│       └── metrics/       # Observability
├── core/                   # Business Logic
│   ├── domain/
│   │   ├── entities/      # notification.entity.ts, base.entity.ts
│   │   └── value-objects/ # email.vo.ts, notification-id.vo.ts
│   ├── services/          # handlebars, idempotency, rate-limit, price-alert, watchlist, drop-notification
│   └── use-cases/         # send-notification.use-case.ts
├── infrastructure/         # External Dependencies
│   ├── database/          # prisma.ts, schema.prisma, seed.ts
│   ├── channels/          # channel-router, email (resend, mailpit), websocket
│   ├── outbox/            # outbox.repository.ts
│   ├── repositories/      # notification, template
│   ├── webhooks/          # webhook.service.ts
│   ├── templates/         # template.service.ts
│   └── cache/             # redis.client.ts
├── components/             # React Components
│   ├── ui/                # shadcn/ui components (button, data-table, dialog, etc.)
│   └── features/          # notifications-table, api-keys-table
├── lib/                    # Utilities
│   ├── auth/              # better-auth, client, guards, api-auth
│   ├── authorization/     # authorization.service.ts
│   ├── middleware/        # auth, api-key, correlation-id
│   ├── api/               # route-handler, types, with-authorization
│   ├── logger/            # logger.ts (Winston)
│   ├── config/            # env.ts
│   └── utils.ts           # cn utility
└── workers/                # Background Workers
    ├── outbox-worker.ts   # Process outbox queue (5s interval, batch 10)
    ├── retry-worker.ts    # Retry failed (30s interval, batch 50)
    └── scheduler-worker.ts # Future scheduled delivery
```

## Module Descriptions

*   **`src/app/`**: Contains the Next.js App Router logic, including API routes for various services like notifications, templates, price alerts, watchlists, drops, webhooks, API keys, preferences, authentication, health checks, and metrics.
*   **`src/core/`**: Houses the core business logic, adhering to Clean Architecture principles.
    *   **`domain/`**: Defines entities and value objects that represent the business domain.
    *   **`services/`**: Contains domain services responsible for specific business operations (e.g., Handlebars for templating, idempotency, rate limiting, price alerts, watchlists, drop notifications).
    *   **`use-cases/`**: Implements application-specific use cases, orchestrating domain services to fulfill user requests (e.g., `send-notification.use-case.ts`).
*   **`src/infrastructure/`**: Manages external dependencies and technical concerns.
    *   **`database/`**: Contains Prisma ORM configuration, schema definition (`schema.prisma`), and seeding scripts.
    *   **`channels/`**: Handles multi-channel notification delivery (e.g., email via Resend/Mailpit, WebSocket).
    *   **`outbox/`**: Implements the Outbox Pattern for reliable message delivery.
    *   **`repositories/`**: Provides data access interfaces and implementations for various entities (e.g., notifications, templates).
    *   **`webhooks/`**: Manages webhook services.
    *   **`templates/`**: Manages template services.
    *   **`cache/`**: Integrates with Redis for caching.
*   **`components/`**: Contains reusable React components.
    *   **`ui/`**: Houses `shadcn/ui` components.
    *   **`features/`**: Contains feature-specific components (e.g., notifications table, API keys table).
*   **`lib/`**: Provides utility functions and helper modules.
    *   **`auth/`**: Integrates Better Auth for authentication and authorization.
    *   **`authorization/`**: Handles authorization logic.
    *   **`middleware/`**: Defines middleware for authentication, API key validation, and correlation ID tracking.
    *   **`api/`**: Contains API route handlers and related utilities.
    *   **`logger/`**: Configures Winston for logging.
    *   **`config/`**: Manages environment variables.
    *   **`utils.ts`**: Contains general utility functions.
*   **`workers/`**: Contains background workers for asynchronous tasks.
    *   **`outbox-worker.ts`**: Processes the outbox queue at regular intervals.
    *   **`retry-worker.ts`**: Retries failed notifications with exponential backoff.
    *   **`scheduler-worker.ts`**: Handles scheduled notification delivery.

## Key Files and Their Purposes

*   **`src/infrastructure/database/prisma/schema.prisma`**: Defines the database schema using Prisma ORM. This is a critical file for understanding the data model, including core models like `Notification`, `Template`, `User`, `Organization`, and NFT marketplace-specific models like `PriceAlert`, `Watchlist`, and `Drop`.
*   **`src/core/use-cases/notifications/send-notification.use-case.ts`**: A central file demonstrating the application layer's orchestrating role in sending notifications.
*   **`src/infrastructure/channels/channel-router.ts`**: Manages routing notifications to different channels (Email, WebSocket, Push, SMS).
*   **`src/infrastructure/outbox/outbox.repository.ts`**: Core of the Outbox Pattern implementation, ensuring reliable event publishing.
*   **`src/lib/auth/`**: Contains authentication logic using Better Auth.
*   **`src/lib/authorization/authorization.service.ts`**: Implements role-based access control (RBAC).
*   **`src/workers/*.ts`**: These files define the background processes crucial for the asynchronous and reliable operation of the notification service.
*   **`.github/workflows/ci.yml`**: Defines the Continuous Integration pipeline.
*   **`.github/workflows/deploy.yml`**: Defines the deployment pipeline.

## Dependencies Between Modules

The project follows a layered architecture, where dependencies generally flow downwards:

*   **Presentation Layer (`src/app/`)**: Depends on the Application Layer (`src/core/`) and `lib/` utilities.
*   **Application Layer (`src/core/`)**: Depends on the Domain Layer (`src/core/domain/`) and Infrastructure Layer (`src/infrastructure/`) through abstractions (e.g., repository interfaces).
*   **Infrastructure Layer (`src/infrastructure/`)**: Depends on external libraries and services (e.g., Prisma, Redis, Resend).
*   **`lib/`**: Provides common utilities used across layers.
*   **`workers/`**: Interact with the Application and Infrastructure Layers to perform background tasks.

This structure helps maintain separation of concerns, testability, and scalability.