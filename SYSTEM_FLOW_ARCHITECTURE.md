# CƠ CHẾ HOẠT ĐỘNG VÀ LOGIC FLOW TỔNG THỂ
## Hệ thống Zuno Marketplace Notifications

---

## 1. KIẾN TRÚC TỔNG QUAN (ARCHITECTURE OVERVIEW)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  (NFT Marketplace Frontend, Mobile App, Admin Dashboard)        │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API ROUTES LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Notifications│  │ Price Alerts │  │ Watchlist    │         │
│  │   /api/      │  │   /api/      │  │   /api/      │         │
│  │ notifications│  │ price-alerts │  │  watchlist   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐         │
│  │    Drops     │  │   Templates  │  │   Webhooks   │         │
│  │   /api/      │  │   /api/      │  │   /api/      │         │
│  │    drops     │  │  templates   │  │   webhooks   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USE CASES LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          SendNotificationUseCase (CORE ORCHESTRATOR)     │  │
│  │  - Idempotency checking                                   │  │
│  │  - Rate limiting                                          │  │
│  │  - Template rendering                                     │  │
│  │  - Outbox pattern                                         │  │
│  │  - Channel routing                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICES LAYER                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │PriceAlert   │  │ Watchlist   │  │    Drop     │            │
│  │  Service    │  │  Service    │  │Notification │            │
│  │             │  │             │  │  Service    │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
│         │                 │                 │                    │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐            │
│  │ Idempotency │  │   Outbox    │  │   Webhook   │            │
│  │   Service   │  │  Processor  │  │   Service   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Channels   │  │ Repositories│  │   Workers   │            │
│  │  - Email    │  │  - Prisma   │  │  - Retry    │            │
│  │  - WebSocket│  │  - Redis    │  │  - Outbox   │            │
│  │  - Push     │  │             │  │  - Schedule │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ PostgreSQL  │  │    Redis    │  │  WebSocket  │            │
│  │  (Prisma)   │  │ (Rate Limit)│  │   Server    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. LUỒNG HOẠT ĐỘNG CHÍNH (CORE FLOW)

### 2.1. FLOW GỬI NOTIFICATION CƠ BẢN

```
Bước 1: REQUEST VÀO
┌──────────────────────────────────────────────────────────┐
│ Client gọi API: POST /api/notifications/send             │
│ Body: {                                                   │
│   organizationId: "org-123",                            │
│   userId: "user-456",                                    │
│   type: "FLOOR_PRICE_DROP",                             │
│   channel: "EMAIL",                                      │
│   payload: { ... }                                       │
│ }                                                         │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
Bước 2: IDEMPOTENCY CHECK
┌──────────────────────────────────────────────────────────┐
│ IdempotencyService.checkIdempotency()                    │
│ - Generate idempotency key từ (org, user, type, data)   │
│ - Check Redis/DB: đã gửi trong 24h chưa?               │
│ - Nếu đã gửi: SKIP (tránh duplicate)                   │
│ - Nếu chưa: CONTINUE                                     │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
Bước 3: RATE LIMITING
┌──────────────────────────────────────────────────────────┐
│ RateLimitService.checkRateLimit()                        │
│ - Check Redis token bucket                              │
│ - Organization limits: 1000/min                          │
│ - User limits: 10/min cho mỗi type                      │
│ - Nếu vượt limit: REJECT (429 Too Many Requests)       │
│ - Nếu OK: CONTINUE                                       │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
Bước 4: TEMPLATE RENDERING (nếu có template)
┌──────────────────────────────────────────────────────────┐
│ TemplateService.render()                                 │
│ - Tìm template theo type                                │
│ - Replace variables: {{userName}}, {{price}}, etc.      │
│ - Generate HTML/Text content                            │
│ - Kết quả: rendered content                             │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
Bước 5: TẠO NOTIFICATION RECORD
┌──────────────────────────────────────────────────────────┐
│ prisma.notification.create()                             │
│ - Status: PENDING                                        │
│ - Priority: HIGH/NORMAL/LOW                             │
│ - Save to database                                       │
│ - ID: notif-789                                          │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
Bước 6: OUTBOX PATTERN
┌──────────────────────────────────────────────────────────┐
│ prisma.outbox.create() (SAME TRANSACTION)                │
│ - Link to notification                                   │
│ - Status: PENDING                                        │
│ - Retry count: 0                                         │
│ - Next retry: null                                       │
│ ⚡ Đảm bảo atomicity: hoặc cả 2 thành công, hoặc rollback│
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
Bước 7: CHANNEL DELIVERY
┌──────────────────────────────────────────────────────────┐
│ OutboxProcessor picks up và gửi qua channel             │
│                                                           │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│ │   EMAIL     │  │  WEBSOCKET  │  │    PUSH     │     │
│ │  (Resend)   │  │   (ws://)   │  │   (FCM)     │     │
│ └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                           │
│ Nếu THÀNH CÔNG:                                          │
│ - Update notification.status = DELIVERED                │
│ - Update notification.deliveredAt = now()               │
│ - Update outbox.status = PROCESSED                      │
│                                                           │
│ Nếu THẤT BẠI:                                            │
│ - Update notification.status = FAILED                   │
│ - Update notification.lastError = error_message         │
│ - Update notification.retryCount += 1                   │
│ - Update notification.nextRetryAt = now() + 2^n minutes│
│ - Outbox status = PENDING (để retry)                    │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
Bước 8: RETRY MECHANISM (nếu failed)
┌──────────────────────────────────────────────────────────┐
│ RetryWorker chạy mỗi 1 phút                             │
│ - Tìm notifications với nextRetryAt < now()            │
│ - Retry với exponential backoff: 2, 4, 8, 16, 32 min   │
│ - Max retries: 5 lần                                     │
│ - Sau 5 lần failed: permanent FAILED                    │
└──────────────────────────────────────────────────────────┘
```

