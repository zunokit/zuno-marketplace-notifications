# Zuno Marketplace Notifications - System Architecture

## Tong Quan He Thong

**Zuno Marketplace Notifications** la mot dich vu thong bao da kenh (multi-channel) cap doanh nghiep cho NFT Marketplace. He thong cung cap kha nang gui thong bao tin cay, co the mo rong qua cac kenh: Email, WebSocket, Push (tuong lai), va SMS (tuong lai).

### Cong Nghe Su Dung

| Thanh phan | Cong nghe |
|------------|-----------|
| Framework | Next.js 16 (App Router) |
| Ngon ngu | TypeScript 5 |
| Database | PostgreSQL (NeonDB) |
| ORM | Prisma |
| Cache | Redis |
| Authentication | Better Auth |
| UI Components | shadcn/ui |
| State Management | TanStack Query |
| Email Provider | Resend (Production), Mailpit (Development) |

---

## Kien Truc Clean Architecture

He thong duoc xay dung theo mo hinh **Clean Architecture** voi 3 lop chinh:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│                      (src/app)                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Next.js App Router                                  │    │
│  │  - API Routes (/api/notifications, /api/templates)   │    │
│  │  - React Pages (Dashboard, Auth)                     │    │
│  │  - shadcn/ui Components                              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│                      (src/core)                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Use Cases:                                          │    │
│  │  - SendNotificationUseCase                           │    │
│  │                                                      │    │
│  │  Domain Services:                                    │    │
│  │  - PriceAlertService                                 │    │
│  │  - WatchlistService                                  │    │
│  │  - DropNotificationService                           │    │
│  │  - RateLimitService                                  │    │
│  │  - IdempotencyService                                │    │
│  │                                                      │    │
│  │  Domain Entities:                                    │    │
│  │  - Notification, Template, User, Organization        │    │
│  │                                                      │    │
│  │  Value Objects:                                      │    │
│  │  - Email, NotificationId                             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                       │
│                   (src/infrastructure)                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Repositories:                                       │    │
│  │  - NotificationRepository                            │    │
│  │  - TemplateRepository                                │    │
│  │  - OutboxRepository                                  │    │
│  │                                                      │    │
│  │  Channels:                                           │    │
│  │  - EmailChannel (Resend, Mailpit)                    │    │
│  │  - WebSocketChannel                                  │    │
│  │                                                      │    │
│  │  External Services:                                  │    │
│  │  - Redis Cache                                       │    │
│  │  - Webhook Service                                   │    │
│  │  - Template Service (Handlebars)                     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## He Thong Notification

### Vong Doi Notification

```
                    ┌──────────────┐
                    │   PENDING    │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  PROCESSING  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            │            ▼
       ┌──────────┐        │     ┌──────────┐
       │   SENT   │        │     │  FAILED  │
       └────┬─────┘        │     └────┬─────┘
            │              │          │
            ▼              │          ▼ (retry <= 5)
       ┌──────────┐        │     ┌────────────────┐
       │ DELIVERED│        │     │   DEAD_LETTER  │
       └──────────┘        │     └────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       ┌──────────┐              ┌──────────┐
       │ CANCELLED│              │  EXPIRED │
       └──────────┘              └──────────┘
```

### Cac Loai Notification (50+ loai)

#### Marketplace Events
| Type | Mo ta |
|------|-------|
| `AUCTION_STARTED` | Phien dau gia bat dau |
| `AUCTION_ENDING_SOON` | Phien dau gia sap ket thuc |
| `AUCTION_WON` | Thang dau gia |
| `AUCTION_OUTBID` | Bi vuot gia |
| `BID_PLACED` | Co nguoi dat gia |
| `OFFER_RECEIVED` | Nhan de nghi mua |
| `LISTING_CREATED` | NFT duoc dang ban |
| `LISTING_SOLD` | NFT da ban |

#### Price Alerts
| Type | Mo ta |
|------|-------|
| `FLOOR_PRICE_DROP` | Gia san giam |
| `PRICE_DROP_ALERT` | Canh bao gia giam |
| `TARGET_PRICE_REACHED` | Dat gia muc tieu |

