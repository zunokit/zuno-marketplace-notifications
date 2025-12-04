# Huong Dan Tich Hop Notification Service voi Zuno Marketplace API

## Tong Quan

Tai lieu nay huong dan cach tich hop **zuno-marketplace-notifications** (Next.js/TypeScript) voi **zuno-marketplace-api** (Go microservices).

### Kien Truc Hien Tai

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ZUNO MARKETPLACE API                              │
│                         (Go Microservices)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │auth-service  │  │user-service  │  │wallet-service│                   │
│  │  :50051      │  │  :50052      │  │  :50053      │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │collection-   │  │media-service │  │graphql-      │                   │
│  │service :50054│  │  :50055      │  │gateway :8081 │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
│                                                                          │
│  Infrastructure: PostgreSQL, Redis, RabbitMQ                             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                   ZUNO MARKETPLACE NOTIFICATIONS                         │
│                      (Next.js/TypeScript)                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │ REST API     │  │ Outbox       │  │ Email/WS     │                   │
│  │ :3000        │  │ Workers      │  │ Channels     │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
│                                                                          │
│  Infrastructure: PostgreSQL, Redis, Resend/Mailpit                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Cac Phuong Phap Tich Hop

### Phuong Phap 1: Event-Driven voi RabbitMQ (Khuyen Nghi)

**Uu diem:**
- Loose coupling giua cac services
- Async processing, khong block BE
- Retry tu dong khi notification service down
- Scale doc lap

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    EVENT-DRIVEN ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────┘

  Go Services                RabbitMQ                 Notification Service
       │                        │                            │
       │   Publish Event        │                            │
       │  ──────────────────▶   │                            │
       │   {                    │                            │
       │     "type": "auction.  │      Subscribe             │
       │            won",       │   ◀──────────────────────  │
       │     "data": {...}      │                            │
       │   }                    │      Consume Event         │
       │                        │   ──────────────────────▶  │
       │                        │                            │
       │                        │                      ┌─────▼─────┐
       │                        │                      │ Process   │
       │                        │                      │ & Send    │
       │                        │                      │ Email/WS  │
       │                        │                      └───────────┘
```

#### Buoc 1: Dinh nghia Event Schema

Tao file `shared/events/notification_events.go` trong zuno-marketplace-api:

```go
package events

import "time"

// NotificationEvent la cau truc chung cho tat ca notification events
type NotificationEvent struct {
    ID            string                 `json:"id"`
    Type          string                 `json:"type"`
    OrganizationID string                `json:"organizationId"`
    UserID        string                 `json:"userId"`
    Channel       string                 `json:"channel"` // EMAIL, WEBSOCKET, PUSH
    Priority      string                 `json:"priority"` // LOW, NORMAL, HIGH, URGENT
    Payload       map[string]interface{} `json:"payload"`
    Timestamp     time.Time              `json:"timestamp"`
    IdempotencyKey string                `json:"idempotencyKey,omitempty"`
}

// Event Types
const (
    // Auction Events
    EventAuctionStarted    = "notification.auction.started"
    EventAuctionEndingSoon = "notification.auction.ending_soon"
    EventAuctionWon        = "notification.auction.won"
    EventAuctionOutbid     = "notification.auction.outbid"
    
    // Bid Events
    EventBidPlaced   = "notification.bid.placed"
    EventBidAccepted = "notification.bid.accepted"
    
    // Listing Events
    EventListingCreated = "notification.listing.created"
    EventListingSold    = "notification.listing.sold"
    
    // Price Alerts
    EventFloorPriceDrop    = "notification.price.floor_drop"
    EventTargetPriceReached = "notification.price.target_reached"
    
    // Drop Events
    EventDropAnnounced     = "notification.drop.announced"
    EventDropStartingSoon  = "notification.drop.starting_soon"
    EventDropLive          = "notification.drop.live"
    EventWhitelistApproved = "notification.drop.whitelist_approved"
    
    // User Events
    EventWelcome    = "notification.user.welcome"
    EventUserFollowed = "notification.user.followed"
)
```

#### Buoc 2: Tao Event Publisher trong Go

Tao file `shared/messaging/publisher.go`:

```go
package messaging

