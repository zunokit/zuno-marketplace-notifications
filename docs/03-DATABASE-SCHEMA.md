# Database Schema - Zuno Marketplace Notifications

**Document Version**: 1.0.0
**Last Updated**: 2025-01-06

---

## Overview

This document defines the complete PostgreSQL database schema for the Zuno Marketplace Notifications service, designed using **Prisma ORM** with NeonDB as the hosting provider.

### Design Principles

1. **Extensibility**: Easy to add new channels and notification types
2. **Performance**: Optimized indexes for common queries
3. **Audit Trail**: Complete history of all actions
4. **Data Integrity**: Foreign keys, constraints, and validation
5. **Scalability**: Partitioning-ready for high volume
6. **GDPR Compliance**: Soft deletes, user data isolation

---

## Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// AUTHENTICATION & AUTHORIZATION
// ============================================================================

/// Organizations represent tenants in the multi-tenant system
model Organization {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime? // Soft delete

  // Relationships
  users            OrganizationMember[]
  notifications    Notification[]
  templates        Template[]
  rateLimitConfigs RateLimitConfig[]
  apiKeys          ApiKey[]

  @@index([slug])
  @@index([isActive, deletedAt])
  @@map("organizations")
}

/// Organization members with role-based access
model OrganizationMember {
  id             String   @id @default(uuid())
  organizationId String
  userId         String
  role           Role     @default(VIEWER)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relationships
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([organizationId, userId])
  @@index([userId])
  @@index([organizationId, role])
  @@map("organization_members")
}

enum Role {
  OWNER
  ADMIN
  EDITOR
  VIEWER
}

/// Users managed by Better-Auth
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? // Soft delete

  // Relationships
  organizations    OrganizationMember[]
  notifications    Notification[]       @relation("UserNotifications")
  preferences      UserPreference[]
  subscriptions    Subscription[]
  auditLogs        AuditLog[]           @relation("AuditActor")

  @@index([email])
  @@index([deletedAt])
  @@map("users")
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/// Core notification entity
model Notification {
  id             String           @id @default(uuid())
  organizationId String
  userId         String
  type           NotificationType
  channel        Channel
  templateId     String?
  status         NotificationStatus @default(PENDING)
  priority       Priority         @default(NORMAL)

  // Payload (channel-specific data)
  payload        Json

  // Metadata
  idempotencyKey String?          @unique
  correlationId  String?          // For tracing
  metadata       Json?            // Additional context

  // Timing
  createdAt      DateTime         @default(now())
  scheduledAt    DateTime?        // Future: scheduled delivery
  sentAt         DateTime?
  deliveredAt    DateTime?
  failedAt       DateTime?
  readAt         DateTime?

  // Retry tracking
  retryCount     Int              @default(0)
  maxRetries     Int              @default(5)
  lastRetryAt    DateTime?
  nextRetryAt    DateTime?

  // Error tracking
  lastError      String?
  errorCategory  ErrorCategory?

  // Relationships
  organization   Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User             @relation("UserNotifications", fields: [userId], references: [id], onDelete: Cascade)
  template       Template?        @relation(fields: [templateId], references: [id], onDelete: SetNull)
  deliveryAttempts DeliveryAttempt[]
  outbox         Outbox?

  @@index([organizationId, userId, createdAt(sort: Desc)])
  @@index([status, createdAt])
  @@index([channel, status])
  @@index([idempotencyKey])
  @@index([correlationId])
  @@index([scheduledAt])
  @@index([nextRetryAt])
  @@map("notifications")
}

enum NotificationType {
  // Marketplace events
  AUCTION_STARTED
  AUCTION_ENDING_SOON
  AUCTION_ENDED
  AUCTION_WON
  AUCTION_OUTBID

  BID_PLACED
  BID_ACCEPTED
  BID_REJECTED

  OFFER_RECEIVED
  OFFER_ACCEPTED
  OFFER_REJECTED
  OFFER_EXPIRED

