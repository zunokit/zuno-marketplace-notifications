# Code Standards for Zuno Marketplace Notifications

This document outlines the coding standards and conventions for the Zuno Marketplace Notifications project. Adhering to these standards ensures code consistency, maintainability, and readability across the development team.

## 1. TypeScript Conventions

*   **Type Safety**: Always prioritize strong typing. Use explicit types for variables, function arguments, and return values. Avoid `any` unless absolutely necessary and with clear justification.
*   **Interfaces and Types**: Use `interface` for defining object shapes that can be implemented or extended. Use `type` aliases for unions, intersections, and primitive types.
*   **Enums**: Prefer string enums for better readability and debugging.
*   **Generics**: Use generics to create reusable components and functions that work with a variety of types while maintaining type safety.

## 2. File Naming

*   **General**: All file names should be in `kebab-case` (e.g., `my-component.tsx`, `utility-function.ts`).
*   **Components**: React components should be named `ComponentName.tsx` (PascalCase for the component name).
*   **Modules/Services/Use Cases**: `module-name.service.ts`, `use-case-name.use-case.ts`.
*   **Entities/Value Objects**: `entity-name.entity.ts`, `value-object-name.vo.ts`.
*   **API Routes**: Files within `src/app/api` should follow Next.js conventions (e.g., `route.ts` for route handlers, `[id]/route.ts` for dynamic segments).

## 3. Import Organization

Imports should be organized as follows, with an empty line between each group:

1.  **Node.js built-in modules** (e.g., `path`, `fs`)
2.  **Third-party libraries** (e.g., `react`, `next`, `prisma`)
3.  **Project-level aliases** (e.g., `@/lib`, `@/components`)
4.  **Relative imports** (e.g., `./`, `../`)
5.  **Side effect imports** (if any)

Example:

```typescript
import { join } from 'path';

import { PrismaClient } from '@prisma/client';
import { Button } from '@/components/ui/button';

import { NotificationEntity } from '../domain/entities/notification.entity';
import { formatCurrency } from './utils';
```

## 4. Error Handling Patterns

*   **Centralized Error Handling**: Implement a centralized error handling mechanism for API routes and background workers to catch and log errors consistently.
*   **Custom Error Classes**: Define custom error classes for specific application errors to provide more context and allow for granular error handling (e.g., `NotFoundError`, `UnauthorizedError`, `ValidationError`).
*   **HTTP Status Codes**: Use appropriate HTTP status codes for API responses.
*   **Logging Errors**: All errors should be logged using the configured logging service (Winston) with relevant context.
*   **Graceful Degradation**: Design features to fail gracefully when external services or dependencies are unavailable.

## 5. Logging Standards

*   **Winston**: Use Winston for all logging within the application.
*   **Log Levels**: Utilize appropriate log levels (e.g., `error`, `warn`, `info`, `debug`) for different types of messages.
*   **Structured Logging**: Log messages should be structured (JSON format) to facilitate easier parsing and analysis by logging aggregation tools.
*   **Contextual Information**: Include relevant contextual information in log messages (e.g., `correlationId`, `userId`, `operationName`) to aid in debugging and traceability.

## 6. Testing Requirements

*   **Unit Tests**: All core business logic (`src/core`), services, and utilities (`src/lib`) must have comprehensive unit tests.
    *   Coverage: Aim for at least 80% line coverage for these modules.
    *   Framework: Jest.
*   **Integration Tests**: API routes (`src/app/api`), database interactions, and integrations with external services (channels) must have integration tests.
    *   Purpose: Verify the interaction between different modules and external systems.
*   **End-to-End (E2E) Tests**: (Future consideration) For critical user flows.
*   **Test Naming**: Test files should be named `*.test.ts` or `*.spec.ts`.
*   **Clear Assertions**: Tests should have clear and concise assertions.
*   **Mocking**: Use mocking judiciously for external dependencies to isolate the code under test.

## 7. Code Formatting

*   **Prettier**: Use Prettier for consistent code formatting. The project's `.prettierrc` configuration should be respected.
*   **ESLint**: Use ESLint for static code analysis and adherence to best practices. The project's `.eslintrc.json` configuration should be followed.

## 8. Architectural Patterns

*   **Clean Architecture**: Adhere to the principles of Clean Architecture, ensuring separation of concerns between presentation, application, and infrastructure layers.
*   **Dependency Inversion**: Dependencies should flow from outer layers to inner layers (e.g., `infrastructure` depends on `core/domain`, but `core/domain` does not depend on `infrastructure`).
*   **Outbox Pattern**: Strictly follow the Outbox Pattern for reliable at-least-once delivery of messages/events.
*   **Idempotency**: Implement idempotency for all operations where repeated requests should not lead to unintended side effects.
*   **Multi-tenancy**: Design and implement features with multi-tenancy in mind, ensuring data isolation and proper access control for different organizations.