#### Drops & Minting
| Type | Mo ta |
|------|-------|
| `DROP_ANNOUNCED` | Thong bao drop moi |
| `DROP_STARTING_SOON` | Drop sap bat dau |
| `DROP_LIVE` | Drop dang dien ra |
| `MINT_SUCCESS` | Mint thanh cong |
| `WHITELIST_APPROVED` | Duoc duyet whitelist |

#### Social Events
| Type | Mo ta |
|------|-------|
| `USER_FOLLOWED` | Co nguoi theo doi |
| `FOLLOWING_LISTED_NFT` | Nguoi theo doi dang ban NFT |
| `COLLECTION_FOLLOWED` | Collection duoc theo doi |

---

## Outbox Pattern - Dam Bao Tin Cay

He thong su dung **Outbox Pattern** de dam bao moi notification deu duoc gui it nhat mot lan (at-least-once delivery).

### Luong Hoat Dong

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OUTBOX PATTERN FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

  Client Request                Transaction (Atomic)
       │                              │
       ▼                              ▼
┌──────────────┐            ┌─────────────────────────────────┐
│  API Route   │───────────▶│  1. Create Notification         │
│  /send       │            │  2. Create Outbox Entry         │
└──────────────┘            │     (TRONG 1 TRANSACTION)       │
                            └─────────────────────────────────┘
                                          │
                                          ▼
                            ┌─────────────────────────────────┐
                            │        OUTBOX TABLE             │
                            │  ┌───────────────────────────┐  │
                            │  │ id: uuid                  │  │
                            │  │ notification_id: uuid     │  │
                            │  │ channel: EMAIL            │  │
                            │  │ status: PENDING           │  │
                            │  │ payload: {...}            │  │
                            │  │ scheduled_at: timestamp   │  │
                            │  └───────────────────────────┘  │
                            └─────────────────────────────────┘
                                          │
              ┌───────────────────────────┴───────────────────────────┐
              │                   OUTBOX WORKER                        │
              │              (Background Process)                      │
              │                                                        │
              │  1. Poll outbox table (every 5 seconds)               │
              │  2. Lock entry (distributed locking)                   │
              │  3. Route to channel (Email/WebSocket)                │
              │  4. Send notification                                  │
              │  5. Mark as PROCESSED or retry with backoff           │
              └───────────────────────────────────────────────────────┘
                                          │
                                          ▼
                            ┌─────────────────────────────────┐
                            │     SUCCESS: PROCESSED          │
                            │     FAILURE: Retry (2,4,8,16,32 │
                            │              minutes backoff)   │
                            │     MAX RETRIES: DEAD_LETTER    │
                            └─────────────────────────────────┘
```

### Code Implementation

```typescript
// OutboxRepository.createWithNotification()
async createWithNotification(notificationData, outboxData) {
  return await prisma.$transaction(async (tx) => {
    // Buoc 1: Tao notification
    const notification = await tx.notification.create({
      data: notificationData,
    })

    // Buoc 2: Tao outbox entry (trong cung transaction)
    const outbox = await tx.outbox.create({
      data: {
        channel: outboxData.channel,
        payload: outboxData.payload,
        notification: { connect: { id: notification.id } },
      },
    })

    return { notification, outbox }
  })
}
```

### Retry Logic (Exponential Backoff)

```
Retry 1: 2 phut
Retry 2: 4 phut
Retry 3: 8 phut
Retry 4: 16 phut
Retry 5: 32 phut
--> Neu that bai: Chuyen vao Dead Letter Queue
```

---

## Channel Router - Dinh Tuyen Kenh

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CHANNEL ROUTER                                   │
└─────────────────────────────────────────────────────────────────────────┘

                         Notification
                              │
                              ▼
                    ┌─────────────────┐
                    │  ChannelRouter  │
                    │    route()      │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
   ┌───────────┐      ┌───────────┐       ┌───────────┐
   │   EMAIL   │      │ WEBSOCKET │       │   PUSH    │
   │  Channel  │      │  Channel  │       │  Channel  │
   └─────┬─────┘      └─────┬─────┘       └─────┬─────┘
         │                  │                   │
    ┌────┴────┐        ┌────┴────┐         ┌────┴────┐
    ▼         ▼        ▼         │         ▼         │
┌───────┐ ┌───────┐ ┌───────┐    │    ┌────────┐    │
│Resend │ │Mailpit│ │  WS   │    │    │Firebase│    │
│(Prod) │ │(Dev)  │ │Server │    │    │  FCM   │    │
└───────┘ └───────┘ └───────┘    │    └────────┘    │
                                 │                  │
                            (Future)           (Future)
```

