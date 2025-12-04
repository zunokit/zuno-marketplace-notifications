# Zuno Marketplace Notifications - Development Roadmap

## Muc Luc

1. [Tong Quan Hien Tai](#1-tong-quan-hien-tai)
2. [Kien Truc Muc Tieu](#2-kien-truc-muc-tieu)
3. [Phase 1: Foundation & Integration](#3-phase-1-foundation--integration)
4. [Phase 2: Core Features](#4-phase-2-core-features)
5. [Phase 3: Advanced Features](#5-phase-3-advanced-features)
6. [Phase 4: Scale & Optimize](#6-phase-4-scale--optimize)
7. [Timeline Tong The](#7-timeline-tong-the)
8. [Tech Stack Decisions](#8-tech-stack-decisions)

---

## 1. Tong Quan Hien Tai

### 1.1 Trang Thai Hien Tai

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        HIEN TAI (Current State)                          │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────┐
  │  ZUNO-MARKETPLACE-API (Go)                                          │
  │  ✅ auth-service      - SIWE authentication, JWT                    │
  │  ✅ user-service      - User profiles, preferences                  │
  │  ✅ wallet-service    - Wallet linking                              │
  │  ✅ collection-service - NFT collections                            │
  │  ✅ media-service     - Media handling                              │
  │  ✅ graphql-gateway   - BFF API                                     │
  │  ✅ Infrastructure    - PostgreSQL, Redis, RabbitMQ                 │
  └─────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────┐
  │  ZUNO-MARKETPLACE-NOTIFICATIONS (Next.js) - STANDALONE              │
  │  ✅ Clean Architecture (Core, Infrastructure, Presentation)         │
  │  ✅ Outbox Pattern    - Reliable delivery                           │
  │  ✅ Email Channel     - Resend/Mailpit providers                    │
  │  ✅ WebSocket Channel - Real-time notifications                     │
  │  ✅ Template System   - React Email + Handlebars                    │
  │  ✅ Rate Limiting     - Redis-based                                 │
  │  ✅ Price Alerts      - NFT price monitoring                        │
  │  ✅ Watchlist         - Item tracking                               │
  │  ✅ Drop Service      - Whitelist & minting                         │
  │  ⚠️ CHUA TICH HOP    - Chay doc lap                                │
  └─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Van De Can Giai Quyet

| # | Van De | Muc Do | Giai Phap |
|---|--------|--------|-----------|
| 1 | 2 projects chay doc lap | Critical | Tich hop qua RabbitMQ |
| 2 | Khong co event flow | Critical | Implement event publisher/consumer |
| 3 | Duplicate user data | High | Sync user tu Go services |
| 4 | Khong co real-time | Medium | WebSocket integration |
| 5 | Khong co monitoring | Medium | Add observability |

---

## 2. Kien Truc Muc Tieu

### 2.1 Target Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      TARGET ARCHITECTURE                                 │
└─────────────────────────────────────────────────────────────────────────┘

                            ┌─────────────┐
                            │   Frontend  │
                            │  (Next.js)  │
                            └──────┬──────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
             ┌───────────┐  ┌───────────┐  ┌───────────┐
             │  GraphQL  │  │ WebSocket │  │   REST    │
             │  Gateway  │  │  Gateway  │  │   API     │
             │  :8081    │  │  :8082    │  │  :3000    │
             └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
                   │              │              │
                   │              │              │
    ┌──────────────┴──────────────┴──────────────┴──────────────┐
    │                                                            │
    │                      RabbitMQ                              │
    │                   (Event Bus)                              │
    │                                                            │
    │  Exchanges:                                                │
    │  ├── zuno.marketplace (marketplace events)                 │
    │  ├── zuno.notifications (notification events)              │
    │  └── zuno.analytics (tracking events)                      │
    │                                                            │
    └──────────────────────────┬─────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
  │    Go       │       │Notification │       │  Analytics  │
  │  Services   │       │  Service    │       │  Service    │
  │             │       │             │       │  (Future)   │
  │ - auth      │       │ - email     │       │             │
  │ - user      │       │ - websocket │       │             │
  │ - wallet    │       │ - push      │       │             │
  │ - collection│       │ - sms       │       │             │
  └──────┬──────┘       └──────┬──────┘       └─────────────┘
         │                     │
         ▼                     ▼
  ┌─────────────┐       ┌─────────────┐
  │ PostgreSQL  │       │ PostgreSQL  │
  │ (marketplace│       │(notifications│
  │    data)    │       │    data)    │
  └─────────────┘       └─────────────┘
         │                     │
         └──────────┬──────────┘
                    ▼
             ┌─────────────┐
             │    Redis    │
             │  (shared)   │
             └─────────────┘
```

### 2.2 Event Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EVENT FLOW DIAGRAM                               │
└─────────────────────────────────────────────────────────────────────────┘

  USER ACTION                GO SERVICE              RABBITMQ
       │                          │                      │
       │  1. Win Auction          │                      │
       ├─────────────────────────▶│                      │
       │                          │                      │
       │                          │  2. Publish Event    │
       │                          ├─────────────────────▶│
       │                          │  "auction.won"       │
       │                          │  {userId, nftId,     │
       │                          │   bidAmount, ...}    │
       │                          │                      │
       │                          │                      │
       │                          │                      │
       │                     NOTIFICATION SERVICE        │
       │                          │                      │
       │                          │  3. Consume Event    │
       │                          │◀─────────────────────┤
       │                          │                      │
       │                          │                      │
       │  ┌───────────────────────┴───────────────────┐  │
       │  │  4. Process Notification:                 │  │
       │  │     a. Check user preferences             │  │
       │  │     b. Check rate limits                  │  │
       │  │     c. Render template                    │  │
       │  │     d. Create outbox entry                │  │
       │  │     e. Send via channel (Email/WS)        │  │
       │  │     f. Track delivery                     │  │
       │  └───────────────────────────────────────────┘  │
       │                          │                      │
       │  5. Receive Email        │                      │
       │◀─────────────────────────┤                      │
       │                          │                      │
       │  6. Receive WebSocket    │                      │
       │◀─────────────────────────┤                      │
       │     (real-time)          │                      │
```

---

## 3. Phase 1: Foundation & Integration

### 3.1 Overview

| Thoi gian | 2 tuan |
|-----------|--------|
| Muc tieu | Ket noi 2 systems qua RabbitMQ |
| Output | Basic event flow hoat dong |

### 3.2 Tasks

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: FOUNDATION & INTEGRATION (2 Weeks)                            │
└─────────────────────────────────────────────────────────────────────────┘

  Week 1: Setup & Basic Integration
  ─────────────────────────────────
  
  ☐ 1.1 Docker Compose Integration
     ├── Them notification-service vao docker-compose
     ├── Them mailpit cho email testing
     ├── Chia se RabbitMQ giua 2 projects
     └── Test connectivity

  ☐ 1.2 Event Schema Definition
     ├── Tao shared/events package trong Go
     ├── Dinh nghia NotificationEvent struct
     ├── Dinh nghia event types (50+ types)
     └── Document event contracts

  ☐ 1.3 Go Event Publisher
     ├── Tao shared/messaging/publisher.go
     ├── Implement NotificationPublisher
     ├── Add helper methods (PublishWelcome, PublishAuctionWon, ...)
     └── Unit tests

  Week 2: Consumer & First Integration
  ─────────────────────────────────────
  
  ☐ 1.4 Notification Service Consumer
     ├── Tao src/infrastructure/messaging/rabbitmq-consumer.ts
     ├── Implement event consumption
     ├── Map events to notification types
     └── Error handling & dead letter

  ☐ 1.5 First Integration: Welcome Email
     ├── auth-service publish "user.registered"
     ├── notification-service consume & send email
     ├── End-to-end test
     └── Verify in Mailpit

  ☐ 1.6 User Sync
     ├── Sync user data khi nhan event
     ├── Upsert user trong notification DB
     └── Handle user updates
```

### 3.3 Deliverables

- [ ] Docker Compose chay ca 2 projects
- [ ] Event publisher trong Go services
- [ ] Event consumer trong Notification service
- [ ] Welcome email gui duoc khi user dang ky
- [ ] Documentation cho event contracts

---

## 4. Phase 2: Core Features

### 4.1 Overview

| Thoi gian | 3 tuan |
|-----------|--------|
| Muc tieu | Implement cac notification chinh cho marketplace |
| Output | Full notification flow cho trading activities |

### 4.2 Tasks

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: CORE FEATURES (3 Weeks)                                        │
└─────────────────────────────────────────────────────────────────────────┘

  Week 3: Auction & Bidding Notifications
  ────────────────────────────────────────
  
  ☐ 2.1 Auction Events (Go side)
     ├── collection-service: publish auction.started
     ├── collection-service: publish auction.ending_soon
     ├── collection-service: publish auction.ended
     ├── collection-service: publish auction.won
     └── collection-service: publish auction.outbid

  ☐ 2.2 Auction Notifications (Notification side)
     ├── Consume auction events
     ├── Email templates cho moi event
     ├── WebSocket real-time cho outbid
     └── Scheduled notification cho ending_soon

  ☐ 2.3 Bidding Events
     ├── bid.placed -> notify seller
     ├── bid.accepted -> notify bidder
     ├── bid.rejected -> notify bidder
     └── offer.received/accepted/rejected

  Week 4: Listing & Trading
  ─────────────────────────
  
  ☐ 2.4 Listing Notifications
     ├── listing.created -> notify followers
     ├── listing.sold -> notify seller & buyer
     ├── listing.price_changed -> notify watchers
     └── listing.expired -> notify seller

  ☐ 2.5 NFT Transfer Events
     ├── nft.minted -> notify creator
     ├── nft.transferred -> notify parties
     └── nft.burned -> notify owner

  ☐ 2.6 Collection Events
     ├── collection.created -> notify followers
     ├── collection.verified -> notify owner
     └── collection.floor_price_changed

  Week 5: User Preferences & Multi-channel
  ─────────────────────────────────────────
  
  ☐ 2.7 User Preferences
     ├── API: GET/PUT /api/preferences/{userId}
     ├── GraphQL integration
     ├── Quiet hours support
     └── Per-channel, per-type settings

  ☐ 2.8 Multi-channel Delivery
     ├── Email (da co)
     ├── WebSocket real-time
     ├── Channel routing logic
     └── Fallback strategy

  ☐ 2.9 Template Management
     ├── API: CRUD templates
     ├── Version history
     ├── Preview functionality
     └── Variable extraction
```

### 4.3 Event Matrix

| Event | Email | WebSocket | Priority |
|-------|-------|-----------|----------|
| auction.started | ✅ | ✅ | NORMAL |
| auction.ending_soon | ✅ | ✅ | HIGH |
| auction.won | ✅ | ✅ | HIGH |
| auction.outbid | ✅ | ✅ | URGENT |
| bid.placed | ✅ | ✅ | HIGH |
| listing.sold | ✅ | ✅ | HIGH |
| nft.minted | ✅ | ❌ | NORMAL |
| floor_price_drop | ❌ | ✅ | NORMAL |

---

## 5. Phase 3: Advanced Features

### 5.1 Overview

| Thoi gian | 4 tuan |
|-----------|--------|
| Muc tieu | NFT-specific features, analytics |
| Output | Complete notification platform |

### 5.2 Tasks

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: ADVANCED FEATURES (4 Weeks)                                    │
└─────────────────────────────────────────────────────────────────────────┘

  Week 6-7: NFT-Specific Features
  ────────────────────────────────
  
  ☐ 3.1 Price Alerts System
     ├── API: Create price alert
     ├── Background job: Check prices
     ├── Trigger notifications khi dat target
     ├── Integration voi price oracle
     └── Floor price monitoring

  ☐ 3.2 Watchlist Integration
     ├── Sync watchlist tu user-service
     ├── Notify on watched item activity
     ├── Following user notifications
     └── Collection activity alerts

  ☐ 3.3 Drop & Whitelist
     ├── Drop announcement flow
     ├── Whitelist approval notifications
     ├── Drop reminder (5min before)
     ├── Mint success/failure
     └── Integration voi minting service

  ☐ 3.4 Rarity & Discovery
     ├── rare_nft_listed notifications
     ├── trait_match_alert
     ├── similar_nft_sold
     └── ML-based recommendations (future)

  Week 8-9: Analytics & Reporting
  ────────────────────────────────
  
  ☐ 3.5 Delivery Analytics
     ├── Track: sent, delivered, opened, clicked
     ├── Daily/weekly aggregations
     ├── Per-channel metrics
     └── Dashboard API

  ☐ 3.6 User Digests
     ├── Weekly portfolio stats
     ├── Monthly summary
     ├── Digest scheduling
     └── Personalized content

  ☐ 3.7 Webhook System
     ├── Webhook subscription API
     ├── Event filtering
     ├── Signature verification
     ├── Retry with backoff
     └── Webhook logs
```

### 5.3 Price Alert Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      PRICE ALERT INTEGRATION                             │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
  │   Frontend   │         │ Notification │         │    Price     │
  │              │         │   Service    │         │   Oracle     │
  └──────┬───────┘         └──────┬───────┘         └──────┬───────┘
         │                        │                        │
         │ 1. Create Alert        │                        │
         │ POST /price-alerts     │                        │
         ├───────────────────────▶│                        │
         │                        │                        │
         │                        │ 2. Store Alert         │
         │                        ├───────────────────────▶│
         │                        │    (subscribe)         │
         │                        │                        │
         │                        │                        │
         │                        │ 3. Price Update        │
         │                        │◀───────────────────────┤
         │                        │ (webhook/polling)      │
         │                        │                        │
         │                        │ 4. Check Alerts        │
         │                        ├────┐                   │
         │                        │    │ price <= target?  │
         │                        │◀───┘                   │
         │                        │                        │
         │ 5. Notification        │                        │
         │◀───────────────────────┤                        │
         │ (Email + WebSocket)    │                        │
```

---

## 6. Phase 4: Scale & Optimize

### 6.1 Overview

| Thoi gian | 3 tuan |
|-----------|--------|
| Muc tieu | Production-ready, scalable |
| Output | Enterprise-grade notification system |

### 6.2 Tasks

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 4: SCALE & OPTIMIZE (3 Weeks)                                     │
└─────────────────────────────────────────────────────────────────────────┘

  Week 10: Performance & Reliability
  ───────────────────────────────────
  
  ☐ 4.1 Worker Optimization
     ├── Separate worker processes
     ├── Horizontal scaling
     ├── Batch processing
     └── Connection pooling

  ☐ 4.2 Database Optimization
     ├── Index optimization
     ├── Partitioning (by date)
     ├── Archive old data
     └── Read replicas

  ☐ 4.3 Caching Strategy
     ├── Template caching
     ├── User preference caching
     ├── Rate limit caching
     └── Redis cluster

  Week 11: Monitoring & Observability
  ────────────────────────────────────
  
  ☐ 4.4 Logging & Tracing
     ├── Structured logging
     ├── Correlation IDs
     ├── Distributed tracing (Jaeger)
     └── Log aggregation (ELK)

  ☐ 4.5 Metrics & Alerting
     ├── Prometheus metrics
     ├── Grafana dashboards
     ├── Alert rules
     └── PagerDuty integration

  ☐ 4.6 Health Checks
     ├── Liveness probes
     ├── Readiness probes
     ├── Dependency checks
     └── Circuit breakers

  Week 12: Security & Compliance
  ───────────────────────────────
  
  ☐ 4.7 Security Hardening
     ├── API key rotation
     ├── Encryption at rest
     ├── Audit logging
     └── Penetration testing

  ☐ 4.8 Compliance
     ├── GDPR data deletion
     ├── Unsubscribe handling
     ├── Data retention policies
     └── Export functionality

  ☐ 4.9 Documentation
     ├── API documentation (OpenAPI)
     ├── Integration guides
     ├── Runbooks
     └── Architecture diagrams
```

### 6.3 Scaling Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SCALED ARCHITECTURE                                 │
└─────────────────────────────────────────────────────────────────────────┘

                         ┌─────────────────┐
                         │  Load Balancer  │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
       ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
       │ API Node 1  │     │ API Node 2  │     │ API Node 3  │
       └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
                         ┌────────▼────────┐
                         │    RabbitMQ     │
                         │    Cluster      │
                         └────────┬────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
  ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
  │  Outbox     │          │  Outbox     │          │  Outbox     │
  │  Worker 1   │          │  Worker 2   │          │  Worker 3   │
  └─────────────┘          └─────────────┘          └─────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
             ┌───────────┐ ┌───────────┐ ┌───────────┐
             │  Resend   │ │ WebSocket │ │   Push    │
             │  (Email)  │ │  Server   │ │  (FCM)    │
             └───────────┘ └───────────┘ └───────────┘
```

---

## 7. Timeline Tong The

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT TIMELINE                             │
└─────────────────────────────────────────────────────────────────────────┘

  2024
  ────
  
  Month 1 (Weeks 1-4)
  ├── Week 1-2: Phase 1 - Foundation & Integration
  │   ├── Docker Compose setup
  │   ├── Event schema & publisher
  │   └── Basic consumer
  │
  └── Week 3-4: Phase 2 Start - Auction & Bidding
      ├── Auction events
      ├── Bidding notifications
      └── Basic templates

  Month 2 (Weeks 5-8)
  ├── Week 5: Phase 2 Continue - Listing & Trading
  │   ├── Listing notifications
  │   └── NFT transfer events
  │
  ├── Week 6: Phase 2 Complete - User Preferences
  │   ├── Preferences API
  │   └── Multi-channel delivery
  │
  └── Week 7-8: Phase 3 Start - NFT Features
      ├── Price alerts
      ├── Watchlist
      └── Drops & whitelist

  Month 3 (Weeks 9-12)
  ├── Week 9: Phase 3 Continue - Analytics
  │   ├── Delivery tracking
  │   └── User digests
  │
  └── Week 10-12: Phase 4 - Scale & Optimize
      ├── Performance tuning
      ├── Monitoring setup
      └── Security & compliance

  ════════════════════════════════════════════════════════════════════════
                              MILESTONES
  ════════════════════════════════════════════════════════════════════════
  
  ✓ M1 (Week 2):  Basic integration working
  ✓ M2 (Week 5):  Core trading notifications complete
  ✓ M3 (Week 8):  NFT-specific features complete
  ✓ M4 (Week 12): Production-ready release
```

---

## 8. Tech Stack Decisions

### 8.1 Communication Protocol

| Option | Chon | Ly Do |
|--------|------|-------|
| RabbitMQ Events | ✅ | Loose coupling, async, reliable |
| HTTP API | ✅ | Admin operations, debugging |
| gRPC | ❌ | Over-engineering cho use case nay |

### 8.2 Database Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATABASE STRATEGY                                   │
└─────────────────────────────────────────────────────────────────────────┘

  Option 1: Separate Databases (CHON)
  ───────────────────────────────────
  
  ┌──────────────────┐         ┌──────────────────┐
  │  zuno_marketplace│         │zuno_notifications│
  │  (Go services)   │         │(Notification svc)│
  │                  │         │                  │
  │  - users         │ ──sync─▶│  - users (copy)  │
  │  - collections   │         │  - notifications │
  │  - nfts          │         │  - templates     │
  │  - auctions      │         │  - outbox        │
  └──────────────────┘         └──────────────────┘
  
  Uu diem:
  ✅ Isolation - failure khong anh huong nhau
  ✅ Scale doc lap
  ✅ Clear ownership
  
  Nhuoc diem:
  ⚠️ Data sync complexity
  ⚠️ Eventual consistency


  Option 2: Shared Database (KHONG CHON)
  ──────────────────────────────────────
  
  ┌────────────────────────────────────┐
  │          zuno_marketplace          │
  │                                    │
  │  - users                           │
  │  - collections                     │
  │  - notifications (shared)          │
  │  - templates (shared)              │
  └────────────────────────────────────┘
  
  Uu diem:
  ✅ No sync needed
  ✅ Simpler architecture
  
  Nhuoc diem:
  ⚠️ Tight coupling
  ⚠️ Single point of failure
  ⚠️ Hard to scale independently
```

### 8.3 Real-time Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      REAL-TIME ARCHITECTURE                              │
└─────────────────────────────────────────────────────────────────────────┘

  Option A: Notification Service owns WebSocket (CHON)
  ────────────────────────────────────────────────────
  
  Frontend ◀───WebSocket───▶ Notification Service
                                     │
                                     ▼
                              Send real-time
                              notifications
  
  Uu diem:
  ✅ All notification logic in one place
  ✅ Easier to manage
  

  Option B: Separate WebSocket Gateway
  ─────────────────────────────────────
  
  Frontend ◀───WebSocket───▶ WS Gateway ◀───RabbitMQ───▶ Services
  
  Uu diem:
  ✅ Can handle more connections
  ✅ Separation of concerns
  
  Nhuoc diem:
  ⚠️ More infrastructure
  ⚠️ Additional latency
```

### 8.4 Future Considerations

| Feature | Priority | Phase |
|---------|----------|-------|
| Push Notifications (FCM/APNs) | Medium | Phase 3 |
| SMS (Twilio) | Low | Phase 4 |
| In-app Notifications | Medium | Phase 3 |
| Slack/Discord Integration | Low | Phase 4 |
| AI-powered Personalization | Low | Future |

---

## 9. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Event schema changes | High | Medium | Versioned events, backward compatibility |
| Message queue failure | High | Low | RabbitMQ clustering, dead letter queue |
| Email provider downtime | Medium | Low | Multiple providers, fallback |
| Data sync issues | Medium | Medium | Idempotent operations, reconciliation jobs |
| Scale bottlenecks | High | Medium | Load testing, horizontal scaling |

---

## 10. Success Metrics

### 10.1 Technical Metrics

| Metric | Target |
|--------|--------|
| Email delivery rate | > 99% |
| WebSocket latency | < 100ms |
| API response time (p95) | < 200ms |
| Worker throughput | > 1000 msgs/sec |
| System uptime | > 99.9% |

### 10.2 Business Metrics

| Metric | Target |
|--------|--------|
| User engagement (open rate) | > 30% |
| Notification relevance | > 80% useful |
| Unsubscribe rate | < 1% |
| User satisfaction | > 4/5 stars |

---

## Ket Luan

Roadmap nay chia thanh 4 phases ro rang:

1. **Phase 1 (2 weeks)**: Ket noi 2 systems - foundation
2. **Phase 2 (3 weeks)**: Core marketplace notifications
3. **Phase 3 (4 weeks)**: NFT-specific features
4. **Phase 4 (3 weeks)**: Production-ready

Tong thoi gian: **~12 weeks (3 thang)**

Bat dau voi Phase 1 - tich hop RabbitMQ giua Go services va Notification service.