---

## 3. NFT MARKETPLACE FEATURES - LUỒNG CHI TIẾT

### 3.1. PRICE ALERT FLOW

```
SCENARIO: User tạo price alert cho NFT

Step 1: USER TẠO ALERT
┌──────────────────────────────────────────────────────────┐
│ POST /api/price-alerts/create                            │
│ {                                                         │
│   userId: "user-123",                                    │
│   organizationId: "org-456",                            │
│   itemType: "nft",                                       │
│   itemId: "nft-bored-ape-789",                          │
│   targetPrice: 50.5,  // ETH                            │
│   condition: "below"  // alert when price drops below   │
│ }                                                         │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│ PriceAlertService.createPriceAlert()                     │
│ - Validate input                                         │
│ - Create record in price_alerts table                   │
│ - Status: isActive = true                               │
│ - Return alert ID                                        │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
[ALERT ĐÃ ĐƯỢC TẠO - CHỜ TRIGGER]


Step 2: NFT MARKETPLACE CẬP NHẬT GIÁ (External trigger)
┌──────────────────────────────────────────────────────────┐
│ Marketplace backend phát hiện NFT price thay đổi         │
│ - NFT "bored-ape-789" price: 60 ETH → 48 ETH           │
│ - Call notification service:                             │
│                                                           │
│ PriceAlertService.checkPriceAlerts({                    │
│   itemType: "nft",                                       │
│   itemId: "nft-bored-ape-789",                          │
│   currentPrice: 48,                                      │
│   itemName: "Bored Ape #789",                           │
│   imageUrl: "https://..."                               │
│ })                                                        │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
Step 3: CHECK ALERTS VÀ TRIGGER
┌──────────────────────────────────────────────────────────┐
│ PriceAlertService.checkPriceAlerts()                     │
│                                                           │
│ 1. Query tất cả active alerts cho NFT này:              │
│    SELECT * FROM price_alerts                            │
│    WHERE itemId = 'nft-bored-ape-789'                   │
│      AND itemType = 'nft'                               │
│      AND isActive = true                                │
│      AND triggered = false                              │
│                                                           │
│ 2. Check từng alert:                                     │
│    Alert của user-123:                                   │
│    - targetPrice: 50.5                                  │
│    - condition: "below"                                 │
│    - currentPrice: 48                                    │
│    → 48 < 50.5 = TRUE ✅ TRIGGER!                       │
│                                                           │
│ 3. Gửi notification:                                     │
│    SendNotificationUseCase.execute({                    │
│      organizationId: "org-456",                         │
│      userId: "user-123",                                │
│      type: "TARGET_PRICE_REACHED",                      │
│      channel: "EMAIL",                                   │
│      priority: "HIGH",                                   │
│      payload: {                                          │
│        itemName: "Bored Ape #789",                      │
│        targetPrice: 50.5,                               │
│        currentPrice: 48,                                │
│        imageUrl: "...",                                 │
│      }                                                   │
│    })                                                    │
│                                                           │
│ 4. Mark alert as triggered:                             │
│    UPDATE price_alerts                                   │
│    SET triggered = true, triggeredAt = NOW()            │
│    WHERE id = alert.id                                  │
└──────────────────────────────────────────────────────────┘
             │
             ▼
[EMAIL SENT TO USER]
```