### Email Channel

```typescript
class EmailChannel implements INotificationChannel {
  readonly channelType: Channel = 'EMAIL'
  private provider: IProvider

  constructor() {
    // Development: Mailpit (local mail catcher)
    // Production: Resend (email API)
    this.provider =
      env.NODE_ENV === 'production'
        ? new ResendProvider()
        : new MailpitProvider()
  }

  async send(payload: NotificationPayload): Promise<ChannelDeliveryResult> {
    // Validate email address
    if (!this.validate(payload)) {
      return { success: false, error: 'Invalid email payload' }
    }

    // Send through provider
    const result = await this.provider.send(payload)
    return {
      success: result.success,
      providerMessageId: result.messageId,
    }
  }
}
```

---

## NFT Marketplace Features

### 1. Price Alert Service

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PRICE ALERT FLOW                                  │
└─────────────────────────────────────────────────────────────────────────┘

  User tao Price Alert               External Price Update
         │                                    │
         ▼                                    ▼
  ┌──────────────┐                   ┌────────────────┐
  │ Create Alert │                   │ checkPriceAlerts│
  │ targetPrice  │                   │ (itemId, price) │
  │ condition    │                   └────────┬───────┘
  │ (above/below)│                            │
  └──────────────┘                            ▼
         │                           ┌────────────────────┐
         ▼                           │ Tim cac alerts     │
  ┌──────────────┐                   │ chua trigger       │
  │ price_alerts │◄──────────────────│ cho item nay       │
  │    TABLE     │                   └────────┬───────────┘
  └──────────────┘                            │
                                              ▼
                                    ┌────────────────────┐
                                    │ shouldTriggerAlert │
                                    │ above: price >= target
                                    │ below: price <= target
                                    └────────┬───────────┘
                                             │
                                    ┌────────▼───────────┐
                                    │ Trigger Alert:     │
                                    │ 1. Mark triggered  │
                                    │ 2. Send notification│
                                    │    TARGET_PRICE_   │
                                    │    REACHED         │
                                    └────────────────────┘
```

### 2. Watchlist Service

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        WATCHLIST NOTIFICATIONS                           │
└─────────────────────────────────────────────────────────────────────────┘

  User them vao Watchlist          NFT Activity xay ra
         │                                │
         ▼                                ▼
  ┌──────────────┐              ┌─────────────────────┐
  │ watchlists   │◄─────────────│ notifyNFTListed()   │
  │   TABLE      │              │ notifyNFTActivity() │
  │ itemType:    │              │ notifyFollowingUser │
  │ - nft        │              │     Listed()        │
  │ - collection │              └──────────┬──────────┘
  │ - user       │                         │
  └──────────────┘                         ▼
                               ┌──────────────────────┐
                               │ Tim watchers cho     │
                               │ itemType + itemId    │
                               └──────────┬───────────┘
                                          │
                               ┌──────────▼───────────┐
                               │ Gui notification:    │
                               │ - ACTIVITY_ON_OWNED  │
                               │ - LISTING_CREATED    │
                               │ - FOLLOWING_LISTED   │
                               └──────────────────────┘
```

