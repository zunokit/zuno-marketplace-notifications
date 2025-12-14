# Zuno Marketplace Notifications: Project Overview and Product Development Requirements

## 1. Project Overview

The Zuno Marketplace Notifications project is an enterprise-grade multi-channel notification service designed specifically for an NFT Marketplace. Its primary goal is to provide reliable, efficient, and customizable notifications across various channels (Email, WebSocket, Push, SMS) to enhance user engagement and provide timely information regarding marketplace activities.

**Project Name**: Zuno Marketplace Notifications
**Version**: 1.0.0
**Status**: Under Development
**Type**: Enterprise-grade multi-channel notification service for NFT Marketplace

## 2. Product Development Requirements (PDRs)

### 2.1 Goals and Success Metrics

**Goals:**
*   To deliver timely and relevant notifications to NFT marketplace users.
*   To support multiple notification channels (Email, WebSocket, Push, SMS) with a unified interface.
*   To ensure high reliability and at-least-once delivery of notifications.
*   To provide robust configurability for users and administrators.
*   To maintain scalability and performance under high load.

**Success Metrics:**
*   **Delivery Rate**: >99.9% of notifications successfully delivered within their designated channels.
*   **Latency**: Average notification delivery time < 500ms for real-time channels (WebSocket, Push), and < 5 seconds for email/SMS.
*   **Uptime**: 99.99% system uptime for notification service.
*   **User Engagement**: Measurable increase in user interaction with the marketplace due to timely notifications (e.g., click-through rates on email, app opens from push notifications).
*   **Error Rate**: <0.01% of notifications resulting in permanent failures.
*   **Scalability**: System capable of handling 10,000 notifications/second with acceptable latency.

### 2.2 Technology Stack

*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript 5
*   **Database**: PostgreSQL (NeonDB) via Prisma ORM
*   **Cache**: Redis
*   **Authentication**: Better Auth
*   **UI**: shadcn/ui + Tailwind CSS
*   **State Management**: TanStack Query + TanStack Table
*   **Email Service**: Resend (production), Mailpit (development)
*   **Templating**: Handlebars
*   **Logging**: Winston

### 2.3 Key Features

The Zuno Marketplace Notifications service provides a comprehensive set of features to manage and deliver notifications:

*   **Multi-Channel Delivery**: Supports Email, WebSocket, Push, and SMS notifications.
*   **Notification Types**: Over 50 predefined notification types covering marketplace activities (auctions, bids, offers, listings), price alerts, social interactions, NFT drops, and system alerts.
*   **Configurable Templates**: Administrators can create, preview, and publish notification templates using Handlebars.
*   **User Preferences**: Users can manage their notification subscriptions and preferences per channel and notification type.
*   **API for Notification Management**: Provides a robust API for sending, batching, scheduling, and resending notifications.
*   **Price Alerts**: Users can set up alerts for specific NFT price conditions (e.g., floor price drops, target price reached).
*   **Watchlists**: Users can track NFTs and collections to receive relevant updates.
*   **NFT Drops Management**: Comprehensive features for managing NFT campaign lifecycles including announcements, whitelist management, and minting notifications.
*   **Webhook Subscriptions**: Allows external systems to subscribe to notification events.
*   **Idempotency**: Ensures that repeated requests to send the same notification only result in a single successful delivery.
*   **Rate Limiting**: Protects the system from abuse and ensures fair usage through Redis-backed sliding window rate limiting.
*   **Retry Mechanism**: Implements Exponential Backoff for retrying failed notification deliveries.
*   **Outbox Pattern**: Guarantees at-least-once delivery of notifications by publishing events reliably.
*   **Multi-tenancy with RBAC**: Supports multiple organizations with role-based access control (Owner, Admin, Editor, Viewer).
*   **Audit Logging**: Comprehensive logging for all critical actions and notification events.

## 3. Existing Documentation References

*   `docs/DEVELOPMENT_ROADMAP.md`: Provides the 12-week development plan.
*   `docs/INTEGRATION_GUIDE.md`: Details integration with the `zuno-marketplace-api` using RabbitMQ, HTTP, and gRPC.
*   `docs/SYSTEM_ARCHITECTURE.md`: Contains a detailed system architecture (note: this existing file is in Vietnamese and will be complemented by the new English `docs/system-architecture.md`).
