# System Architecture - Zuno Marketplace Notifications

**Document Version**: 1.0.0
**Last Updated**: 2025-01-06

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Component Breakdown](#component-breakdown)
3. [Event Flow Diagrams](#event-flow-diagrams)
4. [Channel Architecture](#channel-architecture)
5. [Data Flow](#data-flow)
6. [Reliability Patterns](#reliability-patterns)
7. [Scalability Patterns](#scalability-patterns)
8. [Security Architecture](#security-architecture)

---

## High-Level Architecture

### System Context Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    External Systems                               │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  Marketplace   │  │  Smart         │  │  Indexer         │  │
│  │  API           │  │  Contracts     │  │  Service         │  │
│  └────────┬───────┘  └────────┬───────┘  └────────┬─────────┘  │
│           │                   │                    │             │
│           └───────────────────┴────────────────────┘             │
│                               │                                  │
└───────────────────────────────┼──────────────────────────────────┘
                                │ HTTP/Webhook
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│              Notification Service (Next.js 16)                    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  API Gateway Layer                          │ │
│  │  • Server Actions (Next.js)                                │ │
│  │  • REST API Routes                                         │ │
│  │  • Webhook Endpoints                                       │ │
│  │  • Rate Limiting Middleware                                │ │
│  │  • Authentication Middleware (Better-Auth)                 │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────────┐ │
│  │              Application Layer                              │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Use Cases                                             │ │ │
│  │  │  • SendNotificationUseCase                           │ │ │
│  │  │  • BatchSendUseCase                                  │ │ │
│  │  │  • UpdatePreferencesUseCase                         │ │ │
│  │  │  • ManageTemplateUseCase                            │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Services                                              │ │ │
│  │  │  • DeduplicationService                              │ │ │
│  │  │  • RateLimitService                                  │ │ │
│  │  │  • TemplateService                                   │ │ │
│  │  │  • IdempotencyService                                │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────────┐ │
│  │              Domain Layer                                   │ │
│  │  • Entities: Notification, Template, User, Subscription   │ │
│  │  • Value Objects: Email, NotificationId, TemplateId      │ │
│  │  • Domain Events: NotificationCreated, NotificationSent  │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────────┐ │
│  │         Infrastructure Layer (Persistence)                  │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Repositories (Prisma)                                 │ │ │
│  │  │  • NotificationRepository                            │ │ │
│  │  │  • TemplateRepository                                │ │ │
│  │  │  • UserPreferenceRepository                          │ │ │
│  │  │  • OutboxRepository                                  │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Outbox Pattern                                        │ │ │
│  │  │  • Transactional writes to outbox table             │ │ │
│  │  │  • Status: pending → processing → sent/failed       │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────────┐ │
│  │         Background Workers (Separate Process)               │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Outbox Poller                                         │ │ │
│  │  │  • Poll every 1 second                               │ │ │
│  │  │  • Batch processing (100 records)                    │ │ │
│  │  │  • Distribute to channels                            │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Retry Worker                                          │ │ │
│  │  │  • Exponential backoff                               │ │ │
│  │  │  • Max retry attempts: 5                             │ │ │
│  │  │  • Dead-letter queue for failures                    │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────────┐ │
│  │            Channel Layer (Delivery)                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────┐  ┌────────┐ │ │
│  │  │   Email     │  │  WebSocket  │  │  Push  │  │  SMS   │ │ │
│  │  │  Channel    │  │   Channel   │  │Channel │  │Channel │ │ │
│  │  └─────────────┘  └─────────────┘  └────────┘  └────────┘ │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                          │
└───────────────────────┼──────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                   External Providers                              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐            │
│  │   Resend     │  │   Firebase   │  │   Twilio   │            │
│  │   (Email)    │  │   (Push)     │  │   (SMS)    │            │
│  └──────────────┘  └──────────────┘  └────────────┘            │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      Data Stores                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐            │
│  │   NeonDB     │  │    Redis     │  │   S3       │            │
│  │ (PostgreSQL) │  │ (Rate Limit) │  │ (Assets)   │            │
│  └──────────────┘  └──────────────┘  └────────────┘            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. API Gateway Layer

**Responsibilities**:
- Receive incoming notification requests
- Authentication and authorization
- Rate limiting
- Request validation
- Correlation ID generation

**Technologies**:
- Next.js 16 Server Actions
- Better-Auth middleware
- Zod validation
- Redis (rate limiting)

**Key Files**:
```
src/app/api/
├── notifications/
│   ├── send/route.ts              # Single notification
│   ├── batch/route.ts             # Batch notifications
│   └── [id]/route.ts              # Get notification status
├── preferences/
│   ├── [userId]/route.ts          # User preferences CRUD
│   └── subscribe/route.ts         # Subscribe/unsubscribe
├── templates/
│   ├── route.ts                   # List/create templates
│   └── [id]/route.ts              # Get/update/delete template
├── webhooks/
│   └── inbound/route.ts           # Receive external events
└── health/route.ts                # Health check
```

---

### 2. Application Layer

**Responsibilities**:
- Business logic orchestration
- Use case implementation
- Service coordination

**Use Cases**:

#### SendNotificationUseCase
```typescript
// src/core/use-cases/notifications/send-notification.use-case.ts
export class SendNotificationUseCase {
  async execute(input: SendNotificationInput): Promise<SendNotificationOutput> {
    // 1. Validate input
    // 2. Check user preferences
    // 3. Check rate limits
    // 4. Deduplicate
    // 5. Write to outbox (transactional)
    // 6. Return notification ID
  }
}
```

#### BatchSendUseCase
```typescript
// src/core/use-cases/notifications/batch-send.use-case.ts
export class BatchSendUseCase {
  async execute(input: BatchSendInput): Promise<BatchSendOutput> {
    // 1. Validate batch (max 1000 notifications)
    // 2. Check organization rate limits
    // 3. Deduplicate across batch
    // 4. Write to outbox (single transaction)
    // 5. Return batch ID
  }
}
```

**Services**:

- **DeduplicationService**: Prevent duplicate sends within time window
- **RateLimitService**: Enforce per-channel, per-org limits
- **TemplateService**: Compile templates with user data
- **IdempotencyService**: Handle idempotent requests

---

### 3. Domain Layer

**Entities**:

```typescript
// src/core/domain/entities/notification.entity.ts
export class Notification {
  id: NotificationId
  organizationId: string
  userId: string
  type: NotificationType
  channel: Channel
  payload: NotificationPayload
  status: NotificationStatus
  createdAt: Date
  sentAt?: Date
  failedAt?: Date
  retryCount: number
  metadata: Record<string, unknown>
}

// src/core/domain/entities/template.entity.ts
export class Template {
  id: TemplateId
  organizationId: string
  name: string
  version: number
  channel: Channel
  subject?: string
  body: string
  variables: string[]
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// src/core/domain/entities/user-preference.entity.ts
export class UserPreference {
  userId: string
  channel: Channel
  enabled: boolean
  frequency: 'realtime' | 'digest_hourly' | 'digest_daily'
  optedOutAt?: Date
}
```

**Value Objects**:

```typescript
// src/core/domain/value-objects/email.vo.ts
export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Result<Email> {
    // Validation logic
  }

  toString(): string {
    return this.value
  }
}
```

---

### 4. Infrastructure Layer

**Repositories**:

```typescript
// src/infrastructure/repositories/notification.repository.ts
export interface INotificationRepository {
  create(notification: Notification): Promise<void>
  findById(id: string): Promise<Notification | null>
  updateStatus(id: string, status: NotificationStatus): Promise<void>
  findPendingForRetry(): Promise<Notification[]>
}

export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private prisma: PrismaClient) {}

  async create(notification: Notification): Promise<void> {
    await this.prisma.notification.create({
      data: {
        id: notification.id.value,
        // ... map entity to Prisma model
      }
    })
  }
  // ... other methods
}
```

**Outbox Pattern**:

```typescript
// src/infrastructure/outbox/outbox.repository.ts
export class OutboxRepository {
  async addToOutbox(
    notification: Notification,
    tx: PrismaTransaction
  ): Promise<void> {
    await tx.outbox.create({
      data: {
        id: generateId(),
        notificationId: notification.id.value,
        channel: notification.channel,
        payload: notification.payload,
        status: 'pending',
        idempotencyKey: notification.metadata.idempotencyKey,
        createdAt: new Date()
      }
    })
  }

  async fetchPendingBatch(batchSize: number): Promise<OutboxItem[]> {
    return await this.prisma.outbox.findMany({
      where: {
        status: 'pending',
        scheduledAt: { lte: new Date() }
      },
      take: batchSize,
      orderBy: { createdAt: 'asc' }
    })
  }
}
```

---

### 5. Background Workers

#### Outbox Poller Worker

```typescript
// src/workers/outbox-poller.worker.ts
export class OutboxPollerWorker {
  private readonly BATCH_SIZE = 100
  private readonly POLL_INTERVAL_MS = 1000

  async start(): Promise<void> {
    setInterval(async () => {
      try {
        const batch = await this.outboxRepo.fetchPendingBatch(this.BATCH_SIZE)

        if (batch.length === 0) return

        await this.processBatch(batch)
      } catch (error) {
        logger.error('Outbox poller error', { error })
      }
    }, this.POLL_INTERVAL_MS)
  }

  private async processBatch(batch: OutboxItem[]): Promise<void> {
    // Mark as processing
    await this.outboxRepo.markAsProcessing(batch.map(b => b.id))

    // Send to channels in parallel
    const results = await Promise.allSettled(
      batch.map(item => this.channelRouter.send(item))
    )

    // Update statuses
    await this.updateStatuses(batch, results)
  }
}
```

#### Retry Worker

```typescript
// src/workers/retry.worker.ts
export class RetryWorker {
  private readonly MAX_RETRIES = 5
  private readonly BASE_DELAY_MS = 1000

  async start(): Promise<void> {
    setInterval(async () => {
      const failedNotifications = await this.outboxRepo.findFailedForRetry()

      for (const notification of failedNotifications) {
        if (notification.retryCount >= this.MAX_RETRIES) {
          await this.moveToDeadLetterQueue(notification)
          continue
        }

        const delay = this.calculateBackoff(notification.retryCount)

        if (this.shouldRetry(notification, delay)) {
          await this.retry(notification)
        }
      }
    }, 5000) // Check every 5 seconds
  }

  private calculateBackoff(retryCount: number): number {
    return this.BASE_DELAY_MS * Math.pow(2, retryCount) // Exponential backoff
  }
}
```

---

### 6. Channel Layer

**Channel Interface**:

```typescript
// src/infrastructure/channels/channel.interface.ts
export interface IChannel {
  readonly name: ChannelType

  send(notification: ChannelNotification): Promise<ChannelResult>
  validatePayload(payload: unknown): Result<ChannelNotification>
  healthCheck(): Promise<boolean>
}

export type ChannelResult = {
  success: boolean
  messageId?: string
  error?: Error
  retryable: boolean
}
```

**Email Channel**:

```typescript
// src/infrastructure/channels/email/email.channel.ts
export class EmailChannel implements IChannel {
  readonly name = 'email'

  constructor(
    private resendClient: Resend,
    private templateService: TemplateService
  ) {}

  async send(notification: ChannelNotification): Promise<ChannelResult> {
    try {
      const compiled = await this.templateService.compile(
        notification.templateId,
        notification.data
      )

      const result = await this.resendClient.emails.send({
        from: 'notifications@zuno.market',
        to: notification.recipient,
        subject: compiled.subject,
        html: compiled.body
      })

      return { success: true, messageId: result.id, retryable: false }
    } catch (error) {
      const retryable = this.isRetryableError(error)
      return { success: false, error, retryable }
    }
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof ResendError) {
      return error.statusCode >= 500 || error.statusCode === 429
    }
    return true
  }
}
```

**WebSocket Channel**:

```typescript
// src/infrastructure/channels/websocket/websocket.channel.ts
export class WebSocketChannel implements IChannel {
  readonly name = 'websocket'

  constructor(
    private connectionManager: WebSocketConnectionManager,
    private redis: Redis
  ) {}

  async send(notification: ChannelNotification): Promise<ChannelResult> {
    try {
      const connections = await this.connectionManager.getConnectionsForUser(
        notification.userId
      )

      if (connections.length === 0) {
        // User not connected, store in Redis for later delivery
        await this.storeForLater(notification)
        return { success: true, retryable: false }
      }

      // Send to all active connections
      await Promise.all(
        connections.map(conn => conn.send(JSON.stringify(notification)))
      )

      return { success: true, retryable: false }
    } catch (error) {
      return { success: false, error, retryable: true }
    }
  }
}
```

---

## Event Flow Diagrams

### 1. Notification Creation Flow

```
┌──────────┐         ┌──────────────┐         ┌──────────────┐
│ External │         │ API Gateway  │         │ Application  │
│ Service  │         │   Layer      │         │    Layer     │
└────┬─────┘         └──────┬───────┘         └──────┬───────┘
     │                      │                        │
     │ POST /api/           │                        │
     │ notifications/send   │                        │
     ├──────────────────────>                        │
     │                      │                        │
     │                      │ 1. Authenticate        │
     │                      ├─────────────────>      │
     │                      │    (Better-Auth)       │
     │                      │                        │
     │                      │ 2. Validate Schema     │
     │                      │    (Zod)               │
     │                      │                        │
     │                      │ 3. Check Rate Limit    │
     │                      │    (Redis)             │
     │                      │                        │
     │                      │ 4. Execute Use Case    │
     │                      ├──────────────────────> │
     │                      │                        │
     │                      │                   5. Check User
     │                      │                      Preferences
     │                      │                        │
     │                      │                   6. Deduplicate
     │                      │                        │
     │                      │                   7. Write to
     │                      │                      Outbox (TX)
     │                      │                        │
     │                      │ 8. Return ID          │
     │                      <─────────────────────── │
     │                      │                        │
     │ 200 OK { id: "..." }│                        │
     <──────────────────────┤                        │
     │                      │                        │
┌────▼─────┐         ┌──────▼───────┐         ┌──────▼───────┐
│ External │         │ API Gateway  │         │ Application  │
│ Service  │         │   Layer      │         │    Layer     │
└──────────┘         └──────────────┘         └──────────────┘
```

### 2. Outbox Processing Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐
│ Outbox Table │    │   Poller     │    │   Channel    │    │ External │
│  (Database)  │    │   Worker     │    │    Router    │    │ Provider │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘    └────┬─────┘
       │                   │                   │                  │
       │ 1. Poll every 1s  │                   │                  │
       <───────────────────┤                   │                  │
       │                   │                   │                  │
       │ 2. Return batch   │                   │                  │
       │    (100 records)  │                   │                  │
       ├──────────────────>                    │                  │
       │                   │                   │                  │
       │ 3. Mark as        │                   │                  │
       │    processing     │                   │                  │
       <───────────────────┤                   │                  │
       │                   │                   │                  │
       │                   │ 4. Route to       │                  │
       │                   │    channels       │                  │
       │                   ├──────────────────>                   │
       │                   │                   │                  │
       │                   │                   │ 5. Send via      │
       │                   │                   │    provider      │
       │                   │                   ├─────────────────>
       │                   │                   │                  │
       │                   │                   │ 6. Provider      │
       │                   │                   │    response      │
       │                   │                   <──────────────────┤
       │                   │                   │                  │
       │                   │ 7. Update status  │                  │
       │                   │    (sent/failed)  │                  │
       │                   <───────────────────┤                  │
       │                   │                   │                  │
       │ 8. Update outbox  │                   │                  │
       │    status         │                   │                  │
       <───────────────────┤                   │                  │
       │                   │                   │                  │
┌──────▼───────┐    ┌──────▼───────┐    ┌──────▼───────┐    ┌────▼─────┐
│ Outbox Table │    │   Poller     │    │   Channel    │    │ External │
│  (Database)  │    │   Worker     │    │    Router    │    │ Provider │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────┘
```

### 3. Retry Flow with Exponential Backoff

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Outbox Table │    │    Retry     │    │   Channel    │
│              │    │   Worker     │    │              │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       │ 1. Find failed    │                   │
       │    records        │                   │
       <───────────────────┤                   │
       │                   │                   │
       │ 2. Return failed  │                   │
       │    (retryCount<5) │                   │
       ├──────────────────>                    │
       │                   │                   │
       │                   │ 3. Calculate      │
       │                   │    backoff delay  │
       │                   │    (2^retry * 1s) │
       │                   │                   │
       │                   │ Wait: Attempt 0 = 1s
       │                   │       Attempt 1 = 2s
       │                   │       Attempt 2 = 4s
       │                   │       Attempt 3 = 8s
       │                   │       Attempt 4 = 16s
       │                   │                   │
       │                   │ 4. Retry send     │
       │                   ├──────────────────>
       │                   │                   │
       │                   │ 5a. Success       │
       │                   <───────────────────┤
       │                   │                   │
       │ 6a. Mark as sent  │                   │
       <───────────────────┤                   │
       │                   │                   │
       │                   │ 5b. Failure       │
       │                   │    (retryCount=5) │
       │                   <───────────────────┤
       │                   │                   │
       │ 6b. Move to DLQ   │                   │
       <───────────────────┤                   │
       │                   │                   │
┌──────▼───────┐    ┌──────▼───────┐    ┌──────▼───────┐
│ Outbox Table │    │    Retry     │    │   Channel    │
│              │    │   Worker     │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## Channel Architecture

### Channel Abstraction

All channels implement the `IChannel` interface, ensuring consistent behavior:

```typescript
export interface IChannel {
  readonly name: ChannelType
  send(notification: ChannelNotification): Promise<ChannelResult>
  validatePayload(payload: unknown): Result<ChannelNotification>
  healthCheck(): Promise<boolean>
}
```

### Channel Router

```typescript
// src/infrastructure/channels/channel-router.ts
export class ChannelRouter {
  private channels: Map<ChannelType, IChannel>

  constructor() {
    this.channels = new Map()
    this.registerChannels()
  }

  private registerChannels() {
    this.channels.set('email', new EmailChannel(resendClient, templateService))
    this.channels.set('websocket', new WebSocketChannel(connectionManager, redis))
    // Future: 'push', 'sms'
  }

  async send(outboxItem: OutboxItem): Promise<ChannelResult> {
    const channel = this.channels.get(outboxItem.channel)

    if (!channel) {
      throw new Error(`Channel not found: ${outboxItem.channel}`)
    }

    return await channel.send(outboxItem.payload)
  }
}
```

---

## Data Flow

### Write Path (Notification Creation)

```
User Request
    │
    ▼
API Gateway (Auth + Validation)
    │
    ▼
Application Layer (Use Case)
    │
    ├─> Check User Preferences
    ├─> Deduplicate (Redis)
    ├─> Check Rate Limit (Redis)
    │
    ▼
Domain Layer (Create Entity)
    │
    ▼
Infrastructure Layer (Repository)
    │
    ▼
Database Transaction
    ├─> INSERT INTO notifications
    └─> INSERT INTO outbox (same TX)
    │
    ▼
Return Notification ID
```

### Read Path (Delivery Status)

```
User Request (GET /api/notifications/:id)
    │
    ▼
API Gateway (Auth)
    │
    ▼
Application Layer
    │
    ▼
Repository (findById)
    │
    ▼
Database Query
    │
    ▼
Return Status + Metadata
```

### Background Processing Path

```
Poller Worker (Every 1s)
    │
    ▼
Fetch Pending from Outbox
    │
    ▼
Mark as Processing (UPDATE status)
    │
    ▼
Channel Router (Distribute)
    │
    ├─> Email Channel → Resend API
    ├─> WebSocket Channel → Active Connections
    └─> [Future] Push/SMS Channels
    │
    ▼
Update Outbox Status (sent/failed)
    │
    ▼
Update Notification Record
```

---

## Reliability Patterns

### 1. Transactional Outbox Pattern

**Problem**: Ensure notification is persisted before attempting delivery.

**Solution**: Write to database and outbox table in single transaction.

```typescript
await prisma.$transaction(async (tx) => {
  // Create notification record
  await tx.notification.create({ data: notificationData })

  // Create outbox entry
  await tx.outbox.create({ data: outboxData })
})
```

**Benefits**:
- Atomicity: Both records created or neither
- Durability: Survived even if worker crashes
- Decoupling: API responds immediately, delivery happens async

### 2. Idempotency

**Problem**: Prevent duplicate sends when API is called multiple times.

**Solution**: Use idempotency keys.

```typescript
const idempotencyKey = request.headers['idempotency-key'] || generateKey()

const existing = await redis.get(`idempotency:${idempotencyKey}`)
if (existing) {
  return JSON.parse(existing) // Return cached response
}

const result = await sendNotification(data)

await redis.setex(`idempotency:${idempotencyKey}`, 86400, JSON.stringify(result))
```

### 3. At-Least-Once Delivery

**Guarantee**: Every notification in outbox will be attempted at least once.

**Implementation**:
- Poller continuously fetches pending records
- Failed records eligible for retry
- Only moved to DLQ after max retries exceeded

### 4. Circuit Breaker

**Problem**: Prevent cascading failures when external provider is down.

**Solution**: Implement circuit breaker pattern.

```typescript
export class CircuitBreaker {
  private failureCount = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'
  private readonly threshold = 5
  private readonly timeout = 60000 // 1 minute

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess() {
    this.failureCount = 0
    this.state = 'CLOSED'
  }

  private onFailure() {
    this.failureCount++
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN'
      this.lastFailureTime = Date.now()
    }
  }
}
```

---

## Scalability Patterns

### 1. Horizontal Scaling

**Stateless Design**: All workers are stateless, allowing multiple instances.

```yaml
# Kubernetes deployment
replicas: 3

# Each worker instance:
- Polls outbox independently
- Uses database-level locking (SELECT FOR UPDATE SKIP LOCKED)
- No shared state except Redis for rate limiting
```

### 2. Database Partitioning

**Strategy**: Partition outbox table by organization ID.

```sql
-- Future optimization
CREATE TABLE outbox (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  -- ... other fields
) PARTITION BY HASH (organization_id);
```

### 3. Rate Limiting (Token Bucket Algorithm)

```typescript
export class RateLimiter {
  async checkLimit(
    key: string,
    maxTokens: number,
    refillRate: number
  ): Promise<boolean> {
    const now = Date.now()
    const tokenKey = `rate:${key}:tokens`
    const tsKey = `rate:${key}:ts`

    const tokens = await redis.get(tokenKey) || maxTokens
    const lastRefill = await redis.get(tsKey) || now

    // Refill tokens based on time elapsed
    const elapsed = now - lastRefill
    const newTokens = Math.min(
      maxTokens,
      tokens + (elapsed / 1000) * refillRate
    )

    if (newTokens < 1) {
      return false // Rate limit exceeded
    }

    // Consume 1 token
    await redis.set(tokenKey, newTokens - 1)
    await redis.set(tsKey, now)

    return true
  }
}
```

### 4. Connection Pooling (WebSocket)

```typescript
export class WebSocketConnectionManager {
  private connections: Map<string, Set<WebSocket>> = new Map()

  addConnection(userId: string, ws: WebSocket) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set())
    }
    this.connections.get(userId).add(ws)
  }

  removeConnection(userId: string, ws: WebSocket) {
    this.connections.get(userId)?.delete(ws)
  }

  async getConnectionsForUser(userId: string): Promise<WebSocket[]> {
    return Array.from(this.connections.get(userId) || [])
  }
}
```

---

## Security Architecture

### 1. Authentication Flow

```
Client Request
    │
    ▼
Better-Auth Middleware
    │
    ├─> Verify session token (JWT)
    ├─> Extract user + organization
    │
    ▼
Check RBAC Permissions
    │
    ├─> Organization-level access
    ├─> Resource-level permissions
    │
    ▼
Allow Request (if authorized)
```

### 2. Row-Level Security (Logical)

```typescript
// All queries scoped to organization
async findNotifications(organizationId: string, userId: string) {
  return await prisma.notification.findMany({
    where: {
      organizationId,     // Ensures data isolation
      userId            // User can only see their notifications
    }
  })
}
```

### 3. Input Validation

```typescript
import { z } from 'zod'

const SendNotificationSchema = z.object({
  userId: z.string().uuid(),
  channel: z.enum(['email', 'websocket', 'push', 'sms']),
  templateId: z.string().uuid(),
  data: z.record(z.unknown()),
  idempotencyKey: z.string().optional()
})

// Usage
const validated = SendNotificationSchema.parse(request.body)
```

---

## Next Steps

1. Review architecture with team
2. Validate technology choices
3. Begin Phase 1 implementation
4. Set up local development environment

**Related Documents**:
- [03-DATABASE-SCHEMA.md](./03-DATABASE-SCHEMA.md) - Database design
- [11-OUTBOX-PATTERN.md](./11-OUTBOX-PATTERN.md) - Outbox implementation
- [31-PHASE-1-FOUNDATION.md](./31-PHASE-1-FOUNDATION.md) - Implementation guide