### 3.2. WATCHLIST + FLOOR PRICE DROP FLOW

```
SCENARIO: User theo dõi collection, floor price giảm

Step 1: USER ADD TO WATCHLIST
┌──────────────────────────────────────────────────────────┐
│ POST /api/watchlist/add                                  │
│ {                                                         │
│   userId: "user-123",                                    │
│   organizationId: "org-456",                            │
│   itemType: "collection",                               │
│   itemId: "collection-azuki",                           │
│   notes: "Love this collection!"                        │
│ }                                                         │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│ WatchlistService.addToWatchlist()                        │
│ - Create record in watchlists table                     │
│ - User đã "follow" collection này                       │
└──────────────────────────────────────────────────────────┘


Step 2: MARKETPLACE PHÁT HIỆN FLOOR PRICE GIẢM
┌──────────────────────────────────────────────────────────┐
│ Marketplace monitor phát hiện:                           │
│ - Azuki floor price: 10 ETH → 7.5 ETH                  │
│ - Drop 25%!                                              │
│                                                           │
│ Call notification service:                               │
│ PriceAlertService.checkFloorPriceDrops({                │
│   collectionId: "collection-azuki",                     │
│   collectionName: "Azuki",                              │
│   previousFloorPrice: 10,                               │
│   currentFloorPrice: 7.5,                               │
│   dropPercentage: 25                                     │
│ })                                                        │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
Step 3: NOTIFY TẤT CẢ WATCHERS
┌──────────────────────────────────────────────────────────┐
│ PriceAlertService.checkFloorPriceDrops()                 │
│                                                           │
│ 1. Tìm tất cả users đang watch collection:              │
│    SELECT * FROM watchlists                              │
│    WHERE itemType = 'collection'                        │
│      AND itemId = 'collection-azuki'                    │
│    → Result: [user-123, user-456, user-789, ...]       │
│                                                           │
│ 2. Gửi notification cho TỪNG user qua WEBSOCKET:        │
│    (Real-time notification)                              │
│                                                           │
│    for (watcher of watchers) {                          │
│      SendNotificationUseCase.execute({                  │
│        organizationId: watcher.organizationId,          │
│        userId: watcher.userId,                          │
│        type: "FLOOR_PRICE_DROP",                        │
│        channel: "WEBSOCKET", // Real-time!              │
│        priority: "HIGH",                                 │
│        payload: {                                        │
│          collectionName: "Azuki",                       │
│          previousFloorPrice: 10,                        │
│          currentFloorPrice: 7.5,                        │
│          dropPercentage: 25                             │
│        }                                                 │
│      })                                                  │
│    }                                                     │
└──────────────────────────────────────────────────────────┘
             │
             ▼
[WEBSOCKET PUSH TO ALL WATCHERS IN REAL-TIME]
```

### 3.3. NFT DROP LIFECYCLE FLOW