### 3. Drop Notification Service

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DROP LIFECYCLE                                  │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
  │  ANNOUNCED  │─────▶│   STARTING  │─────▶│    LIVE     │
  │             │      │    SOON     │      │             │
  └─────────────┘      └─────────────┘      └─────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
  │ announceDrop│      │notifyDrop   │      │notifyDrop   │
  │ - Tim       │      │StartingSoon │      │Live         │
  │   collection│      │ - 5 phut    │      │ - Whitelist │
  │   watchers  │      │   truoc     │      │   users     │
  │ - Gui EMAIL │      │ - Whitelist │      │ - WEBSOCKET │
  │ DROP_       │      │   users     │      │ - URGENT    │
  │ ANNOUNCED   │      │ - WEBSOCKET │      └─────────────┘
  └─────────────┘      │ + EMAIL     │
                       └─────────────┘

  ┌─────────────────────────────────────────────────────────────────────┐
  │                      WHITELIST FLOW                                  │
  └─────────────────────────────────────────────────────────────────────┘

  User dang ky          Admin duyet           Mint
       │                     │                  │
       ▼                     ▼                  ▼
  ┌──────────┐         ┌──────────┐       ┌──────────┐
  │ whitelist│────────▶│WHITELIST_│──────▶│ MINT_    │
  │ _entries │         │APPROVED  │       │ SUCCESS  │
  │  TABLE   │         │notification      │ hoac     │
  └──────────┘         └──────────┘       │ MINT_    │
                                          │ FAILED   │
                                          └──────────┘
```

---

## Rate Limiting

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         RATE LIMITING                                    │
└─────────────────────────────────────────────────────────────────────────┘

                     Request
                        │
                        ▼
              ┌─────────────────┐
              │ RateLimitService│
              │ checkRateLimit()│
              └────────┬────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
  ┌─────────┐    ┌─────────┐    ┌─────────┐
  │ MINUTE  │    │  HOUR   │    │   DAY   │
  │ Window  │    │ Window  │    │ Window  │
  │ 100/min │    │1000/hour│    │10000/day│
  └────┬────┘    └────┬────┘    └────┬────┘
       │              │              │
       └──────────────┼──────────────┘
                      │
                      ▼
              ┌───────────────┐
              │    REDIS      │
              │ Sliding Window│
              │   Counter     │
              └───────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
    ┌──────────┐            ┌──────────┐
    │ ALLOWED  │            │ REJECTED │
    │ remaining│            │ resetAt  │
    │ = limit  │            │ = TTL    │
    │   - count│            └──────────┘
    └──────────┘

  Key Format: rate_limit:{orgId}:{channel}:{window}:{timestamp}
  TTL: minute=60s, hour=3600s, day=86400s
```

---

## Webhook Integration

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         WEBHOOK FLOW                                     │
└─────────────────────────────────────────────────────────────────────────┘

  Notification Event               Webhook Subscribers
        │                                 │
        ▼                                 ▼
  ┌──────────────┐              ┌─────────────────┐
  │notification. │              │   webhooks      │
  │sent          │              │     TABLE       │
  │notification. │              │ url, events,    │
  │failed        │              │ secret          │
  └──────┬───────┘              └────────┬────────┘
         │                               │
         └───────────────┬───────────────┘
                         ▼
              ┌─────────────────────┐
              │   WebhookService    │
              │   sendWithRetry()   │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ Generate Signature  │
              │ HMAC-SHA256(payload,│
              │              secret)│
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   HTTP POST         │
              │   Headers:          │
              │   - X-Zuno-Signature│
              │   - Content-Type    │
              │   Body: JSON payload│
              └──────────┬──────────┘
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
   ┌──────────┐                   ┌──────────┐
   │ SUCCESS  │                   │  RETRY   │
   │  200 OK  │                   │ Backoff: │
   └──────────┘                   │ 2s,4s,8s │
                                  └──────────┘