import (
    "encoding/json"
    "fmt"
    
    amqp "github.com/rabbitmq/amqp091-go"
    "github.com/google/uuid"
    "zuno-marketplace-api/shared/events"
)

type NotificationPublisher struct {
    channel  *amqp.Channel
    exchange string
}

func NewNotificationPublisher(conn *amqp.Connection, exchange string) (*NotificationPublisher, error) {
    ch, err := conn.Channel()
    if err != nil {
        return nil, err
    }
    
    // Declare exchange for notifications
    err = ch.ExchangeDeclare(
        exchange,  // name
        "topic",   // type
        true,      // durable
        false,     // auto-deleted
        false,     // internal
        false,     // no-wait
        nil,       // arguments
    )
    if err != nil {
        return nil, err
    }
    
    return &NotificationPublisher{
        channel:  ch,
        exchange: exchange,
    }, nil
}

func (p *NotificationPublisher) Publish(event events.NotificationEvent) error {
    body, err := json.Marshal(event)
    if err != nil {
        return err
    }
    
    return p.channel.Publish(
        p.exchange,     // exchange
        event.Type,     // routing key
        false,          // mandatory
        false,          // immediate
        amqp.Publishing{
            ContentType:  "application/json",
            Body:         body,
            DeliveryMode: amqp.Persistent,
            MessageId:    uuid.New().String(),
        },
    )
}

// Helper methods cho tung loai notification

func (p *NotificationPublisher) PublishAuctionWon(orgID, userID, email string, auctionData map[string]interface{}) error {
    return p.Publish(events.NotificationEvent{
        ID:             uuid.New().String(),
        Type:           events.EventAuctionWon,
        OrganizationID: orgID,
        UserID:         userID,
        Channel:        "EMAIL",
        Priority:       "HIGH",
        Payload: map[string]interface{}{
            "to":           email,
            "subject":      fmt.Sprintf("Congratulations! You won %s", auctionData["nftName"]),
            "auctionId":    auctionData["auctionId"],
            "nftName":      auctionData["nftName"],
            "winningBid":   auctionData["winningBid"],
            "imageUrl":     auctionData["imageUrl"],
        },
        Timestamp:      time.Now(),
        IdempotencyKey: fmt.Sprintf("auction-won-%s-%s", auctionData["auctionId"], userID),
    })
}

func (p *NotificationPublisher) PublishWelcome(orgID, userID, email, userName string) error {
    return p.Publish(events.NotificationEvent{
        ID:             uuid.New().String(),
        Type:           events.EventWelcome,
        OrganizationID: orgID,
        UserID:         userID,
        Channel:        "EMAIL",
        Priority:       "NORMAL",
        Payload: map[string]interface{}{
            "to":       email,
            "subject":  "Welcome to Zuno Marketplace!",
            "userName": userName,
        },
        Timestamp:      time.Now(),
        IdempotencyKey: fmt.Sprintf("welcome-%s", userID),
    })
}
```

#### Buoc 3: Su dung trong Go Services

Trong `services/auth-service/internal/server/auth_server.go`:

```go
package server

import (
    "context"
    
    "zuno-marketplace-api/shared/messaging"
    pb "zuno-marketplace-api/shared/proto/pb"
)

type AuthServer struct {
    pb.UnimplementedAuthServiceServer
    notificationPublisher *messaging.NotificationPublisher
    // ... other dependencies
}

func (s *AuthServer) VerifySiwe(ctx context.Context, req *pb.VerifySiweRequest) (*pb.VerifySiweResponse, error) {
    // ... existing SIWE verification logic ...
    
    // After successful registration, send welcome notification
    if isNewUser {
        err := s.notificationPublisher.PublishWelcome(
            organizationID,
            user.ID,
            user.Email,
            user.Name,
        )
        if err != nil {
            // Log error but don't fail the request
            log.Printf("Failed to publish welcome notification: %v", err)
        }
    }
    
    return &pb.VerifySiweResponse{...}, nil
}
```

#### Buoc 4: Tao Event Consumer trong Notification Service

Tao file `src/infrastructure/messaging/rabbitmq-consumer.ts` trong zuno-marketplace-notifications:

```typescript
import amqp from 'amqplib'
import { SendNotificationUseCase } from '@/core/use-cases/notifications/send-notification.use-case'
import { logger } from '@/lib/logger/logger'

