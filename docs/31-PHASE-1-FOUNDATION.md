# Phase 1: Foundation (Weeks 1-2)

**Document Version**: 1.0.0
**Last Updated**: 2025-01-06
**Duration**: 2 weeks
**Status**: Ready to start

---

## Overview

Phase 1 establishes the foundation for the notification service:
- Project setup and configuration
- Database schema and migrations
- Authentication with Better-Auth
- Basic API infrastructure
- Core domain entities
- Testing framework

**Goal**: Working local environment with database and authentication.

---

## Week 1: Project Setup & Database

### Day 1: Initial Setup

#### Task 1.1: Initialize Next.js Project

```bash
# Create project directory
cd /e
mkdir zuno-marketplace-notifications
cd zuno-marketplace-notifications

# Initialize Next.js
pnpm create next-app@latest . --typescript --tailwind --app --src-dir

# Initialize Git
git init
git checkout -b develop
git add .
git commit -m "chore: initialize Next.js project"
```

**Acceptance Criteria**:
- [ ] Next.js 16 running on port 3000
- [ ] TypeScript configured
- [ ] Tailwind CSS working
- [ ] Git repository initialized

#### Task 1.2: Install Dependencies

```bash
# Production dependencies
pnpm add @prisma/client better-auth @tanstack/react-query zod resend ws redis date-fns nanoid bcrypt handlebars winston

# Development dependencies
pnpm add -D prisma @types/node @types/react @types/ws @types/bcrypt jest @testing-library/react @testing-library/jest-dom eslint-config-prettier prettier husky lint-staged

# Install all dependencies from 04-PROJECT-SETUP.md
```

**Acceptance Criteria**:
- [ ] All dependencies installed
- [ ] No peer dependency warnings
- [ ] `pnpm build` succeeds

#### Task 1.3: Configure TypeScript