  LISTING_CREATED
  LISTING_SOLD
  LISTING_EXPIRED

  NFT_MINTED
  NFT_TRANSFERRED
  NFT_BURNED

  COLLECTION_CREATED
  COLLECTION_VERIFIED

  // System notifications
  SYSTEM_MAINTENANCE
  SYSTEM_UPDATE
  SECURITY_ALERT

  // User actions
  WELCOME
  EMAIL_VERIFICATION
  PASSWORD_RESET
  PROFILE_UPDATED

  // Generic
  CUSTOM
}

enum Channel {
  EMAIL
  WEBSOCKET
  PUSH
  SMS
}

enum NotificationStatus {
  PENDING       // Created, not yet processed
  SCHEDULED     // Scheduled for future delivery
  PROCESSING    // Being processed by worker
  SENT          // Successfully sent to provider
  DELIVERED     // Confirmed delivered to recipient
  FAILED        // Failed after all retries
  CANCELLED     // Manually cancelled
  EXPIRED       // Expired before delivery
}

enum Priority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum ErrorCategory {
  VALIDATION_ERROR
  RATE_LIMIT_EXCEEDED
  PROVIDER_ERROR
  NETWORK_ERROR
  AUTHENTICATION_ERROR
  CONFIGURATION_ERROR
  UNKNOWN_ERROR
}

// ============================================================================
// OUTBOX PATTERN
// ============================================================================

/// Transactional outbox for reliable message delivery
model Outbox {
  id             String         @id @default(uuid())
  notificationId String         @unique
  channel        Channel
  payload        Json
  status         OutboxStatus   @default(PENDING)

  // Timing
  createdAt      DateTime       @default(now())
  scheduledAt    DateTime       @default(now()) // When to process
  processingAt   DateTime?      // When worker started processing
  processedAt    DateTime?      // When worker finished

  // Locking (for distributed workers)
  lockedAt       DateTime?
  lockedBy       String?        // Worker ID

  // Retry tracking
  retryCount     Int            @default(0)
  lastError      String?
  nextRetryAt    DateTime?

  // Relationships
  notification   Notification   @relation(fields: [notificationId], references: [id], onDelete: Cascade)

  @@index([status, scheduledAt])
  @@index([status, nextRetryAt])
  @@index([lockedAt, lockedBy])
  @@index([channel, status])
  @@map("outbox")
}

enum OutboxStatus {
  PENDING
  PROCESSING
  PROCESSED
  FAILED
  DEAD_LETTER
}

/// Dead Letter Queue for permanently failed notifications
model DeadLetterQueue {
  id             String   @id @default(uuid())
  notificationId String
  channel        Channel
  payload        Json
  error          String
  failedAt       DateTime @default(now())
  retryCount     Int
  metadata       Json?

  @@index([failedAt])
  @@index([channel])
  @@map("dead_letter_queue")
}

// ============================================================================
// DELIVERY TRACKING
// ============================================================================

/// Track every delivery attempt for observability
model DeliveryAttempt {
  id             String   @id @default(uuid())
  notificationId String
  attemptNumber  Int
  channel        Channel
  provider       String   // e.g., "resend", "firebase"

  // Result
  success        Boolean
  responseCode   Int?
  responseBody   Json?
  error          String?
  duration       Int      // Milliseconds

  // Provider-specific
  providerMessageId String?
  providerMetadata  Json?

  // Timing
  attemptedAt    DateTime @default(now())

  // Relationships
  notification   Notification @relation(fields: [notificationId], references: [id], onDelete: Cascade)

  @@index([notificationId, attemptNumber])
  @@index([attemptedAt])
  @@index([success])
  @@map("delivery_attempts")
}

// ============================================================================
// TEMPLATES
// ============================================================================