interface NotificationEvent {
  id: string
  type: string
  organizationId: string
  userId: string
  channel: 'EMAIL' | 'WEBSOCKET' | 'PUSH'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  payload: Record<string, unknown>
  timestamp: string
  idempotencyKey?: string
}

export class RabbitMQConsumer {
  private connection: amqp.Connection | null = null
  private channel: amqp.Channel | null = null
  private sendNotificationUseCase: SendNotificationUseCase

  constructor() {
    this.sendNotificationUseCase = new SendNotificationUseCase()
  }

  async connect() {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672'
    this.connection = await amqp.connect(url)
    this.channel = await this.connection.createChannel()

    // Declare exchange
    await this.channel.assertExchange('zuno.notifications', 'topic', {
      durable: true,
    })

    // Declare queue
    const queue = await this.channel.assertQueue('notification-service', {
      durable: true,
    })

    // Bind to all notification events
    await this.channel.bindQueue(queue.queue, 'zuno.notifications', 'notification.#')

    logger.info('RabbitMQ consumer connected', { queue: queue.queue })
  }

  async startConsuming() {
    if (!this.channel) {
      throw new Error('Channel not initialized')
    }

    await this.channel.consume('notification-service', async (msg) => {
      if (!msg) return

      try {
        const event: NotificationEvent = JSON.parse(msg.content.toString())
        
        logger.info('Received notification event', {
          type: event.type,
          userId: event.userId,
        })

        // Map event type to notification type
        const notificationType = this.mapEventToNotificationType(event.type)

        // Send notification
        await this.sendNotificationUseCase.execute({
          organizationId: event.organizationId,
          userId: event.userId,
          type: notificationType,
          channel: event.channel,
          priority: event.priority,
          payload: event.payload,
          idempotencyKey: event.idempotencyKey,
        })

        // Acknowledge message
        this.channel!.ack(msg)

        logger.info('Notification processed successfully', {
          type: event.type,
          userId: event.userId,
        })
      } catch (error) {
        logger.error('Failed to process notification event', {
          error: error instanceof Error ? error.message : 'Unknown error',
        })

        // Reject and requeue on failure
        this.channel!.nack(msg, false, true)
      }
    })

    logger.info('Started consuming notification events')
  }

  private mapEventToNotificationType(eventType: string): string {
    const mapping: Record<string, string> = {
      'notification.auction.started': 'AUCTION_STARTED',
      'notification.auction.ending_soon': 'AUCTION_ENDING_SOON',
      'notification.auction.won': 'AUCTION_WON',
      'notification.auction.outbid': 'AUCTION_OUTBID',
      'notification.bid.placed': 'BID_PLACED',
      'notification.listing.created': 'LISTING_CREATED',
      'notification.listing.sold': 'LISTING_SOLD',
      'notification.price.floor_drop': 'FLOOR_PRICE_DROP',
      'notification.price.target_reached': 'TARGET_PRICE_REACHED',
      'notification.drop.announced': 'DROP_ANNOUNCED',
      'notification.drop.starting_soon': 'DROP_STARTING_SOON',
      'notification.drop.live': 'DROP_LIVE',
      'notification.drop.whitelist_approved': 'WHITELIST_APPROVED',
      'notification.user.welcome': 'WELCOME',
      'notification.user.followed': 'USER_FOLLOWED',
    }

    return mapping[eventType] || 'CUSTOM'
  }