```

---

## Background Workers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         WORKER ARCHITECTURE                              │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────┐
  │                        OUTBOX WORKER                                  │
  │                                                                       │
  │  Interval: 5 seconds                                                  │
  │  Batch Size: 10 entries                                               │
  │                                                                       │
  │  1. Poll outbox table (status=PENDING, scheduled <= now)              │
  │  2. Lock entry with worker ID (distributed locking)                   │
  │  3. Route to appropriate channel (EMAIL/WEBSOCKET)                    │
  │  4. Execute send via provider                                         │
  │  5. Update status: PROCESSED hoac FAILED                              │
  │  6. Record DeliveryAttempt                                            │
  └──────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────┐
  │                        RETRY WORKER                                   │
  │                                                                       │
  │  Interval: 30 seconds                                                 │
  │  Batch Size: 50 entries                                               │
  │                                                                       │
  │  1. Tim notifications: status=FAILED, nextRetryAt <= now              │
  │  2. Retry send through channel                                        │
  │  3. Calculate next retry (exponential backoff)                        │
  │  4. Update: SENT hoac tiep tuc FAILED                                 │
  │  5. Neu retryCount >= 5: khong retry nua                              │
  └──────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────┐
  │                      SCHEDULER WORKER (Future)                        │
  │                                                                       │
  │  1. Tim notifications: status=SCHEDULED, scheduledAt <= now           │
  │  2. Chuyen sang PENDING de outbox worker xu ly                        │
  └──────────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Notifications

| Method | Endpoint | Mo ta |
|--------|----------|-------|
| POST | `/api/notifications/send` | Gui notification |
| POST | `/api/notifications/batch` | Gui nhieu notifications |
| GET | `/api/notifications/[id]` | Lay thong tin notification |
| POST | `/api/notifications/[id]/resend` | Gui lai notification |
| POST | `/api/notifications/schedule` | Len lich gui |

### Templates

| Method | Endpoint | Mo ta |
|--------|----------|-------|
| GET | `/api/templates` | Danh sach templates |
| POST | `/api/templates/create` | Tao template moi |
| GET | `/api/templates/[id]` | Chi tiet template |
| PUT | `/api/templates/[id]` | Cap nhat template |

### Price Alerts

| Method | Endpoint | Mo ta |
|--------|----------|-------|
| POST | `/api/price-alerts/create` | Tao price alert |
| GET | `/api/price-alerts/list` | Danh sach alerts |
| DELETE | `/api/price-alerts/[id]` | Xoa alert |

### Watchlist

| Method | Endpoint | Mo ta |
|--------|----------|-------|
| POST | `/api/watchlist/add` | Them vao watchlist |
| POST | `/api/watchlist/remove` | Xoa khoi watchlist |
| GET | `/api/watchlist/list` | Danh sach watchlist |

### Drops

| Method | Endpoint | Mo ta |
|--------|----------|-------|
| POST | `/api/drops/create` | Tao drop moi |
| GET | `/api/drops/[id]` | Chi tiet drop |
| POST | `/api/drops/[id]/whitelist` | Quan ly whitelist |

### Webhooks

| Method | Endpoint | Mo ta |
|--------|----------|-------|
| POST | `/api/webhooks/subscribe` | Dang ky webhook |
| GET | `/api/webhooks/[id]` | Chi tiet webhook |
| POST | `/api/webhooks/[id]/test` | Test webhook |

---

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ENTITY RELATIONSHIP DIAGRAM                         │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
  │ Organization │─────────│OrganizationMember│────│     User     │
  │              │    1:N  │              │    N:1 │              │
  │ - id         │         │ - role       │        │ - email      │
  │ - name       │         │              │        │ - name       │
  │ - slug       │         └──────────────┘        │              │
  └──────┬───────┘                                 └──────┬───────┘
         │                                                │
         │ 1:N                                            │ 1:N
         ▼                                                ▼
  ┌──────────────┐                                ┌──────────────┐
  │ Notification │◄───────────────────────────────│UserPreference│
  │              │                                │              │
  │ - type       │         ┌──────────────┐       │ - channel    │
  │ - channel    │         │   Template   │       │ - enabled    │
  │ - status     │◄────────│              │       └──────────────┘
  │ - payload    │    N:1  │ - name       │
  └──────┬───────┘         │ - body       │
         │                 │ - variables  │
         │ 1:1             └──────────────┘
         ▼
  ┌──────────────┐         ┌──────────────┐
  │    Outbox    │         │DeliveryAttempt│
  │              │◄────────│              │
  │ - status     │    1:N  │ - success    │
  │ - retryCount │         │ - duration   │
  │ - lockedBy   │         │ - error      │
  └──────────────┘         └──────────────┘

  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
  │  PriceAlert  │         │  Watchlist   │         │     Drop     │
  │              │         │              │         │              │
  │ - itemType   │         │ - itemType   │◄────────│ - status     │
  │ - targetPrice│         │ - itemId     │    1:N  │ - startTime  │
  │ - condition  │         │              │         │              │
  │ - triggered  │         └──────────────┘         └──────┬───────┘
  └──────────────┘                                         │
                                                           │ 1:N
                                                           ▼
                                                  ┌──────────────┐
                                                  │WhitelistEntry│
                                                  │              │
                                                  │ - spots      │
                                                  │ - isApproved │
                                                  └──────────────┘
```