```
FULL LIFECYCLE: Từ khi tạo drop đến khi user mint

═══════════════════════════════════════════════════════════
PHASE 1: DROP ANNOUNCEMENT (T-7 days)
═══════════════════════════════════════════════════════════

Step 1: ADMIN TẠO DROP
┌──────────────────────────────────────────────────────────┐
│ POST /api/drops/create                                   │
│ {                                                         │
│   organizationId: "org-marketplace",                    │
│   collectionId: "collection-cool-cats",                 │
│   dropName: "Cool Cats Genesis",                        │
│   description: "10,000 unique cats...",                 │
│   startTime: "2025-11-15T10:00:00Z",                    │
│   totalSupply: 10000,                                    │
│   pricePerNFT: 0.08,                                     │
│   isWhitelistOnly: true,                                │
│   imageUrl: "https://...",                              │
│   mintUrl: "https://marketplace.com/drops/cool-cats"    │
│ }                                                         │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│ 1. Create drop in database:                             │
│    INSERT INTO drops (...)                              │
│    VALUES (status = 'ANNOUNCED', ...)                   │
│                                                           │
│ 2. DropNotificationService.announceDrop()               │
│    - Tìm TẤT CẢ users đang watch collection này:       │
│      SELECT * FROM watchlists                           │
│      WHERE itemType = 'collection'                      │
│        AND itemId = 'collection-cool-cats'              │
│                                                           │
│    - Gửi EMAIL announcement cho từng watcher:           │
│      Subject: "New Drop Announced: Cool Cats Genesis"   │
│      Template: drop-announcement-email.tsx              │
│      Content:                                            │
│        - Drop details (date, price, supply)             │
│        - Tips for success                               │
│        - CTA: "View Drop Details"                       │
└──────────────────────────────────────────────────────────┘
             │
             ▼
[EMAIL SENT TO ALL COLLECTION WATCHERS]


═══════════════════════════════════════════════════════════
PHASE 2: WHITELIST APPLICATIONS (T-7 days to T-1 day)
═══════════════════════════════════════════════════════════

Step 2: USERS APPLY FOR WHITELIST
┌──────────────────────────────────────────────────────────┐
│ POST /api/drops/[dropId]/whitelist                      │
│ {                                                         │
│   userId: "user-alice",                                 │
│   organizationId: "org-marketplace",                    │
│   spots: 2  // muốn mint 2 NFTs                        │
│ }                                                         │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│ INSERT INTO whitelist_entries                            │
│ (dropId, userId, spots, isApproved = false)             │
│                                                           │
│ User chờ approval...                                     │
└──────────────────────────────────────────────────────────┘


Step 3: ADMIN APPROVE WHITELIST
┌──────────────────────────────────────────────────────────┐
│ PATCH /api/drops/[dropId]/whitelist                     │
│ {                                                         │
│   whitelistEntryId: "entry-123",                        │
│   organizationId: "org-marketplace"                     │
│ }                                                         │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│ 1. Update whitelist entry:                              │
│    UPDATE whitelist_entries                             │
│    SET isApproved = true                                │
│    WHERE id = 'entry-123'                               │
│                                                           │
│ 2. Send approval email:                                 │
│    DropNotificationService.notifyWhitelistApproved({   │
│      userId: "user-alice",                              │
│      dropName: "Cool Cats Genesis",                     │
│      spots: 2,                                          │
│      startTime: "2025-11-15T10:00:00Z",                │
│      mintUrl: "..."                                     │
│    })                                                    │
│                                                           │
│    Template: whitelist-approved-email.tsx               │
│    Content:                                              │
│      ✅ "You're approved!"                              │
│      - Your spots: 2                                    │
│      - Drop time: Nov 15, 10:00 AM                     │
│      - Preparation checklist:                           │
│        □ Connect wallet                                 │
│        □ Fund wallet (0.16 ETH + gas)                  │
│        □ Set reminder                                   │
│        □ Have mint page open                           │
└──────────────────────────────────────────────────────────┘
             │
             ▼
[APPROVAL EMAIL SENT TO USER-ALICE]


═══════════════════════════════════════════════════════════
PHASE 3: DROP STARTING SOON (T-5 minutes)
═══════════════════════════════════════════════════════════

Step 4: SCHEDULER TRIGGERS 5-MIN WARNING
┌──────────────────────────────────────────────────────────┐
│ SchedulingWorker chạy mỗi phút, check:                  │
│                                                           │
│ SELECT * FROM drops                                      │
│ WHERE status = 'ANNOUNCED'                              │
│   AND startTime BETWEEN NOW() AND NOW() + INTERVAL '5 min'│
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│ DropNotificationService.notifyDropStartingSoon({        │
│   dropId: "drop-cool-cats",                             │
│   dropName: "Cool Cats Genesis",                        │
│   startTime: "2025-11-15T10:00:00Z",                    │
│   mintUrl: "..."                                         │
│ })                                                        │
│                                                           │
│ 1. Tìm approved whitelist users:                        │
│    SELECT * FROM whitelist_entries                      │
│    WHERE dropId = 'drop-cool-cats'                      │
│      AND isApproved = true                              │
│                                                           │
│ 2. Gửi 2 notifications cho mỗi user:                    │
│    a) WEBSOCKET (real-time alert):                      │
│       - Type: DROP_STARTING_SOON                        │
│       - Priority: URGENT                                │
│       - Popup: "⏰ Drop starting in 5 min!"             │
│                                                           │
│    b) EMAIL (backup):                                   │
│       - Subject: "⏰ Cool Cats starting in 5 min!"      │
│       - Content: Get ready message                      │
└──────────────────────────────────────────────────────────┘
             │
             ▼
[WEBSOCKET + EMAIL TO ALL APPROVED USERS]


═══════════════════════════════════════════════════════════
PHASE 4: DROP GOES LIVE (T=0)
═══════════════════════════════════════════════════════════

Step 5: DROP GOES LIVE
┌──────────────────────────────────────────────────────────┐
│ SchedulingWorker triggers exactly at startTime:         │
│                                                           │
│ DropNotificationService.notifyDropLive({                │
│   dropId: "drop-cool-cats",                             │
│   dropName: "Cool Cats Genesis",                        │
│   mintUrl: "..."                                         │
│ })                                                        │
│                                                           │
│ 1. Gửi WEBSOCKET URGENT notification:                   │
│    - Subject: "🚀 Cool Cats is LIVE!"                   │
│    - CTA: "MINT NOW"                                    │
│                                                           │
│ 2. Update drop status:                                  │
│    UPDATE drops SET status = 'live'                     │
│    WHERE id = 'drop-cool-cats'                          │
└──────────────────────────────────────────────────────────┘
             │
             ▼
[LIVE NOTIFICATION VIA WEBSOCKET]


═══════════════════════════════════════════════════════════
PHASE 5: USER MINT NFT (T+1 minute)
═══════════════════════════════════════════════════════════

Step 6: USER MINT (External - từ marketplace)
┌──────────────────────────────────────────────────────────┐
│ User click "Mint" on marketplace                         │
│ → Blockchain transaction                                │
│ → Transaction confirmed                                 │
│                                                           │
│ Marketplace backend call notification service:          │
│ DropNotificationService.notifyMintSuccess({             │
│   userId: "user-alice",                                 │
│   organizationId: "org-marketplace",                    │
│   nftId: "cool-cat-5678",                               │
│   nftName: "Cool Cat #5678",                            │
│   transactionHash: "0x123abc...",                       │
│   imageUrl: "https://...",                              │
│   explorerUrl: "https://etherscan.io/tx/0x123abc",     │
│   marketplaceUrl: "https://marketplace.com/nft/5678"    │
│ })                                                        │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│ Send email confirmation:                                 │
│ Template: mint-success-email.tsx                         │
│ Content:                                                 │
│   🎉 Mint Successful!                                    │
│   - NFT: Cool Cat #5678                                 │
│   - Transaction: 0x123...abc                            │
│   - Buttons:                                             │
│     [View on Explorer] [View in Gallery]                │
│   - What's next:                                         │
│     ✓ NFT will appear in wallet soon                    │
│     ✓ You can transfer or list for sale                │
│     ✓ Share with community                             │
└──────────────────────────────────────────────────────────┘
             │
             ▼
[MINT SUCCESS EMAIL SENT]
```

