# Project Overview - Zuno Marketplace Notifications

**Document Version**: 1.0.0
**Last Updated**: 2025-01-06
**Status**: Production Architecture

---

## Executive Summary

The **Zuno Marketplace Notifications** service is an enterprise-grade, multi-channel notification platform designed to deliver real-time, reliable, and scalable notifications across the Zuno NFT Marketplace ecosystem.

### Mission Statement

Provide a **centralized, resilient, and observable** notification system that:
- Delivers notifications reliably (at-least-once semantics)
- Supports multiple channels (Email, WebSocket, Push, SMS)
- Scales horizontally with marketplace growth
- Maintains audit trails for compliance
- Enables self-service management for organizations

---

## Project Goals

### Primary Goals

1. **Reliability**
   - 99.9% successful delivery rate for critical notifications
   - At-least-once delivery guarantee
   - Automatic retry with exponential backoff
   - Dead-letter queue for failed messages

2. **Scalability**
   - Support 10,000+ notifications/minute at launch
   - Horizontal scaling capability
   - Queue-based architecture for backpressure handling
   - Per-channel and per-org rate limiting

3. **Multi-Channel Support**
   - **Email**: Transactional and marketing emails
   - **WebSocket**: Real-time in-app notifications
   - **Push**: Mobile push notifications (future)
   - **SMS**: Critical alerts (future)

4. **Developer Experience**
   - Clear API contracts
   - Comprehensive error messages
   - Easy local development setup
   - Template management UI

5. **Observability**
   - Structured logging with correlation IDs
   - Metrics for delivery rates, latency, errors
   - Audit trails for compliance
   - Health check endpoints

### Secondary Goals

6. **Self-Service Management**
   - Template CRUD via admin UI
   - User preference management
   - Subscription control
   - Delivery history tracking

7. **Security & Compliance**
   - RBAC with Better-Auth organizations
   - Encrypted sensitive data
   - Input validation and sanitization
   - GDPR-ready data handling

8. **Cost Efficiency**
   - Batch email sending
   - Intelligent rate limiting
   - Deduplication to reduce redundant sends
   - Provider failover for cost optimization

---

## Success Metrics

### KPIs (Key Performance Indicators)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Delivery Success Rate** | ≥ 99.9% | (Delivered / Sent) × 100 |
| **Delivery Latency (P99)** | ≤ 5 seconds | Time from trigger to delivery |
| **System Uptime** | ≥ 99.95% | Monthly uptime percentage |
| **Email Bounce Rate** | ≤ 2% | Bounces / Total emails sent |
| **User Unsubscribe Rate** | ≤ 5% | Unsubscribes / Active users |
| **API Error Rate** | ≤ 0.1% | 5xx errors / Total requests |
| **Template Render Time** | ≤ 100ms | Average template compilation |
| **Queue Processing Time** | ≤ 1 second | Outbox → Channel delivery |

### Business Metrics

| Metric | Target | Purpose |
|--------|--------|---------|
| **Notification Open Rate** | ≥ 30% | Email engagement |
| **Click-Through Rate** | ≥ 10% | Email effectiveness |
| **Real-Time Delivery Rate** | ≥ 95% | WebSocket reliability |
| **Cost per 1000 notifications** | ≤ $0.50 | Cost efficiency |

---

## Technology Stack

### Core Framework
- **Next.js 16** (App Router, React 19)
  - **Why**: Server Components, Server Actions, streaming, RSC
  - **Why Not Remix/Astro**: Better ecosystem, Vercel deployment

### UI Layer
- **shadcn/ui** + **Radix UI**
  - **Why**: Accessible, customizable, TypeScript-first
  - **Why Not Chakra/MUI**: More control, smaller bundle
- **Tailwind CSS v4**
  - **Why**: Utility-first, performance, customization
- **TanStack Table v8**
  - **Why**: Headless, flexible, TypeScript support
  - **Why Not AG-Grid**: Open-source, lighter

### Authentication & Authorization
- **Better-Auth 1.3+**
  - **Why**: Organization plugin, admin features, TypeScript
  - **Why Not NextAuth**: Better multi-tenancy, modern API
- **Organizations Plugin**
  - Multi-project isolation
  - Role-based access control (Owner, Admin, Editor, Viewer)

### Database & ORM
- **NeonDB** (Serverless PostgreSQL)
  - **Why**: Auto-scaling, branching, cost-effective
  - **Why Not Supabase**: Focus on PostgreSQL, better pricing
- **Prisma ORM**
  - **Why**: Type-safe, migrations, great DX
  - **Why Not Drizzle**: Maturity, ecosystem

