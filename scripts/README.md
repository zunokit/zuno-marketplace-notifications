# Test Scripts

Comprehensive test scripts for the Zuno Notifications system.

## Prerequisites

1. Docker services running:
   ```bash
   pnpm docker:up
   ```

2. Database migrations applied:
   ```bash
   pnpm db:migrate
   ```

## Run All Tests

```bash
npx tsx scripts/test-all.ts
```

Runs all test scripts and shows a summary.

## Available Scripts

### System & Infrastructure

| Script | Description |
|--------|-------------|
| `check-status.ts` | Shows system status: notifications, outbox, orgs, templates |
| `test-rate-limit.ts` | Tests rate limiting per minute/hour/day |

### Email & Templates

| Script | Description |
|--------|-------------|
| `test-email-channel.ts` | Tests email sending via Mailpit/Resend |
| `test-react-email.ts` | Tests all 8 React Email templates |

### Notification Flow

| Script | Description |
|--------|-------------|
| `verify-notification-flow.ts` | Creates notification + outbox entry |
| `process-outbox.ts` | Processes pending outbox (simulates worker) |

### Integrations

| Script | Description |
|--------|-------------|
| `test-webhook.ts` | Tests webhook sending, signatures, retries |
| `test-price-alerts.ts` | Tests price alerts and floor price drops |

## Quick Commands

```bash
# Run all tests
npx tsx scripts/test-all.ts

# Check system status
npx tsx scripts/check-status.ts

# Test email templates
npx tsx scripts/test-react-email.ts

# Test full notification flow
npx tsx scripts/verify-notification-flow.ts
npx tsx scripts/process-outbox.ts

# Test specific features
npx tsx scripts/test-webhook.ts
npx tsx scripts/test-price-alerts.ts
npx tsx scripts/test-rate-limit.ts
```

## Typical Test Flow

1. **Check system status:**
   ```bash
   npx tsx scripts/check-status.ts
   ```

2. **Test email channel:**
   ```bash
   npx tsx scripts/test-email-channel.ts
   ```

3. **Test React Email templates:**
   ```bash
   npx tsx scripts/test-react-email.ts
   ```

4. **Test notification flow:**
   ```bash
   npx tsx scripts/verify-notification-flow.ts
   npx tsx scripts/process-outbox.ts
   ```

5. **Test integrations:**
   ```bash
   npx tsx scripts/test-webhook.ts
   npx tsx scripts/test-price-alerts.ts
   ```

6. **View emails in Mailpit:**
   Open http://localhost:8025

## Test Coverage

| Feature | Script | Status |
|---------|--------|--------|
| Database connection | `check-status.ts` | ✅ |
| Email via Mailpit | `test-email-channel.ts` | ✅ |
| Email via Resend | `test-email-channel.ts` | ✅ (prod) |
| React Email templates (8) | `test-react-email.ts` | ✅ |
| Notification creation | `verify-notification-flow.ts` | ✅ |
| Outbox pattern | `process-outbox.ts` | ✅ |
| Webhook sending | `test-webhook.ts` | ✅ |
| Webhook signatures | `test-webhook.ts` | ✅ |
| Webhook retries | `test-webhook.ts` | ✅ |
| Price alerts | `test-price-alerts.ts` | ✅ |
| Floor price drops | `test-price-alerts.ts` | ✅ |
| Rate limiting | `test-rate-limit.ts` | ✅ |
| WebSocket | - | ⏳ (requires WS server) |
