# Test Scripts

Scripts for testing and verifying the notification system.

## Prerequisites

1. Docker services running:
   ```bash
   pnpm docker:up
   ```

2. Database migrations applied:
   ```bash
   pnpm db:migrate
   ```

## Available Scripts

### Check System Status
```bash
npx tsx scripts/check-status.ts
```
Shows current state of the system: notifications, outbox, organizations, templates.

### Test Email Channel
```bash
npx tsx scripts/test-email-channel.ts
```
Tests the email channel directly by sending test emails. View emails at http://localhost:8025

### Verify Notification Flow
```bash
npx tsx scripts/verify-notification-flow.ts
```
Creates a test notification and verifies the outbox entry is created.

### Process Outbox
```bash
npx tsx scripts/process-outbox.ts
```
Manually processes pending outbox entries (simulates the background worker).

## Typical Test Flow

1. Check current status:
   ```bash
   npx tsx scripts/check-status.ts
   ```

2. Test email channel works:
   ```bash
   npx tsx scripts/test-email-channel.ts
   ```

3. Create a test notification:
   ```bash
   npx tsx scripts/verify-notification-flow.ts
   ```

4. Process the notification:
   ```bash
   npx tsx scripts/process-outbox.ts
   ```

5. View emails in Mailpit:
   Open http://localhost:8025