### Data Fetching & State
- **TanStack Query v5**
  - **Why**: Caching, optimistic updates, SSR support
  - **Why Not SWR**: More features, better TypeScript

### Email
- **Resend** (Production)
  - **Why**: Modern API, React Email, good deliverability
  - **Why Not SendGrid**: Better DX, pricing transparency
- **Mailpit** (Local Development)
  - **Why**: Zero-config, web UI, SMTP testing
  - **Why Not Mailtrap**: Free, Docker-ready

### Real-Time
- **WebSocket** (Custom implementation)
  - **Why**: Full control, no third-party dependencies
  - **Why Not Pusher/Ably**: Cost, vendor lock-in
- **Redis** (Connection state)
  - **Why**: Fast pub/sub, connection tracking

### Testing
- **Jest** + **Testing Library**
  - **Why**: Industry standard, great ecosystem
  - **Why Not Vitest**: Maturity for Next.js
- **MSW** (Mock Service Worker)
  - **Why**: Mock network requests realistically

### Infrastructure
- **Docker Compose** (Local dev)
  - Services: PostgreSQL, Redis, Mailpit
- **GitHub Actions** (CI/CD)
  - Typecheck, lint, test, build, deploy
- **Vercel** (Deployment)
  - **Why**: Next.js optimization, preview deploys

### Observability
- **Winston** (Structured logging)
  - JSON format, levels, correlation IDs
- **Prometheus** (Metrics)
  - Custom metrics for delivery rates
- **Sentry** (Error tracking)
  - Production error monitoring

---

## System Architecture (High-Level)

```
┌─────────────────────────────────────────────────────────────┐
│                    External Event Sources                    │
│  (zuno-marketplace-api, contracts, indexer, user actions)   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               Notification Service (Next.js 16)              │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              API Layer (Server Actions)              │   │
│  │  • POST /api/notifications/send                      │   │
│  │  • POST /api/notifications/batch                     │   │
│  │  • POST /api/webhooks/inbound                        │   │
│  │  • GET  /api/preferences/:userId                     │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │           Business Logic Layer                       │   │
│  │  • Validation (Zod)                                  │   │
│  │  • Authorization (Better-Auth + RBAC)               │   │
│  │  • Deduplication                                     │   │
│  │  • Rate Limiting                                     │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │           Outbox Pattern (Transactional)            │   │
│  │  • Write to DB transaction                           │   │
│  │  • Idempotency key generation                       │   │
│  │  • Status: pending → processing → sent/failed      │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │          Polling Worker (Separate Process)           │   │
│  │  • Poll outbox table every 1s                        │   │
│  │  • Batch processing (100 records/batch)             │   │
│  │  • Distribute to channels                            │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │              Channel Layer (Abstraction)             │   │
│  │  ┌────────────┐ ┌───────────┐ ┌──────┐ ┌──────┐   │   │
│  │  │   Email    │ │ WebSocket │ │ Push │ │ SMS  │   │   │
│  │  └────────────┘ └───────────┘ └──────┘ └──────┘   │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │      External Providers              │
        │  • Resend (Email)                   │
        │  • Firebase (Push)                  │
        │  • Twilio (SMS)                     │
        └─────────────────────────────────────┘
```

---

## Non-Functional Requirements

### Performance
- **API Response Time**: P95 < 200ms, P99 < 500ms
- **Email Delivery Time**: P95 < 3s, P99 < 10s
- **WebSocket Latency**: P95 < 100ms, P99 < 300ms
- **Database Query Time**: P95 < 50ms
- **Template Render Time**: P95 < 50ms

### Scalability
- **Concurrent Users**: 10,000+ at launch
- **Notifications/Minute**: 10,000+ at launch, 100,000+ within 6 months
- **Database Size**: 10M+ records within first year
- **Horizontal Scaling**: Stateless design for multi-instance deployment

### Reliability
- **Uptime**: 99.95% (21.6 minutes downtime/month max)
- **Data Durability**: 99.999999999% (11 nines via PostgreSQL)
- **RTO (Recovery Time Objective)**: < 15 minutes
- **RPO (Recovery Point Objective)**: < 1 minute

### Security
- **Authentication**: All endpoints require authentication
- **Authorization**: Row-level security via organizations
- **Encryption**:
  - In-transit: TLS 1.3
  - At-rest: NeonDB encryption
- **Input Validation**: Zod schemas on all inputs
- **Rate Limiting**:
  - API: 100 req/min per IP
  - Email: 1000/hour per org
  - WebSocket: 10 msg/sec per connection