/// Notification templates with versioning
model Template {
  id             String         @id @default(uuid())
  organizationId String
  name           String
  slug           String
  channel        Channel
  type           NotificationType?
  version        Int            @default(1)
  isActive       Boolean        @default(true)

  // Email-specific
  subject        String?        // Handlebars template
  fromName       String?
  fromEmail      String?
  replyTo        String?

  // Body (Handlebars template)
  body           String         @db.Text
  bodyText       String?        @db.Text // Plain text version

  // Variables (extracted from template)
  variables      Json           // ["userName", "actionUrl", ...]

  // Metadata
  description    String?
  category       String?
  tags           String[]

  // Audit
  createdBy      String
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  publishedAt    DateTime?
  deprecatedAt   DateTime?

  // Relationships
  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  notifications  Notification[]
  versions       TemplateVersion[]

  @@unique([organizationId, slug, version])
  @@index([organizationId, channel, isActive])
  @@index([type, channel])
  @@map("templates")
}

/// Template version history
model TemplateVersion {
  id         String   @id @default(uuid())
  templateId String
  version    Int
  subject    String?
  body       String   @db.Text
  bodyText   String?  @db.Text
  variables  Json
  createdBy  String
  createdAt  DateTime @default(now())
  changeSummary String?

  // Relationships
  template   Template @relation(fields: [templateId], references: [id], onDelete: Cascade)

  @@unique([templateId, version])
  @@index([templateId, createdAt(sort: Desc)])
  @@map("template_versions")
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

/// User notification preferences
model UserPreference {
  id         String   @id @default(uuid())
  userId     String
  channel    Channel
  type       NotificationType?
  enabled    Boolean  @default(true)
  frequency  Frequency @default(REALTIME)
  quietHoursStart  Int?     // Hour (0-23)
  quietHoursEnd    Int?     // Hour (0-23)
  timezone   String?  // IANA timezone

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relationships
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, channel, type])
  @@index([userId, enabled])
  @@map("user_preferences")
}

enum Frequency {
  REALTIME        // Immediate delivery
  DIGEST_HOURLY   // Hourly digest
  DIGEST_DAILY    // Daily digest
  DIGEST_WEEKLY   // Weekly digest
}

/// Subscription management (for email unsubscribe)
model Subscription {
  id         String   @id @default(uuid())
  userId     String
  email      String
  category   String   // e.g., "marketing", "transactional", "all"
  isSubscribed Boolean @default(true)
  subscribedAt   DateTime?
  unsubscribedAt DateTime?
  reason     String?  // Unsubscribe reason

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relationships
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, category])
  @@index([email, category])
  @@map("subscriptions")
}

// ============================================================================
// RATE LIMITING
// ============================================================================

/// Per-organization rate limit configuration
model RateLimitConfig {
  id             String   @id @default(uuid())
  organizationId String
  channel        Channel
  maxPerMinute   Int      @default(100)
  maxPerHour     Int      @default(1000)
  maxPerDay      Int      @default(10000)
  isActive       Boolean  @default(true)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relationships
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([organizationId, channel])
  @@index([organizationId, isActive])
  @@map("rate_limit_configs")
}

// ============================================================================
// API KEYS & AUTHENTICATION
// ============================================================================

/// API keys for external integrations
model ApiKey {
  id             String   @id @default(uuid())
  organizationId String
  name           String
  keyHash        String   @unique // bcrypt hash
  keyPrefix      String   // First 8 chars (for identification)

  // Permissions
  scopes         String[]
  isActive       Boolean  @default(true)

  // Usage tracking
  lastUsedAt     DateTime?
  usageCount     Int      @default(0)

  // Expiry
  expiresAt      DateTime?

  createdBy      String
  createdAt      DateTime @default(now())
  revokedAt      DateTime?
  revokedBy      String?

  // Relationships
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId, isActive])
  @@index([keyPrefix])
  @@map("api_keys")
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