---

## 4. INTEGRATION POINTS - NFT MARKETPLACE KẾT NỐI

### 4.1. Khi nào NFT Marketplace gọi Notification Service?

```typescript
// ════════════════════════════════════════════════════════
// CASE 1: KHI NFT PRICE THAY ĐỔI
// ════════════════════════════════════════════════════════
// File: marketplace-backend/services/nft-price-monitor.ts

async function onNFTPriceChange(nft: NFT, oldPrice: number, newPrice: number) {
  // Gọi notification service để check price alerts
  await fetch('http://notifications-service/api/webhooks/price-change', {
    method: 'POST',
    body: JSON.stringify({
      itemType: 'nft',
      itemId: nft.id,
      itemName: nft.name,
      currentPrice: newPrice,
      previousPrice: oldPrice,
      imageUrl: nft.imageUrl
    })
  })

  // Notification service sẽ:
  // 1. Check tất cả price alerts
  // 2. Trigger notifications cho users có alerts match
}


// ════════════════════════════════════════════════════════
// CASE 2: KHI FLOOR PRICE CỦA COLLECTION GIẢM
// ════════════════════════════════════════════════════════
// File: marketplace-backend/services/collection-monitor.ts

async function onFloorPriceChange(collection: Collection) {
  const previousFloor = collection.previousFloorPrice
  const currentFloor = collection.currentFloorPrice
  const dropPercentage = ((previousFloor - currentFloor) / previousFloor) * 100

  if (dropPercentage >= 5) { // Drop 5% trở lên
    // Gọi notification service
    await fetch('http://notifications-service/api/webhooks/floor-price-drop', {
      method: 'POST',
      body: JSON.stringify({
        collectionId: collection.id,
        collectionName: collection.name,
        previousFloorPrice: previousFloor,
        currentFloorPrice: currentFloor,
        dropPercentage
      })
    })

    // Notification service sẽ:
    // 1. Tìm tất cả users watching collection
    // 2. Gửi WebSocket + Email notifications
  }
}


// ════════════════════════════════════════════════════════
// CASE 3: KHI USER LIST NFT FOR SALE
// ════════════════════════════════════════════════════════
// File: marketplace-backend/services/listing-service.ts

async function createListing(nft: NFT, seller: User, price: number) {
  // ... logic tạo listing ...

  // Notify những user đang watch NFT này hoặc collection
  await fetch('http://notifications-service/api/webhooks/nft-listed', {
    method: 'POST',
    body: JSON.stringify({
      nftId: nft.id,
      nftName: nft.name,
      collectionId: nft.collectionId,
      collectionName: nft.collection.name,
      price,
      sellerId: seller.id,
      sellerName: seller.name,
      imageUrl: nft.imageUrl,
      listingUrl: `https://marketplace.com/nft/${nft.id}`
    })
  })
}