Create/update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@/core/*": ["./src/core/*"],
      "@/infrastructure/*": ["./src/infrastructure/*"]
    },
    "forceConsistentCasingInFileNames": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Acceptance Criteria**:
- [ ] `pnpm typecheck` passes
- [ ] Path aliases work
- [ ] Strict mode enabled

#### Task 1.4: Set Up ESLint & Prettier

Create `.eslintrc.json`:

```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc" }
      }
    ]
  }
}
```

Create `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "always"
}
```

**Acceptance Criteria**:
- [ ] `pnpm lint` passes
- [ ] `pnpm format` works
- [ ] Import ordering enforced

#### Task 1.5: Set Up Git Hooks

```bash
# Initialize Husky
pnpm exec husky init

# Create pre-commit hook
cat > .husky/pre-commit <<'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
EOF

chmod +x .husky/pre-commit

# Create pre-push hook
cat > .husky/pre-push <<'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm typecheck
pnpm test --passWithNoTests
EOF

chmod +x .husky/pre-push
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

**Acceptance Criteria**:
- [ ] Pre-commit hook runs lint-staged
- [ ] Pre-push hook runs typecheck + tests
- [ ] Hooks can be bypassed with `--no-verify` if needed

**Commit**:
```bash
git add .
git commit -m "chore: configure TypeScript, ESLint, Prettier, Husky"
```

---

### Day 2-3: Database Setup

#### Task 2.1: Set Up NeonDB

1. Visit [neon.tech](https://neon.tech) and sign up
2. Create project: `zuno-notifications-dev`
3. Copy connection string

**Acceptance Criteria**:
- [ ] NeonDB project created
- [ ] Connection string copied

#### Task 2.2: Initialize Prisma

```bash
# Initialize Prisma
pnpm prisma init

# This creates:
# - prisma/schema.prisma
# - .env (with DATABASE_URL)
```

**Acceptance Criteria**:
- [ ] `prisma/schema.prisma` exists
- [ ] `.env` file created

#### Task 2.3: Configure Environment Variables

Create `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://user:password@host.neon.tech/db?sslmode=require"

# Application
NODE_ENV="development"
PORT="3000"
LOG_LEVEL="debug"

# Better-Auth (generate secret: openssl rand -base64 32)
BETTER_AUTH_SECRET="your-32-char-secret-here"
BETTER_AUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_test_key"

# Local Email (Mailpit)
MAILPIT_SMTP_HOST="localhost"
MAILPIT_SMTP_PORT="1025"

# Redis
REDIS_URL="redis://localhost:6379"

# Feature Flags
ENABLE_WEBSOCKET="false"
ENABLE_PUSH="false"
ENABLE_SMS="false"
```

Create `.env.example` (same content, but with placeholders).

**Acceptance Criteria**:
- [ ] `.env.local` configured
- [ ] `.env.example` created
- [ ] `.env*` in `.gitignore`

#### Task 2.4: Create Environment Validation

Create `src/lib/config/env.ts`:

```typescript
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  RESEND_API_KEY: z.string().startsWith('re_'),
  REDIS_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

export type Env = z.infer<typeof envSchema>

export const env = envSchema.parse(process.env)
```

**Acceptance Criteria**:
- [ ] Environment validation works
- [ ] Missing vars throw clear errors
- [ ] Type-safe env access

#### Task 2.5: Create Complete Database Schema

Copy the complete Prisma schema from [docs/03-DATABASE-SCHEMA.md](./03-DATABASE-SCHEMA.md) into `prisma/schema.prisma`.

Key models to include:
- Organization
- OrganizationMember
- User
- Notification
- Outbox
- DeliveryAttempt
- Template
- TemplateVersion
- UserPreference
- Subscription
- RateLimitConfig
- ApiKey
- AuditLog
- DailyStats

**Acceptance Criteria**:
- [ ] Schema matches documentation
- [ ] All enums defined
- [ ] Indexes added
- [ ] Relationships correct

#### Task 2.6: Generate Prisma Client & Run Migration

```bash
# Generate Prisma client
pnpm prisma generate

# Create initial migration
pnpm prisma migrate dev --name init

# Verify schema
pnpm prisma db push
```

**Acceptance Criteria**:
- [ ] Migration created successfully
- [ ] Database tables created
- [ ] Prisma client generated
- [ ] `pnpm prisma studio` works

#### Task 2.7: Create Prisma Client Singleton

Create `src/infrastructure/database/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

**Acceptance Criteria**:
- [ ] Single Prisma instance per app
- [ ] Works in development (hot reload)
- [ ] Works in production

**Commit**:
```bash
git add .
git commit -m "feat(db): add Prisma schema and initialize database

- Add complete database schema
- Create initial migration
- Configure Prisma client singleton
- Add environment validation"
```

---

### Day 4: Docker Compose & Local Services

#### Task 3.1: Create Docker Compose File

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: notifications-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: notifications_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: notifications-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  mailpit:
    image: axllent/mailpit:latest
    container_name: notifications-mailpit
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI
    environment:
      MP_SMTP_AUTH_ACCEPT_ANY: 1
      MP_SMTP_AUTH_ALLOW_INSECURE: 1

volumes:
  postgres_data:
  redis_data:
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "docker:clean": "docker-compose down -v"
  }
}
```

**Acceptance Criteria**:
- [ ] `pnpm docker:up` starts all services
- [ ] PostgreSQL accessible on port 5432
- [ ] Redis accessible on port 6379
- [ ] Mailpit UI accessible on port 8025
- [ ] Health checks pass

#### Task 3.2: Create Seed Data Script

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create test organization
  const org = await prisma.organization.create({
    data: {
      name: 'Test Organization',
      slug: 'test-org',
      isActive: true,
    },
  })
  console.log('Created organization:', org.name)

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      name: 'Admin User',
    },
  })
  console.log('Created user:', user.email)

  // Create membership
  await prisma.organizationMember.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      role: 'OWNER',
    },
  })
  console.log('Created organization membership')

  // Create test template
  const template = await prisma.template.create({
    data: {
      organizationId: org.id,
      name: 'Welcome Email',
      slug: 'welcome-email',
      channel: 'EMAIL',
      type: 'WELCOME',
      subject: 'Welcome to {{organizationName}}!',
      body: '<h1>Welcome {{userName}}!</h1><p>We\'re excited to have you.</p>',
      variables: ['organizationName', 'userName'],
      createdBy: user.id,
      isActive: true,
    },
  })
  console.log('Created template:', template.name)

  // Create user preferences
  await prisma.userPreference.create({
    data: {
      userId: user.id,
      channel: 'EMAIL',
      enabled: true,
      frequency: 'REALTIME',
    },
  })
  console.log('Created user preferences')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Install `tsx`:

```bash
pnpm add -D tsx
```

Run seed:

```bash
pnpm db:seed
```

**Acceptance Criteria**:
- [ ] Seed script runs without errors
- [ ] Test organization created
- [ ] Test user created
- [ ] Test template created
- [ ] Verify in Prisma Studio

**Commit**:
```bash
git add .
git commit -m "feat(docker): add Docker Compose for local development

- Add PostgreSQL, Redis, Mailpit services
- Create database seed script
- Add Docker helper scripts"
```

---

### Day 5: Core Domain Entities

#### Task 4.1: Create Directory Structure

```bash
mkdir -p src/core/domain/{entities,value-objects,events,types}
mkdir -p src/core/use-cases/{notifications,templates,preferences}
mkdir -p src/core/services
mkdir -p src/infrastructure/{repositories,channels,outbox}
mkdir -p src/lib/{auth,logger,utils,errors,config}
mkdir -p src/components/{admin,shared,ui}
mkdir -p src/workers
mkdir -p tests/{unit,integration,e2e,fixtures,mocks}
```

**Acceptance Criteria**:
- [ ] All directories created
- [ ] Matches [05-DIRECTORY-STRUCTURE.md](./05-DIRECTORY-STRUCTURE.md)

#### Task 4.2: Create Base Entity

Create `src/core/domain/entities/base.entity.ts`:

```typescript
export abstract class BaseEntity<T> {
  protected readonly _id: T
  protected readonly _createdAt: Date
  protected _updatedAt: Date

  constructor(id: T, createdAt: Date = new Date(), updatedAt: Date = new Date()) {
    this._id = id
    this._createdAt = createdAt
    this._updatedAt = updatedAt
  }

  get id(): T {
    return this._id
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  protected touch(): void {
    this._updatedAt = new Date()
  }

  abstract equals(other: unknown): boolean
}
```

**Acceptance Criteria**:
- [ ] Base entity compiles
- [ ] Generic ID type supported

#### Task 4.3: Create Notification Entity

Create `src/core/domain/entities/notification.entity.ts`:

```typescript
import { BaseEntity } from './base.entity'
import { NotificationType, Channel, NotificationStatus, Priority } from '@prisma/client'

export interface NotificationProps {
  id: string
  organizationId: string
  userId: string
  type: NotificationType
  channel: Channel
  templateId?: string
  status: NotificationStatus
  priority: Priority
  payload: Record<string, unknown>
  idempotencyKey?: string
  correlationId?: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  sentAt?: Date
  deliveredAt?: Date
  failedAt?: Date
  retryCount: number
  maxRetries: number
  lastError?: string
}

export class Notification extends BaseEntity<string> {
  private props: NotificationProps

  constructor(props: NotificationProps) {
    super(props.id, props.createdAt, props.updatedAt)
    this.props = props
  }

  // Getters
  get organizationId(): string {
    return this.props.organizationId
  }

  get userId(): string {
    return this.props.userId
  }

  get type(): NotificationType {
    return this.props.type
  }

  get channel(): Channel {
    return this.props.channel
  }

  get status(): NotificationStatus {
    return this.props.status
  }

  get payload(): Record<string, unknown> {
    return this.props.payload
  }

  get retryCount(): number {
    return this.props.retryCount
  }

  get maxRetries(): number {
    return this.props.maxRetries
  }

  // Business logic methods
  canRetry(): boolean {
    return this.retryCount < this.maxRetries && this.status === 'FAILED'
  }

  markAsSent(): void {
    this.props.status = 'SENT'
    this.props.sentAt = new Date()
    this.touch()
  }

  markAsFailed(error: string): void {
    this.props.status = 'FAILED'
    this.props.failedAt = new Date()
    this.props.lastError = error
    this.props.retryCount += 1
    this.touch()
  }

  markAsDelivered(): void {
    this.props.status = 'DELIVERED'
    this.props.deliveredAt = new Date()
    this.touch()
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Notification)) return false
    return this.id === other.id
  }

  // Factory method
  static create(props: Omit<NotificationProps, 'createdAt' | 'updatedAt'>): Notification {
    return new Notification({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
}
```

**Acceptance Criteria**:
- [ ] Entity compiles
- [ ] Business logic methods work
- [ ] Factory method works
- [ ] Type-safe

#### Task 4.4: Create Value Objects

Create `src/core/domain/value-objects/email.vo.ts`:

```typescript
export class Email {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(email: string): Email {
    if (!Email.isValid(email)) {
      throw new Error(`Invalid email: ${email}`)
    }
    return new Email(email.toLowerCase().trim())
  }

  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  toString(): string {
    return this.value
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }
}
```

Create `src/core/domain/value-objects/notification-id.vo.ts`:

```typescript
import { nanoid } from 'nanoid'

export class NotificationId {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(): NotificationId {
    return new NotificationId(nanoid())
  }

  static from(value: string): NotificationId {
    if (!value || value.trim().length === 0) {
      throw new Error('NotificationId cannot be empty')
    }
    return new NotificationId(value)
  }

  toString(): string {
    return this.value
  }

  equals(other: NotificationId): boolean {
    return this.value === other.value
  }
}
```

**Acceptance Criteria**:
- [ ] Email validation works
- [ ] NotificationId generation works
- [ ] Value objects are immutable

**Commit**:
```bash
git add .
git commit -m "feat(domain): add core domain entities and value objects

- Add base entity class
- Add Notification entity with business logic
- Add Email and NotificationId value objects
- Create directory structure"
```

---

## Week 2: Authentication & Basic API

### Day 6-7: Better-Auth Setup

#### Task 5.1: Install shadcn/ui

```bash
# Initialize shadcn/ui
pnpm dlx shadcn-ui@latest init

# Add essential components
pnpm dlx shadcn-ui@latest add button card input label select toast
```

**Acceptance Criteria**:
- [ ] shadcn/ui initialized
- [ ] Components added to `src/components/ui/`
- [ ] Tailwind configured

#### Task 5.2: Configure Better-Auth

Create `src/lib/auth/better-auth.ts`:

```typescript
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin, organization } from 'better-auth/plugins'
import { prisma } from '@/infrastructure/database/prisma'
import { env } from '@/lib/config/env'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60, // 1 hour
    },
  },
  plugins: [
    admin(),
    organization({
      async sendInvitationEmail(data) {
        // TODO: Implement invitation email
        console.log('Invitation email:', data)
      },
    }),
  ],
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
})

export type Session = typeof auth.$Infer.Session.session
export type User = typeof auth.$Infer.Session.user
```

#### Task 5.3: Create Auth API Route

Create `src/app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from '@/lib/auth/better-auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
```

**Acceptance Criteria**:
- [ ] Better-Auth configured
- [ ] Organization plugin enabled
- [ ] Admin plugin enabled
- [ ] API routes work

#### Task 5.4: Create Auth Client

Create `src/lib/auth/client.ts`:

```typescript
import { createAuthClient } from 'better-auth/react'
import { adminClient, organizationClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
  plugins: [adminClient(), organizationClient()],
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  organization,
} = authClient
```

**Acceptance Criteria**:
- [ ] Client hooks work
- [ ] Organization methods available
- [ ] Type-safe

#### Task 5.5: Create Auth Guards

Create `src/lib/auth/guards.ts`:

```typescript
import { auth, Session } from './better-auth'
import { redirect } from 'next/navigation'

export async function requireAuth(): Promise<Session> {
  const session = await auth.api.getSession({
    headers: await import('next/headers').then((m) => m.headers()),
  })

  if (!session) {
    redirect('/auth/login')
  }

  return session
}

export async function requireRole(
  allowedRoles: string[]
): Promise<Session> {
  const session = await requireAuth()

  // Check organization role
  const orgMembership = session.user.organizations?.[0]
  if (!orgMembership || !allowedRoles.includes(orgMembership.role)) {
    throw new Error('Insufficient permissions')
  }

  return session
}
```

**Acceptance Criteria**:
- [ ] `requireAuth()` redirects unauthenticated users
- [ ] `requireRole()` checks permissions
- [ ] Works with Server Components

**Commit**:
```bash
git add .
git commit -m "feat(auth): integrate Better-Auth with organizations

- Configure Better-Auth with Prisma adapter
- Add organization and admin plugins
- Create auth API routes
- Create auth client for React
- Add auth guard utilities"
```

---

### Day 8-9: Logger & Basic API

#### Task 6.1: Create Logger

Create `src/lib/logger/logger.ts`:

```typescript
import winston from 'winston'
import { env } from '@/lib/config/env'

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
)

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  levels,
  format,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
})

// Context logger with correlation ID
export function createContextLogger(correlationId: string) {
  return {
    debug: (message: string, meta?: Record<string, unknown>) =>
      logger.debug(message, { correlationId, ...meta }),
    info: (message: string, meta?: Record<string, unknown>) =>
      logger.info(message, { correlationId, ...meta }),
    warn: (message: string, meta?: Record<string, unknown>) =>
      logger.warn(message, { correlationId, ...meta }),
    error: (message: string, meta?: Record<string, unknown>) =>
      logger.error(message, { correlationId, ...meta }),
  }
}
```

**Acceptance Criteria**:
- [ ] Logger works in dev and prod
- [ ] Correlation ID support
- [ ] Structured logging (JSON)

#### Task 6.2: Create Health Check Endpoint

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/database/prisma'

export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'healthy',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'unhealthy',
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}
```

Test:

```bash
curl http://localhost:3000/api/health
```

**Acceptance Criteria**:
- [ ] Endpoint returns 200 when healthy
- [ ] Endpoint returns 503 when unhealthy
- [ ] Database check works

#### Task 6.3: Create Basic Notification API

Create `src/app/api/notifications/send/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/infrastructure/database/prisma'
import { requireAuth } from '@/lib/auth/guards'
import { logger } from '@/lib/logger/logger'
import { nanoid } from 'nanoid'

const SendNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(['WELCOME', 'AUCTION_WON', 'BID_PLACED']),
  channel: z.enum(['EMAIL', 'WEBSOCKET']),
  templateId: z.string().uuid().optional(),
  payload: z.record(z.unknown()),
  idempotencyKey: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await requireAuth()
    const correlationId = nanoid()

    // 2. Validate request
    const body = await request.json()
    const validated = SendNotificationSchema.parse(body)

    logger.info('Creating notification', {
      correlationId,
      userId: session.user.id,
      type: validated.type,
    })

    // 3. Create notification (basic version)
    const notification = await prisma.notification.create({
      data: {
        id: nanoid(),
        organizationId: session.user.organizations[0].id,
        userId: validated.userId,
        type: validated.type,
        channel: validated.channel,
        templateId: validated.templateId,
        status: 'PENDING',
        priority: 'NORMAL',
        payload: validated.payload,
        idempotencyKey: validated.idempotencyKey,
        correlationId,
        retryCount: 0,
        maxRetries: 5,
      },
    })

    logger.info('Notification created', {
      correlationId,
      notificationId: notification.id,
    })

    return NextResponse.json({ id: notification.id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    logger.error('Error creating notification', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Acceptance Criteria**:
- [ ] Endpoint requires authentication
- [ ] Input validation works
- [ ] Notification created in database
- [ ] Correlation ID logged
- [ ] Returns notification ID

**Commit**:
```bash
git add .
git commit -m "feat(api): add logger and basic notification API

- Create Winston logger with correlation IDs
- Add health check endpoint
- Add POST /api/notifications/send endpoint
- Add input validation with Zod
- Add authentication guards"
```

---

### Day 10: Testing Setup

#### Task 7.1: Configure Jest

Create `jest.config.js`:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

Create `tests/setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

**Acceptance Criteria**:
- [ ] Jest configured for Next.js
- [ ] Path aliases work
- [ ] Coverage threshold set

#### Task 7.2: Write First Test

Create `tests/unit/core/domain/entities/notification.entity.test.ts`:

```typescript
import { Notification } from '@/core/domain/entities/notification.entity'

describe('Notification Entity', () => {
  it('should create a notification', () => {
    const notification = Notification.create({
      id: '123',
      organizationId: 'org-1',
      userId: 'user-1',
      type: 'WELCOME',
      channel: 'EMAIL',
      status: 'PENDING',
      priority: 'NORMAL',
      payload: { name: 'John' },
      retryCount: 0,
      maxRetries: 5,
    })

    expect(notification.id).toBe('123')
    expect(notification.status).toBe('PENDING')
  })

  it('should mark notification as sent', () => {
    const notification = Notification.create({
      id: '123',
      organizationId: 'org-1',
      userId: 'user-1',
      type: 'WELCOME',
      channel: 'EMAIL',
      status: 'PENDING',
      priority: 'NORMAL',
      payload: {},
      retryCount: 0,
      maxRetries: 5,
    })

    notification.markAsSent()

    expect(notification.status).toBe('SENT')
  })

  it('should check if notification can retry', () => {
    const notification = Notification.create({
      id: '123',
      organizationId: 'org-1',
      userId: 'user-1',
      type: 'WELCOME',
      channel: 'EMAIL',
      status: 'FAILED',
      priority: 'NORMAL',
      payload: {},
      retryCount: 3,
      maxRetries: 5,
    })

    expect(notification.canRetry()).toBe(true)

    // Exceed max retries
    notification.markAsFailed('Error')
    notification.markAsFailed('Error')
    notification.markAsFailed('Error')

    expect(notification.canRetry()).toBe(false)
  })
})
```

Run tests:

```bash
pnpm test
```

**Acceptance Criteria**:
- [ ] Tests pass
- [ ] Coverage reports generated
- [ ] Watch mode works

**Commit**:
```bash
git add .
git commit -m "test: add Jest configuration and entity tests

- Configure Jest for Next.js
- Add test setup file
- Write tests for Notification entity
- Set coverage threshold to 80%"
```

---

## Phase 1 Deliverables

### Completed Checklist

- [ ] **Project Setup**
  - [ ] Next.js 16 initialized with TypeScript
  - [ ] All dependencies installed
  - [ ] ESLint, Prettier, Husky configured
  - [ ] Git hooks working

- [ ] **Database**
  - [ ] NeonDB project created
  - [ ] Prisma schema complete
  - [ ] Initial migration applied
  - [ ] Seed data script works
  - [ ] Prisma Studio accessible

- [ ] **Docker**
  - [ ] Docker Compose configured
  - [ ] PostgreSQL running
  - [ ] Redis running
  - [ ] Mailpit running

- [ ] **Domain Layer**
  - [ ] Directory structure created
  - [ ] Base entity class
  - [ ] Notification entity with business logic
  - [ ] Value objects (Email, NotificationId)

- [ ] **Authentication**
  - [ ] Better-Auth configured
  - [ ] Organization plugin enabled
  - [ ] Auth API routes working
  - [ ] Auth guards implemented

- [ ] **API**
  - [ ] Logger with correlation IDs
  - [ ] Health check endpoint
  - [ ] Basic notification API endpoint
  - [ ] Input validation with Zod

- [ ] **Testing**
  - [ ] Jest configured
  - [ ] First tests written
  - [ ] Coverage threshold set
  - [ ] Tests passing

### Testing Phase 1

```bash
# 1. Type check
pnpm typecheck

# 2. Lint
pnpm lint

# 3. Tests
pnpm test

# 4. Build
pnpm build

# 5. Start development
pnpm docker:up
pnpm dev

# 6. Test health check
curl http://localhost:3000/api/health

# 7. Test notification API (after auth)
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "type": "WELCOME",
    "channel": "EMAIL",
    "payload": { "name": "John" }
  }'
```

### Known Issues / Tech Debt

- [ ] Notification API doesn't implement outbox pattern yet (Phase 2)
- [ ] No actual email sending yet (Phase 2)
- [ ] No retry mechanism yet (Phase 2)
- [ ] No rate limiting yet (Phase 3)

---

## Next Phase

Proceed to [32-PHASE-2-CORE-FEATURES.md](./32-PHASE-2-CORE-FEATURES.md):
- Email channel with Resend
- Outbox pattern implementation
- Retry mechanism
- Template system

---

**Related Documents**:
- [04-PROJECT-SETUP.md](./04-PROJECT-SETUP.md)
- [05-DIRECTORY-STRUCTURE.md](./05-DIRECTORY-STRUCTURE.md)
- [30-GIT-WORKFLOW.md](./30-GIT-WORKFLOW.md)