/// Comprehensive audit trail
model AuditLog {
  id             String   @id @default(uuid())
  organizationId String?
  userId         String?
  action         AuditAction
  resource       AuditResource
  resourceId     String?

  // Change tracking
  changes        Json?    // { before: {...}, after: {...} }

  // Context
  ipAddress      String?
  userAgent      String?
  metadata       Json?

  createdAt      DateTime @default(now())

  // Relationships
  user           User?    @relation("AuditActor", fields: [userId], references: [id], onDelete: SetNull)

  @@index([organizationId, createdAt(sort: Desc)])
  @@index([userId, createdAt(sort: Desc)])
  @@index([resource, resourceId])
  @@index([createdAt(sort: Desc)])
  @@map("audit_logs")
}

enum AuditAction {
  CREATE
  READ
  UPDATE
  DELETE
  SEND
  RESEND
  CANCEL
  SUBSCRIBE
  UNSUBSCRIBE
  EXPORT
  IMPORT
}

enum AuditResource {
  NOTIFICATION
  TEMPLATE
  USER_PREFERENCE
  SUBSCRIPTION
  API_KEY
  ORGANIZATION
  USER
}

// ============================================================================
// ANALYTICS (Future)
// ============================================================================

/// Daily aggregated stats
model DailyStats {
  id             String   @id @default(uuid())
  organizationId String
  date           DateTime @db.Date
  channel        Channel

  // Counters
  sent           Int      @default(0)
  delivered      Int      @default(0)
  failed         Int      @default(0)
  bounced        Int      @default(0) // Email-specific
  opened         Int      @default(0) // Email-specific
  clicked        Int      @default(0) // Email-specific

  // Latency (milliseconds)
  avgLatency     Int?
  p95Latency     Int?
  p99Latency     Int?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([organizationId, date, channel])
  @@index([organizationId, date(sort: Desc)])
  @@index([date(sort: Desc)])
  @@map("daily_stats")
}
```

---

## Indexes Strategy

### Primary Indexes

All tables have primary key indexes automatically created by PostgreSQL.

### Secondary Indexes

#### High-Priority Indexes (Query Performance)

```sql
-- Notification lookups by user
CREATE INDEX idx_notifications_org_user_created
ON notifications (organization_id, user_id, created_at DESC);

-- Notification processing (outbox)
CREATE INDEX idx_notifications_status_created
ON notifications (status, created_at);

-- Outbox polling
CREATE INDEX idx_outbox_status_scheduled
ON outbox (status, scheduled_at)
WHERE status IN ('PENDING', 'FAILED');

-- Retry processing
CREATE INDEX idx_outbox_status_retry
ON outbox (status, next_retry_at)
WHERE status = 'FAILED' AND next_retry_at IS NOT NULL;

-- Template lookups
CREATE INDEX idx_templates_org_channel_active
ON templates (organization_id, channel, is_active);

-- Audit logs
CREATE INDEX idx_audit_logs_org_created
ON audit_logs (organization_id, created_at DESC);
```

#### Partial Indexes (Space Optimization)

```sql
-- Only index active organizations
CREATE INDEX idx_organizations_active
ON organizations (is_active)
WHERE deleted_at IS NULL;

-- Only index locked outbox items
CREATE INDEX idx_outbox_locked
ON outbox (locked_at, locked_by)
WHERE locked_at IS NOT NULL;
```

### Index Maintenance

```sql
-- Run monthly to analyze index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;
```

---

## Database Constraints

### Foreign Keys

All foreign keys use `onDelete: Cascade` or `onDelete: SetNull` to maintain referential integrity.

```prisma
// Example: Delete all notifications when user is deleted
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

// Example: Keep notification but clear template reference
template Template? @relation(fields: [templateId], references: [id], onDelete: SetNull)
```

### Unique Constraints

```prisma
// Prevent duplicate API keys
@@unique([keyHash])

// Prevent duplicate org members
@@unique([organizationId, userId])

// Prevent duplicate templates
@@unique([organizationId, slug, version])

// Idempotency
@@unique([idempotencyKey])
```

### Check Constraints

```sql
-- Add check constraints via raw SQL migrations