// ════════════════════════════════════════════════════════
// CASE 4: KHI USER MINT NFT THÀNH CÔNG
// ════════════════════════════════════════════════════════
// File: marketplace-backend/services/mint-service.ts

async function onMintSuccess(
  userId: string,
  nftId: string,
  transactionHash: string
) {
  const nft = await getNFT(nftId)

  // Gửi mint success notification
  await fetch('http://notifications-service/api/notifications/send', {
    method: 'POST',
    body: JSON.stringify({
      organizationId: 'org-marketplace',
      userId,
      type: 'MINT_SUCCESS',
      channel: 'EMAIL',
      priority: 'HIGH',
      payload: {
        nftId,
        nftName: nft.name,
        transactionHash,
        imageUrl: nft.imageUrl,
        explorerUrl: `https://etherscan.io/tx/${transactionHash}`,
        marketplaceUrl: `https://marketplace.com/nft/${nftId}`
      }
    })
  })
}


// ════════════════════════════════════════════════════════
// CASE 5: KHI CREATOR NHẬN ROYALTY
// ════════════════════════════════════════════════════════
// File: marketplace-backend/services/royalty-service.ts

async function onRoyaltyPaid(
  creatorId: string,
  nft: NFT,
  royaltyAmount: number,
  salePrice: number,
  buyerAddress: string,
  transactionHash: string
) {
  // Thông báo cho creator
  await fetch('http://notifications-service/api/notifications/send', {
    method: 'POST',
    body: JSON.stringify({
      organizationId: 'org-marketplace',
      userId: creatorId,
      type: 'ROYALTY_RECEIVED',
      channel: 'EMAIL',
      priority: 'HIGH',
      payload: {
        nftName: nft.name,
        nftImage: nft.imageUrl,
        royaltyAmount,
        salePrice,
        royaltyPercentage: (royaltyAmount / salePrice) * 100,
        buyerAddress,
        transactionHash
      }
    })
  })
}
```

### 4.2. WebSocket Integration

```typescript
// ════════════════════════════════════════════════════════
// FRONTEND - Kết nối WebSocket
// ════════════════════════════════════════════════════════
// File: marketplace-frontend/hooks/useNotifications.ts

import { useEffect, useState } from 'react'