  async disconnect() {
    if (this.channel) await this.channel.close()
    if (this.connection) await this.connection.close()
  }
}
```

---

### Phuong Phap 2: HTTP API (Don Gian)

**Uu diem:**
- Don gian, de implement
- Synchronous, biet ket qua ngay

**Nhuoc diem:**
- Coupling cao hon
- BE phai cho notification service

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      HTTP API INTEGRATION                                │
└─────────────────────────────────────────────────────────────────────────┘

  Go Services                                    Notification Service
       │                                                │
       │   POST /api/notifications/send                 │
       │  ─────────────────────────────────────────▶    │
       │   {                                            │
       │     "userId": "...",                           │
       │     "type": "AUCTION_WON",                     │
       │     "channel": "EMAIL",                        │
       │     "payload": {...}                           │
       │   }                                            │
       │                                                │
       │   Response: 201 Created                        │
       │  ◀─────────────────────────────────────────    │
       │   { "id": "...", "status": "PENDING" }         │
       │                                                │
```

#### Tao HTTP Client trong Go

Tao file `shared/clients/notification_client.go`:

```go
package clients

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type NotificationClient struct {
    baseURL    string
    apiKey     string
    httpClient *http.Client
}

type SendNotificationRequest struct {
    UserID         string                 `json:"userId"`
    Type           string                 `json:"type"`
    Channel        string                 `json:"channel"`
    TemplateSlug   string                 `json:"templateSlug,omitempty"`
    Priority       string                 `json:"priority,omitempty"`
    Payload        map[string]interface{} `json:"payload"`
    IdempotencyKey string                 `json:"idempotencyKey,omitempty"`
}

type SendNotificationResponse struct {
    ID            string `json:"id"`
    Status        string `json:"status"`
    CorrelationID string `json:"correlationId"`
}

func NewNotificationClient(baseURL, apiKey string) *NotificationClient {
    return &NotificationClient{
        baseURL: baseURL,
        apiKey:  apiKey,
        httpClient: &http.Client{
            Timeout: 10 * time.Second,
        },
    }
}

func (c *NotificationClient) Send(req SendNotificationRequest) (*SendNotificationResponse, error) {
    body, err := json.Marshal(req)
    if err != nil {
        return nil, err
    }

    httpReq, err := http.NewRequest("POST", c.baseURL+"/api/notifications/send", bytes.NewBuffer(body))
    if err != nil {
        return nil, err
    }

    httpReq.Header.Set("Content-Type", "application/json")
    httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)

    resp, err := c.httpClient.Do(httpReq)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusCreated {
        return nil, fmt.Errorf("notification service returned status %d", resp.StatusCode)
    }

    var result SendNotificationResponse
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }

    return &result, nil
}

// Helper methods

func (c *NotificationClient) SendAuctionWon(userID, email string, data map[string]interface{}) error {
    _, err := c.Send(SendNotificationRequest{
        UserID:       userID,
        Type:         "AUCTION_WON",
        Channel:      "EMAIL",
        TemplateSlug: "auction-won",
        Priority:     "HIGH",
        Payload: map[string]interface{}{
            "to":         email,
            "auctionId":  data["auctionId"],
            "nftName":    data["nftName"],
            "winningBid": data["winningBid"],
            "imageUrl":   data["imageUrl"],
        },
        IdempotencyKey: fmt.Sprintf("auction-won-%s-%s", data["auctionId"], userID),
    })
    return err
}

func (c *NotificationClient) SendWelcome(userID, email, userName string) error {
    _, err := c.Send(SendNotificationRequest{
        UserID:       userID,
        Type:         "WELCOME",
        Channel:      "EMAIL",
        TemplateSlug: "welcome",
        Payload: map[string]interface{}{
            "to":       email,
            "userName": userName,
        },
        IdempotencyKey: fmt.Sprintf("welcome-%s", userID),
    })
    return err
}
```

---

### Phuong Phap 3: gRPC (High Performance)

**Uu diem:**
- Performance cao, binary protocol
- Type-safe voi protobuf
- Bi-directional streaming

#### Buoc 1: Tao notification.proto

Tao file `proto/notification.proto`:

```protobuf
syntax = "proto3";

package notification;

option go_package = "zuno-marketplace-api/shared/proto/pb";

service NotificationService {
  // Send a single notification
  rpc SendNotification(SendNotificationRequest) returns (SendNotificationResponse);
  
  // Send batch notifications
  rpc SendBatch(SendBatchRequest) returns (SendBatchResponse);
  
  // Get notification status
  rpc GetNotification(GetNotificationRequest) returns (NotificationResponse);
  
  // Stream real-time notifications (for WebSocket bridge)
  rpc StreamNotifications(StreamRequest) returns (stream NotificationEvent);
}

message SendNotificationRequest {
  string organization_id = 1;
  string user_id = 2;
  string type = 3;  // AUCTION_WON, BID_PLACED, etc.
  string channel = 4;  // EMAIL, WEBSOCKET, PUSH
  string template_slug = 5;
  string priority = 6;  // LOW, NORMAL, HIGH, URGENT
  map<string, string> payload = 7;
  string idempotency_key = 8;
}

message SendNotificationResponse {
  string id = 1;
  string status = 2;
  string correlation_id = 3;
}

message SendBatchRequest {
  repeated SendNotificationRequest notifications = 1;
}

message SendBatchResponse {
  int32 total = 1;
  int32 success = 2;
  int32 failed = 3;
  repeated BatchResult results = 4;
}

message BatchResult {
  string id = 1;
  bool success = 2;
  string error = 3;
}

message GetNotificationRequest {
  string id = 1;
}

message NotificationResponse {
  string id = 1;
  string type = 2;
  string channel = 3;
  string status = 4;
  string created_at = 5;
  string sent_at = 6;
  string delivered_at = 7;
}

message StreamRequest {
  string user_id = 1;
  repeated string types = 2;  // Filter by notification types
}

message NotificationEvent {
  string id = 1;
  string type = 2;
  string title = 3;
  string body = 4;
  map<string, string> data = 5;
  string timestamp = 6;
}
```

#### Buoc 2: Implement gRPC Server trong Notification Service

Tao file `src/infrastructure/grpc/notification-grpc-server.ts`:

```typescript
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { SendNotificationUseCase } from '@/core/use-cases/notifications/send-notification.use-case'
import { logger } from '@/lib/logger/logger'

const PROTO_PATH = './proto/notification.proto'

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const notificationProto = grpc.loadPackageDefinition(packageDefinition).notification as any

export class NotificationGrpcServer {
  private server: grpc.Server
  private sendNotificationUseCase: SendNotificationUseCase

  constructor() {
    this.server = new grpc.Server()
    this.sendNotificationUseCase = new SendNotificationUseCase()
    this.registerHandlers()
  }

  private registerHandlers() {
    this.server.addService(notificationProto.NotificationService.service, {
      SendNotification: this.sendNotification.bind(this),
      SendBatch: this.sendBatch.bind(this),
      GetNotification: this.getNotification.bind(this),
      StreamNotifications: this.streamNotifications.bind(this),
    })
  }

  private async sendNotification(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) {
    try {
      const request = call.request

      const notification = await this.sendNotificationUseCase.execute({
        organizationId: request.organization_id,
        userId: request.user_id,
        type: request.type as any,
        channel: request.channel as any,
        templateSlug: request.template_slug,
        priority: request.priority as any,
        payload: request.payload,
        idempotencyKey: request.idempotency_key,
      })

      callback(null, {
        id: notification.id,
        status: notification.status,
        correlation_id: notification.correlationId,
      })
    } catch (error) {
      logger.error('gRPC SendNotification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      callback({
        code: grpc.status.INTERNAL,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  private async sendBatch(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) {
    const results: any[] = []
    let success = 0
    let failed = 0

    for (const req of call.request.notifications) {
      try {
        const notification = await this.sendNotificationUseCase.execute({
          organizationId: req.organization_id,
          userId: req.user_id,
          type: req.type as any,
          channel: req.channel as any,
          payload: req.payload,
        })
        results.push({ id: notification.id, success: true })
        success++
      } catch (error) {
        results.push({
          id: '',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        failed++
      }
    }

    callback(null, {
      total: results.length,
      success,
      failed,
      results,
    })
  }

  private async getNotification(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) {
    // Implementation here
  }

  private streamNotifications(call: grpc.ServerWritableStream<any, any>) {
    // WebSocket bridge implementation
  }

  start(port: number) {
    this.server.bindAsync(
      `0.0.0.0:${port}`,
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) {
          logger.error('Failed to start gRPC server', { error: err.message })
          return
        }
        logger.info('gRPC server started', { port })
      }
    )
  }
}
```