---

## Idempotency - Chong Gui Trung

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        IDEMPOTENCY MECHANISM                             │
└─────────────────────────────────────────────────────────────────────────┘

  Request 1                  Request 2 (duplicate)
  idempotencyKey: "abc"      idempotencyKey: "abc"
        │                           │
        ▼                           ▼
  ┌──────────────┐           ┌──────────────┐
  │Try Create    │           │Try Create    │
  │Notification  │           │Notification  │
  └──────┬───────┘           └──────┬───────┘
         │                          │
         ▼                          ▼
  ┌──────────────┐           ┌──────────────┐
  │  SUCCESS     │           │UNIQUE ERROR  │
  │  Created     │           │(constraint)  │
  └──────────────┘           └──────┬───────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │ Fetch existing│
                            │ notification │
                            │ by key       │
                            └──────┬───────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │Return existing│
                            │notification  │
                            └──────────────┘

  Database Constraint: UNIQUE(idempotencyKey)
  --> Dam bao atomic, race-condition-free
```

---

## Multi-Tenant Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MULTI-TENANT MODEL                                │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────┐
  │                         Organization A                               │
  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
  │  │ Users       │  │ Templates   │  │ Notifications│                 │
  │  │ - Admin     │  │ - welcome   │  │ - 10,000/day │                 │
  │  │ - Editors   │  │ - auction   │  │             │                  │
  │  └─────────────┘  └─────────────┘  └─────────────┘                  │
  │                                                                      │
  │  ┌─────────────┐  ┌─────────────┐                                   │
  │  │ API Keys    │  │ Rate Limits │                                   │
  │  │ - key1      │  │ - 100/min   │                                   │
  │  │ - key2      │  │ - 1000/hour │                                   │
  │  └─────────────┘  └─────────────┘                                   │
  └─────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────┐
  │                         Organization B                               │
  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
  │  │ Users       │  │ Templates   │  │ Notifications│                 │
  │  │ - Owner     │  │ - custom1   │  │ - 50,000/day │                 │
  │  │ - Viewers   │  │ - custom2   │  │             │                  │
  │  └─────────────┘  └─────────────┘  └─────────────┘                  │
  └─────────────────────────────────────────────────────────────────────┘

  RBAC Roles:
  ┌─────────┬──────────────────────────────────────────────────────────┐
  │  Role   │ Permissions                                              │
  ├─────────┼──────────────────────────────────────────────────────────┤
  │ OWNER   │ Full access, manage members, billing                     │
  │ ADMIN   │ Manage settings, templates, API keys                     │
  │ EDITOR  │ Create/edit notifications, templates                     │
  │ VIEWER  │ Read-only access                                         │
  └─────────┴──────────────────────────────────────────────────────────┘
```

---

## Tong Ket

He thong Zuno Marketplace Notifications duoc thiet ke voi cac tinh nang:

1. **Tin cay cao**: Outbox pattern dam bao at-least-once delivery
2. **Da kenh**: Ho tro Email, WebSocket, Push (tuong lai), SMS (tuong lai)
3. **Mo rong**: Kien truc Clean Architecture cho phep mo rong de dang
4. **Bao mat**: Multi-tenant isolation, RBAC, API keys
5. **NFT-specific**: Price alerts, watchlist, drops, whitelist
6. **Observable**: Delivery attempts tracking, audit logs, metrics
7. **Developer-friendly**: Webhooks, idempotency, rate limiting