export function useNotifications(userId: string, orgId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Kết nối WebSocket server
    const ws = new WebSocket(
      `ws://notifications-service:3001?userId=${userId}&orgId=${orgId}`
    )

    ws.onopen = () => {
      console.log('✅ Connected to notification service')
    }

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data)

      // Handle different notification types
      switch (notification.type) {
        case 'FLOOR_PRICE_DROP':
          // Show toast notification
          showToast({
            title: '📉 Floor Price Alert!',
            message: `${notification.collectionName} dropped ${notification.dropPercentage}%`,
            type: 'warning',
            action: {
              label: 'View Collection',
              url: `/collections/${notification.collectionId}`
            }
          })
          break

        case 'DROP_STARTING_SOON':
          // Show urgent popup
          showModal({
            title: '⏰ Drop Starting Soon!',
            message: `${notification.dropName} starts in 5 minutes!`,
            urgency: 'high',
            action: {
              label: 'Go to Mint Page',
              url: notification.mintUrl
            }
          })
          break

        case 'DROP_LIVE':
          // Show call-to-action
          showCTA({
            title: '🚀 DROP IS LIVE!',
            message: `${notification.dropName} - Mint now!`,
            urgency: 'critical',
            action: {
              label: 'MINT NOW',
              url: notification.mintUrl,
              primary: true
            }
          })
          break

        case 'TARGET_PRICE_REACHED':
          // Show price alert
          showToast({
            title: '🎯 Price Alert!',
            message: `${notification.itemName} reached your target price!`,
            type: 'success',
            action: {
              label: 'View NFT',
              url: `/nft/${notification.itemId}`
            }
          })
          break
      }

      // Add to notifications list
      setNotifications(prev => [notification, ...prev])
    }

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('🔌 Disconnected from notification service')
      // Reconnect after 5 seconds
      setTimeout(() => {
        window.location.reload()
      }, 5000)
    }

    return () => {
      ws.close()
    }
  }, [userId, orgId])

  return { notifications }
}
```

---

## 5. WORKERS VÀ BACKGROUND JOBS

### 5.1. Retry Worker

```typescript
// ════════════════════════════════════════════════════════
// RETRY WORKER - Xử lý failed notifications
// ════════════════════════════════════════════════════════
// File: src/workers/retry-worker.ts

// Chạy mỗi 1 phút
setInterval(async () => {
  // 1. Tìm notifications cần retry
  const failedNotifications = await prisma.notification.findMany({
    where: {
      status: 'FAILED',
      nextRetryAt: {
        lte: new Date() // đến giờ retry rồi
      },
      retryCount: {
        lt: 5 // chưa vượt max retries
      }
    }
  })

  // 2. Retry từng notification
  for (const notification of failedNotifications) {
    try {
      // Gửi lại qua channel
      await channelService.send(notification)

      // Success → update status
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date()
        }
      })

    } catch (error) {
      // Failed again → schedule next retry
      const retryCount = notification.retryCount + 1
      const nextRetryMinutes = Math.pow(2, retryCount) // Exponential backoff

      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          retryCount,
          lastError: error.message,
          nextRetryAt: new Date(Date.now() + nextRetryMinutes * 60 * 1000)
        }
      })
    }
  }
}, 60000) // Chạy mỗi phút
```

### 5.2. Outbox Processor Worker

```typescript
// ════════════════════════════════════════════════════════
// OUTBOX PROCESSOR - Xử lý outbox queue
// ════════════════════════════════════════════════════════
// File: src/workers/outbox-processor.ts

// Chạy liên tục
while (true) {
  // 1. Lấy pending outbox messages
  const outboxMessages = await prisma.outbox.findMany({
    where: {
      status: 'PENDING'
    },
    include: {
      notification: true
    },
    take: 100, // Xử lý 100 messages mỗi lần
    orderBy: {
      createdAt: 'asc' // FIFO
    }
  })

  // 2. Xử lý từng message
  for (const outbox of outboxMessages) {
    try {
      // Gửi qua channel tương ứng
      const channel = outbox.notification.channel

      if (channel === 'EMAIL') {
        await emailService.send(outbox.notification.payload)
      } else if (channel === 'WEBSOCKET') {
        await websocketService.send(outbox.notification.payload)
      } else if (channel === 'PUSH') {
        await pushService.send(outbox.notification.payload)
      }

      // Success → mark as processed
      await prisma.$transaction([
        prisma.outbox.update({
          where: { id: outbox.id },
          data: {
            status: 'PROCESSED',
            processedAt: new Date()
          }
        }),
        prisma.notification.update({
          where: { id: outbox.notificationId },
          data: {
            status: 'DELIVERED',
            deliveredAt: new Date()
          }
        })
      ])

    } catch (error) {
      // Failed → keep as pending for retry
      await prisma.notification.update({
        where: { id: outbox.notificationId },
        data: {
          status: 'FAILED',
          lastError: error.message,
          retryCount: { increment: 1 },
          nextRetryAt: new Date(Date.now() + 2 * 60 * 1000) // Retry sau 2 phút
        }
      })
    }
  }

  // Sleep 1 giây trước khi lặp lại
  await sleep(1000)
}
```

### 5.3. Scheduling Worker

```typescript
// ════════════════════════════════════════════════════════
// SCHEDULING WORKER - Xử lý scheduled notifications
// ════════════════════════════════════════════════════════
// File: src/workers/scheduling-worker.ts