-- Ensure retry count doesn't exceed max retries
ALTER TABLE notifications
ADD CONSTRAINT chk_retry_count
CHECK (retry_count <= max_retries);

-- Ensure quiet hours are valid (0-23)
ALTER TABLE user_preferences
ADD CONSTRAINT chk_quiet_hours
CHECK (
  (quiet_hours_start IS NULL AND quiet_hours_end IS NULL)
  OR
  (quiet_hours_start >= 0 AND quiet_hours_start <= 23
   AND quiet_hours_end >= 0 AND quiet_hours_end <= 23)
);

-- Ensure sent_at is after created_at
ALTER TABLE notifications
ADD CONSTRAINT chk_sent_after_created
CHECK (sent_at IS NULL OR sent_at >= created_at);
```

---

## Migration Strategy

### Initial Migration

```bash
# Generate Prisma client
pnpm prisma generate

# Create migration
pnpm prisma migrate dev --name init

# Apply to production
pnpm prisma migrate deploy
```

### Future Migrations

```bash
# 1. Make schema changes in schema.prisma
# 2. Generate migration
pnpm prisma migrate dev --name add_push_channel

# 3. Review migration SQL
cat prisma/migrations/YYYYMMDDHHMMSS_add_push_channel/migration.sql

# 4. Test in staging
DATABASE_URL="staging_url" pnpm prisma migrate deploy

# 5. Deploy to production
DATABASE_URL="prod_url" pnpm prisma migrate deploy
```

### Zero-Downtime Migrations

#### Adding Columns (Safe)

```sql
-- Step 1: Add nullable column
ALTER TABLE notifications ADD COLUMN new_field VARCHAR(255);

-- Step 2: Backfill data (optional)
UPDATE notifications SET new_field = 'default_value' WHERE new_field IS NULL;

-- Step 3: Make NOT NULL (optional, after backfill)
ALTER TABLE notifications ALTER COLUMN new_field SET NOT NULL;
```

#### Removing Columns (Multi-Step)

```sql
-- Step 1: Deploy code that doesn't use column
-- Step 2: Wait 24 hours
-- Step 3: Drop column
ALTER TABLE notifications DROP COLUMN old_field;
```

#### Renaming Columns (Multi-Step)

```sql
-- Step 1: Add new column
ALTER TABLE notifications ADD COLUMN new_name VARCHAR(255);

-- Step 2: Backfill data
UPDATE notifications SET new_name = old_name;

-- Step 3: Deploy code using new column
-- Step 4: Drop old column
ALTER TABLE notifications DROP COLUMN old_name;
```

---

## Data Retention & Archival

### Soft Deletes

```typescript
// Delete organization (soft delete)
await prisma.organization.update({
  where: { id },
  data: { deletedAt: new Date() }
})

// Query only active organizations
await prisma.organization.findMany({
  where: { deletedAt: null }
})
```

### Hard Deletes (After 90 Days)

```sql
-- Cron job: Delete soft-deleted orgs after 90 days
DELETE FROM organizations
WHERE deleted_at < NOW() - INTERVAL '90 days';
```

### Notification Archival

```sql
-- Archive old notifications to S3
-- Run monthly via cron
WITH archived AS (
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '6 months'
  RETURNING *
)
-- Export to S3 via script, then delete
```

---

## Edge Cases Handled

### 1. Concurrent Outbox Processing

**Problem**: Multiple workers poll the same outbox record.

**Solution**: Use `SELECT FOR UPDATE SKIP LOCKED`.

```sql
-- Prisma raw query
SELECT * FROM outbox
WHERE status = 'PENDING'
  AND scheduled_at <= NOW()