---

## Cau Hinh Docker Compose

Them notification service vao docker-compose.yml cua zuno-marketplace-api:

```yaml
services:
  # ... existing services ...

  notification-service:
    build:
      context: ../zuno-marketplace-notifications
      dockerfile: Dockerfile
    container_name: notification-service
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/notifications
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@rabbitmq:5672
      - NODE_ENV=development
      - MAILPIT_SMTP_HOST=mailpit
      - MAILPIT_SMTP_PORT=1025
    ports:
      - "3000:3000"      # REST API
      - "50060:50060"    # gRPC (optional)
    depends_on:
      - postgres
      - redis
      - rabbitmq
    networks:
      - app-network

  # Email testing (development)
  mailpit:
    image: axllent/mailpit
    container_name: mailpit
    ports:
      - "8025:8025"  # Web UI
      - "1025:1025"  # SMTP
    networks:
      - app-network
```

---

## So Sanh Cac Phuong Phap

| Tieu chi | Event-Driven (RabbitMQ) | HTTP API | gRPC |
|----------|------------------------|----------|------|
| Coupling | Thap | Trung binh | Trung binh |
| Performance | Cao | Trung binh | Cao nhat |
| Complexity | Trung binh | Thap | Cao |
| Reliability | Cao (queue) | Phu thuoc retry | Cao |
| Debugging | Kho hon | De | Trung binh |
| Type Safety | Thap | Thap | Cao |
| Async Support | Co | Khong | Co (streaming) |

---

## Khuyen Nghi

### Cho Production

1. **Su dung Event-Driven (RabbitMQ)** lam phuong phap chinh
2. **Bo sung HTTP API** cho admin operations va debugging
3. **Su dung gRPC** cho real-time features (WebSocket bridge)

### Chia Se Infrastructure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SHARED INFRASTRUCTURE                                │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────┐
  │                         PostgreSQL                                   │
  │  ┌──────────────────────┐     ┌──────────────────────┐              │
  │  │  zuno_marketplace    │     │  zuno_notifications  │              │
  │  │  (Go services)       │     │  (Notification svc)  │              │
  │  └──────────────────────┘     └──────────────────────┘              │
  └─────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────┐
  │                           Redis                                      │
  │  ┌──────────────────────┐     ┌──────────────────────┐              │
  │  │  Sessions, Cache     │     │  Rate Limiting       │              │
  │  │  (Go services)       │     │  (Notification svc)  │              │
  │  └──────────────────────┘     └──────────────────────┘              │
  └─────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────┐
  │                         RabbitMQ                                     │
  │                                                                      │
  │  Exchange: zuno.notifications (topic)                               │
  │                                                                      │
  │  Publishers:            Consumers:                                   │
  │  - auth-service         - notification-service                       │
  │  - collection-service                                                │
  │  - user-service                                                      │
  └─────────────────────────────────────────────────────────────────────┘
```

---

## Cac Buoc Trien Khai

### Phase 1: Setup Co Ban
1. Them notification-service vao docker-compose
2. Chia se RabbitMQ giua 2 projects
3. Implement event publisher trong Go services

### Phase 2: Tich Hop Events
1. Them event publishing vao auth-service (welcome)
2. Them event publishing vao collection-service (listing events)
3. Test end-to-end flow

### Phase 3: Mo Rong
1. Them HTTP API client cho admin
2. Implement gRPC cho real-time
3. Them monitoring va alerting

---

## Environment Variables

Them vao `.env` cua zuno-marketplace-api:

```bash
# Notification Service
NOTIFICATION_SERVICE_URL=http://notification-service:3000
NOTIFICATION_API_KEY=your-api-key-here

# RabbitMQ Exchange
NOTIFICATION_EXCHANGE=zuno.notifications
```

Them vao `.env` cua zuno-marketplace-notifications:

```bash
# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
RABBITMQ_EXCHANGE=zuno.notifications

# Database (separate from main API)
DATABASE_URL=postgresql://user:password@postgres:5432/notifications
```