### Observability
- **Logging**: Structured JSON logs with correlation IDs
- **Metrics**:
  - Notification sent/delivered/failed counts
  - Delivery latency histograms
  - Queue depth gauges
- **Tracing**: Request ID propagation across services
- **Alerting**:
  - Delivery success rate < 99%
  - Queue depth > 1000
  - Error rate > 0.5%

### Compliance
- **GDPR**:
  - Right to be forgotten (delete user data)
  - Data export capability
  - Consent management
- **CAN-SPAM**:
  - Unsubscribe links in all marketing emails
  - Physical address in footer
  - Respect unsubscribe within 10 days
- **Audit Trails**: All actions logged with user ID, timestamp, action

---

## System Constraints

### Technical Constraints
1. **Database**: PostgreSQL 14+ required for JSONB features
2. **Node.js**: Version 18+ for native fetch and AbortSignal
3. **Redis**: Required for rate limiting and WebSocket state
4. **External Dependencies**:
   - Resend API key (email)
   - NeonDB connection string
   - Better-Auth secret

### Business Constraints
1. **Email Provider Limits**:
   - Resend: 100 emails/sec per account
   - Bounce rate must stay < 5% to maintain reputation
2. **Cost Budget**:
   - Email: $0.001 per send (Resend pricing)
   - Database: $19/month base + compute (Neon)
   - Infrastructure: Free tier (Vercel)
3. **Compliance**:
   - No personal data in logs
   - Must support unsubscribe
   - Must allow data deletion

### Operational Constraints
1. **Deployment**: Must support zero-downtime deployments
2. **Monitoring**: Must have health checks for Kubernetes/load balancers
3. **Backup**: Daily database backups with 30-day retention
4. **Disaster Recovery**: Automated failover to replica region

---

## Out of Scope (v1.0)

The following features are explicitly **NOT** included in v1.0:

❌ **Push Notifications** (iOS/Android) - Planned for v1.1
❌ **SMS Notifications** - Planned for v1.2
❌ **Multi-Language Support** (i18n) - Planned for v1.3
❌ **Advanced Template Editor** (WYSIWYG) - Planned for v2.0
❌ **A/B Testing** - Planned for v2.0
❌ **Analytics Dashboard** - Planned for v2.0
❌ **Notification Scheduling** (future delivery) - Planned for v1.4
❌ **White-Label Customization** - Enterprise feature

---

## Stakeholders

| Role | Responsibility | Contact |
|------|---------------|---------|
| **Product Owner** | Requirements, prioritization | - |
| **Tech Lead** | Architecture, code reviews | - |
| **Backend Engineers** | API, workers, database | - |
| **Frontend Engineers** | Admin UI, integration | - |
| **DevOps** | CI/CD, infrastructure | - |
| **QA** | Testing, quality assurance | - |

---

## Project Timeline

### Phase 1: Foundation (Weeks 1-2)
- Project setup, database schema, authentication
- **Deliverable**: Basic API endpoints, local dev environment

### Phase 2: Core Features (Weeks 3-4)
- Email channel, outbox pattern, retry mechanism
- **Deliverable**: Working email notifications

### Phase 3: Advanced (Weeks 5-6)
- WebSocket channel, admin UI, observability
- **Deliverable**: Real-time notifications, management UI

### Phase 4: Production (Weeks 7-8)
- CI/CD, security hardening, documentation
- **Deliverable**: Production deployment

**Total Duration**: 8 weeks

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Email deliverability issues** | Medium | High | Use Resend, warm up IP, monitor bounce rate |
| **Database scaling bottleneck** | Low | High | NeonDB auto-scaling, read replicas |
| **Third-party API downtime** | Medium | Medium | Circuit breakers, retry logic, provider failover |
| **WebSocket connection limits** | Low | Medium | Connection pooling, horizontal scaling |
| **Cost overruns** | Medium | Medium | Rate limiting, deduplication, cost alerts |
| **Security breach** | Low | High | RBAC, input validation, audit logs, security reviews |

---

## Next Steps

1. Review this document with stakeholders
2. Confirm technology stack choices
3. Set up project repository
4. Begin Phase 1 implementation
5. Schedule weekly check-ins

**Approved By**: [Pending]
**Date**: [Pending]

---

**Related Documents**:
- [02-ARCHITECTURE.md](./02-ARCHITECTURE.md) - Detailed architecture
- [03-DATABASE-SCHEMA.md](./03-DATABASE-SCHEMA.md) - Database design
- [31-PHASE-1-FOUNDATION.md](./31-PHASE-1-FOUNDATION.md) - Implementation guide