ORDER BY created_at ASC
LIMIT 100
FOR UPDATE SKIP LOCKED;
```

### 2. Idempotency Key Collision

**Problem**: Same idempotency key used for different requests.

**Solution**: Include timestamp in key generation.

```typescript
const idempotencyKey = `${userId}:${type}:${hash(payload)}:${Date.now()}`
```

### 3. Template Version Conflicts

**Problem**: Active template updated while notifications use it.

**Solution**: Store template snapshot in notification payload.

```typescript
await prisma.notification.create({
  data: {
    templateId,
    payload: {
      ...userPayload,
      __template_snapshot: {
        subject: template.subject,
        body: template.body,
        version: template.version
      }
    }
  }
})
```

### 4. Notification Without Template

**Problem**: Generic notifications don't need templates.

**Solution**: Allow `templateId` to be null, store full content in payload.

```typescript
await prisma.notification.create({
  data: {
    templateId: null, // No template
    payload: {
      subject: "Custom subject",
      body: "Custom body",
      // ... other fields
    }
  }
})
```

### 5. User Deletes Account

**Problem**: Retain audit logs but delete personal data.

**Solution**: Anonymize user data, cascade delete notifications.

```typescript
await prisma.$transaction(async (tx) => {
  // Anonymize audit logs
  await tx.auditLog.updateMany({
    where: { userId },
    data: { userId: null }
  })

  // Cascade delete notifications (via FK)
  await tx.user.delete({ where: { id: userId } })
})
```

---

## Performance Optimization

### 1. Pagination

```typescript
// Cursor-based pagination (efficient)
const notifications = await prisma.notification.findMany({
  where: { userId },
  take: 20,
  skip: 1, // Skip cursor
  cursor: { id: lastNotificationId },
  orderBy: { createdAt: 'desc' }
})
```

### 2. Batch Inserts

```typescript
// Insert 1000 notifications in single transaction
await prisma.notification.createMany({
  data: notifications,
  skipDuplicates: true // Ignore duplicate idempotency keys
})
```

### 3. Connection Pooling

```typescript
// prisma/client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=10&pool_timeout=20'
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 4. Query Optimization

```typescript
// Include related data in single query
const notification = await prisma.notification.findUnique({
  where: { id },
  include: {
    user: { select: { id: true, email: true, name: true } },
    template: { select: { name: true, subject: true } },
    deliveryAttempts: {
      orderBy: { attemptedAt: 'desc' },
      take: 5
    }
  }
})
```

---

## Backup & Disaster Recovery

### Automated Backups (NeonDB)

```yaml
# NeonDB provides automated backups
# Point-in-time recovery (PITR) up to 30 days
# Configure via NeonDB dashboard
```

### Manual Backup

```bash
# Export database to SQL file
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup_$(date +%Y%m%d).sql s3://backups/notifications/
```

### Restore Procedure

```bash
# Restore from backup
psql $DATABASE_URL < backup_20250106.sql

# Run migrations to latest schema
pnpm prisma migrate deploy
```

---

## Testing Strategy

### Seed Data

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create test organization
  const org = await prisma.organization.create({
    data: {
      name: 'Test Organization',
      slug: 'test-org'
    }
  })

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User'
    }
  })

  // Create membership
  await prisma.organizationMember.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      role: 'OWNER'
    }
  })

  // Create templates
  await prisma.template.create({
    data: {
      organizationId: org.id,
      name: 'Welcome Email',
      slug: 'welcome-email',
      channel: 'EMAIL',
      type: 'WELCOME',
      subject: 'Welcome to {{organizationName}}',
      body: '<h1>Welcome {{userName}}!</h1>',
      variables: ['organizationName', 'userName'],
      createdBy: user.id
    }
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

```bash
# Run seed
pnpm prisma db seed
```

---

## Next Steps

1. Review schema with team
2. Set up NeonDB database
3. Run initial migration
4. Seed test data
5. Begin repository implementation

**Related Documents**:
- [02-ARCHITECTURE.md](./02-ARCHITECTURE.md) - System architecture
- [04-PROJECT-SETUP.md](./04-PROJECT-SETUP.md) - Project initialization
- [23-JEST-SETUP.md](./23-JEST-SETUP.md) - Testing setup