// Chạy mỗi 30 giây
setInterval(async () => {
  // Check drops sắp bắt đầu (5 phút nữa)
  const dropsStartingSoon = await prisma.drop.findMany({
    where: {
      status: 'ANNOUNCED',
      startTime: {
        gte: new Date(), // Chưa bắt đầu
        lte: new Date(Date.now() + 5 * 60 * 1000) // Trong 5 phút tới
      }
    }
  })

  for (const drop of dropsStartingSoon) {
    await dropNotificationService.notifyDropStartingSoon({
      dropId: drop.id,
      dropName: drop.name,
      startTime: drop.startTime,
      mintUrl: drop.mintUrl || ''
    })
  }

  // Check drops đã đến giờ
  const dropsGoingLive = await prisma.drop.findMany({
    where: {
      status: 'ANNOUNCED',
      startTime: {
        lte: new Date() // Đã đến giờ
      }
    }
  })

  for (const drop of dropsGoingLive) {
    await dropNotificationService.notifyDropLive({
      dropId: drop.id,
      dropName: drop.name,
      mintUrl: drop.mintUrl || ''
    })
  }
}, 30000) // Chạy mỗi 30 giây
```

---

## 6. TÓM TẮT - KEY POINTS

### 6.1. Các Design Patterns được sử dụng

1. **Clean Architecture**
   - Separation of concerns: Domain, Use Cases, Infrastructure
   - Dependency inversion: Business logic không phụ thuộc infrastructure

2. **Repository Pattern**
   - Abstract data access
   - Dễ test và mock

3. **Outbox Pattern**
   - Đảm bảo reliability: không mất messages
   - Atomicity: hoặc cả 2 thành công (DB + message) hoặc cả 2 fail

4. **Retry Pattern**
   - Exponential backoff: 2, 4, 8, 16, 32 phút
   - Max retries: 5 lần

5. **Idempotency Pattern**
   - Tránh duplicate notifications
   - Cache 24h

6. **Rate Limiting**
   - Token bucket algorithm
   - Org-level và User-level limits

### 6.2. Data Flow Summary

```
External Event (Marketplace)
    │
    ↓
API/Webhook Endpoint
    │
    ↓
Service Layer (PriceAlert/Watchlist/Drop)
    │
    ↓
SendNotificationUseCase (Core Orchestrator)
    ├─→ Idempotency Check
    ├─→ Rate Limit Check
    ├─→ Template Rendering
    └─→ Save to DB + Outbox
        │
        ↓
    Outbox Processor
        │
        ↓
    Channel Delivery (Email/WebSocket/Push)
        │
        ├─→ SUCCESS → Mark DELIVERED
        └─→ FAILED → Schedule RETRY
            │
            ↓
        Retry Worker (exponential backoff)
```

### 6.3. Real-time vs Async

**Real-time (WebSocket):**
- Floor price drops
- Drop starting soon (5 min)
- Drop live
- Auction outbid
- Following user activity

**Async (Email):**
- Drop announcements
- Whitelist approved
- Mint success
- Royalty received
- Price alerts triggered

**Both:**
- Critical drop notifications (WebSocket + Email for redundancy)

---

## 7. MONITORING VÀ METRICS

```typescript
// Prometheus metrics exposed at /api/metrics

metrics.push('# HELP notifications_total Total notifications sent')
metrics.push('# TYPE notifications_total counter')
metrics.push(`notifications_total{status="delivered"} ${deliveredCount}`)
metrics.push(`notifications_total{status="failed"} ${failedCount}`)

metrics.push('# HELP notifications_by_channel By channel')
metrics.push('# TYPE notifications_by_channel counter')
metrics.push(`notifications_by_channel{channel="email"} ${emailCount}`)
metrics.push(`notifications_by_channel{channel="websocket"} ${wsCount}`)

metrics.push('# HELP notifications_by_type By type')
metrics.push('# TYPE notifications_by_type counter')
metrics.push(`notifications_by_type{type="FLOOR_PRICE_DROP"} ${floorDropCount}`)
metrics.push(`notifications_by_type{type="DROP_LIVE"} ${dropLiveCount}`)
```

Grafana dashboards để monitor:
- Delivery rate
- Failure rate
- Retry success rate
- Average delivery time
- Channel performance
- Type distribution
