# Features & Issues TODO - Zuno Marketplace Notifications

**Created**: 2025-11-06
**Status**: Ready for Implementation
**Workflow**: Mỗi feature/issue = 1 branch từ `develop`

---

## 🎯 Priority 1: Critical Missing Features (Phải làm trước)

### FT-001: Missing Environment Setup
**Branch**: `feature/FT-001-environment-setup`
**Description**: Tạo file .env từ .env.example và verify config
**Tasks**:
- [ ] Copy .env.example to .env.local
- [ ] Generate BETTER_AUTH_SECRET (openssl rand -base64 32)
- [ ] Verify DATABASE_URL
- [ ] Test environment validation with Zod
- [ ] Update README with setup instructions
**Files Changed**: `.env.local`, `README.md`
**Typecheck**: ✅ Required before push

---

### FT-002: Fix Missing Dependencies
**Branch**: `feature/FT-002-fix-dependencies`
**Description**: Thêm dependencies còn thiếu vào package.json
**Tasks**:
- [ ] Add missing dependencies: `tailwindcss-animate`, `@radix-ui/react-*`
- [ ] Run `pnpm install`
- [ ] Verify build works: `pnpm build`
- [ ] Update lockfile
**Files Changed**: `package.json`, `pnpm-lock.yaml`
**Typecheck**: ✅ Required before push

---

### FT-003: Integrate Outbox with Notification API
**Branch**: `feature/FT-003-outbox-integration`
**Description**: Connect outbox service to notification creation endpoint
**Tasks**:
- [ ] Update POST /api/notifications/send to add to outbox
- [ ] Add transaction support (notification + outbox)
- [ ] Test outbox worker picks up message
- [ ] Add integration test
**Files Changed**:
- `src/app/api/notifications/send/route.ts`
- `tests/integration/notifications.test.ts`
**Typecheck**: ✅ Required before push

---

### FT-004: Template Service Integration
**Branch**: `feature/FT-004-template-integration`
**Description**: Sử dụng template service để render notifications
**Tasks**:
- [ ] Update outbox service to render templates
- [ ] Add template repository
- [ ] Create default templates
- [ ] Add template validation
- [ ] Test template rendering
**Files Changed**:
- `src/infrastructure/outbox/outbox.service.ts`
- `src/infrastructure/repositories/template.repository.ts`
- `prisma/seed.ts`
**Typecheck**: ✅ Required before push

---

## 🔥 Priority 2: Core API Endpoints (Phase 2)

### FT-005: Notification List & Filter API
**Branch**: `feature/FT-005-notification-list-api`
**Description**: GET /api/notifications với filter, pagination, search
**Tasks**:
- [ ] Create GET /api/notifications endpoint
- [ ] Add query params (status, channel, userId, page, limit)
- [ ] Add authentication guard
- [ ] Add organization filter
- [ ] Test pagination
- [ ] Add API tests
**Files Changed**: `src/app/api/notifications/route.ts`
**Typecheck**: ✅ Required before push

---

### FT-006: Notification Detail API
**Branch**: `feature/FT-006-notification-detail-api`
**Description**: GET /api/notifications/:id với delivery attempts
**Tasks**:
- [ ] Create GET /api/notifications/[id]/route.ts
- [ ] Include delivery attempts
- [ ] Include template info
- [ ] Add authorization check
- [ ] Test endpoint
**Files Changed**: `src/app/api/notifications/[id]/route.ts`
**Typecheck**: ✅ Required before push

---

### FT-007: Notification Cancel API
**Branch**: `feature/FT-007-notification-cancel-api`
**Description**: DELETE /api/notifications/:id để cancel pending notification
**Tasks**:
- [ ] Create DELETE /api/notifications/[id]/route.ts
- [ ] Only allow cancel if status = PENDING
- [ ] Update notification status to CANCELLED
- [ ] Remove from outbox if exists
- [ ] Add audit log
**Files Changed**: `src/app/api/notifications/[id]/route.ts`
**Typecheck**: ✅ Required before push

---

### FT-008: Notification Resend API
**Branch**: `feature/FT-008-notification-resend-api`
**Description**: POST /api/notifications/:id/resend để gửi lại failed notification
**Tasks**:
- [ ] Create POST /api/notifications/[id]/resend/route.ts
- [ ] Only allow resend if status = FAILED
- [ ] Reset retry count
- [ ] Add to outbox again
- [ ] Return new notification ID
**Files Changed**: `src/app/api/notifications/[id]/resend/route.ts`
**Typecheck**: ✅ Required before push

---

### FT-009: Template CRUD API
**Branch**: `feature/FT-009-template-crud-api`
**Description**: Full CRUD for templates
**Tasks**:
- [ ] GET /api/templates (list all templates)
- [ ] GET /api/templates/:id (get one template)
- [ ] POST /api/templates (create template)
- [ ] PUT /api/templates/:id (update template)
- [ ] DELETE /api/templates/:id (soft delete)
- [ ] Add validation with Zod
- [ ] Add authorization (OWNER, ADMIN only)
**Files Changed**:
- `src/app/api/templates/route.ts`
- `src/app/api/templates/[id]/route.ts`
**Typecheck**: ✅ Required before push

---

### FT-010: Template Preview API
**Branch**: `feature/FT-010-template-preview-api`
**Description**: POST /api/templates/:id/preview để xem trước template
**Tasks**:
- [ ] Create POST /api/templates/[id]/preview/route.ts
- [ ] Accept test variables in body
- [ ] Render template with variables
- [ ] Return rendered HTML
- [ ] Add error handling for invalid variables
**Files Changed**: `src/app/api/templates/[id]/preview/route.ts`
**Typecheck**: ✅ Required before push

---

### FT-011: User Preferences API
**Branch**: `feature/FT-011-user-preferences-api`
**Description**: Manage user notification preferences
**Tasks**:
- [ ] GET /api/preferences/:userId (get preferences)
- [ ] PUT /api/preferences/:userId (update preferences)
- [ ] POST /api/preferences/subscribe (subscribe to category)
- [ ] POST /api/preferences/unsubscribe (unsubscribe)
- [ ] Add authorization check
**Files Changed**:
- `src/app/api/preferences/[userId]/route.ts`
- `src/app/api/preferences/subscribe/route.ts`
- `src/app/api/preferences/unsubscribe/route.ts`
**Typecheck**: ✅ Required before push

---

### FT-012: Webhook Endpoints
**Branch**: `feature/FT-012-webhook-endpoints`
**Description**: Receive delivery status updates từ Resend
**Tasks**:
- [ ] Create POST /api/webhooks/resend endpoint
- [ ] Verify webhook signature
- [ ] Update notification status based on event
- [ ] Handle bounces, complaints, delivery
- [ ] Add webhook secret to env
- [ ] Test with Resend webhook
**Files Changed**: `src/app/api/webhooks/resend/route.ts`
**Typecheck**: ✅ Required before push

---

### FT-013: Notification Statistics API
**Branch**: `feature/FT-013-notification-stats-api`
**Description**: GET /api/notifications/stats để xem thống kê
**Tasks**:
- [ ] Create GET /api/notifications/stats/route.ts
- [ ] Return counts by status
- [ ] Return counts by channel
- [ ] Filter by date range
- [ ] Add organization filter
- [ ] Cache results (Redis)
**Files Changed**: `src/app/api/notifications/stats/route.ts`
**Typecheck**: ✅ Required before push

---

### FT-014: Batch Notification API
**Branch**: `feature/FT-014-batch-notification-api`
**Description**: POST /api/notifications/batch để gửi nhiều notifications cùng lúc
**Tasks**:
- [ ] Create POST /api/notifications/batch/route.ts
- [ ] Accept array of notifications
- [ ] Validate each notification
- [ ] Create all in transaction
- [ ] Return array of notification IDs
- [ ] Add rate limiting check
**Files Changed**: `src/app/api/notifications/batch/route.ts`
**Typecheck**: ✅ Required before push

---

## 🚀 Priority 3: Advanced Features (Phase 3)

### FT-015: WebSocket Server Setup
**Branch**: `feature/FT-015-websocket-server`
**Description**: Implement WebSocket server cho real-time notifications
**Tasks**:
- [ ] Create WebSocket server file
- [ ] Add connection manager
- [ ] Add authentication for WS connections
- [ ] Handle connection/disconnection
- [ ] Add heartbeat/ping-pong
- [ ] Test connection stability
**Files Changed**:
- `src/infrastructure/channels/websocket/websocket-server.ts`
- `src/infrastructure/channels/websocket/connection-manager.ts`
**Typecheck**: ✅ Required before push

---

### FT-016: WebSocket Channel Implementation
**Branch**: `feature/FT-016-websocket-channel`
**Description**: WebSocket channel để gửi notifications qua WS
**Tasks**:
- [ ] Create websocket.channel.ts
- [ ] Implement INotificationChannel interface
- [ ] Send notification to connected users
- [ ] Handle user not connected case
- [ ] Add to channel router
- [ ] Test sending via WebSocket
**Files Changed**:
- `src/infrastructure/channels/websocket/websocket.channel.ts`
- `src/infrastructure/channels/channel-router.ts`
**Typecheck**: ✅ Required before push

---

### FT-017: WebSocket Client Hook
**Branch**: `feature/FT-017-websocket-client-hook`
**Description**: React hook để subscribe WebSocket notifications
**Tasks**:
- [ ] Create useWebSocket hook
- [ ] Auto-connect on mount
- [ ] Auto-reconnect on disconnect
- [ ] Emit events for new notifications
- [ ] Add TypeScript types
- [ ] Example usage component
**Files Changed**: `src/lib/hooks/useWebSocket.ts`
**Typecheck**: ✅ Required before push

---

### FT-018: Admin Dashboard Layout
**Branch**: `feature/FT-018-admin-layout`
**Description**: Layout cho admin UI với sidebar navigation
**Tasks**:
- [ ] Create admin layout component
- [ ] Add sidebar with navigation
- [ ] Add header with user menu
- [ ] Add breadcrumbs
- [ ] Responsive design (mobile menu)
- [ ] Add theme toggle (dark mode)
**Files Changed**:
- `src/app/admin/layout.tsx`
- `src/components/admin/layout/AdminSidebar.tsx`
- `src/components/admin/layout/AdminHeader.tsx`
**Typecheck**: ✅ Required before push

---

### FT-019: Admin Dashboard Home
**Branch**: `feature/FT-019-admin-dashboard`
**Description**: Trang dashboard với overview stats và charts
**Tasks**:
- [ ] Create admin dashboard page
- [ ] Add stat cards (total, sent, failed, delivered)
- [ ] Add line chart (notifications over time)
- [ ] Add pie chart (by channel)
- [ ] Add recent notifications table
- [ ] Use TanStack Query for data fetching
**Files Changed**:
- `src/app/admin/page.tsx`
- `src/components/admin/dashboard/StatsCards.tsx`
- `src/components/admin/dashboard/NotificationChart.tsx`
**Typecheck**: ✅ Required before push

---

### FT-020: Notifications List UI
**Branch**: `feature/FT-020-notifications-list-ui`
**Description**: Admin page để xem list notifications với filter
**Tasks**:
- [ ] Create notifications list page
- [ ] Use TanStack Table for data table
- [ ] Add filters (status, channel, date range)
- [ ] Add search by ID, user email
- [ ] Add pagination
- [ ] Add actions (view, resend, cancel)
- [ ] Add loading & error states
**Files Changed**:
- `src/app/admin/notifications/page.tsx`
- `src/components/admin/notifications/NotificationsList.tsx`
- `src/components/admin/notifications/NotificationFilters.tsx`
**Typecheck**: ✅ Required before push

---

### FT-021: Notification Detail UI
**Branch**: `feature/FT-021-notification-detail-ui`
**Description**: Chi tiết notification với delivery attempts
**Tasks**:
- [ ] Create notification detail page
- [ ] Show notification info (status, channel, payload)
- [ ] Show delivery attempts table
- [ ] Show template used
- [ ] Add resend button
- [ ] Add cancel button (if pending)
- [ ] Add timeline of events
**Files Changed**:
- `src/app/admin/notifications/[id]/page.tsx`
- `src/components/admin/notifications/NotificationDetail.tsx`
- `src/components/admin/notifications/DeliveryAttempts.tsx`
**Typecheck**: ✅ Required before push

---

### FT-022: Template Management UI
**Branch**: `feature/FT-022-template-management-ui`
**Description**: Admin page để manage templates
**Tasks**:
- [ ] Create templates list page
- [ ] Add create template button
- [ ] Add templates table
- [ ] Add edit, delete, preview actions
- [ ] Add filter by channel, type
- [ ] Add search by name
**Files Changed**:
- `src/app/admin/templates/page.tsx`
- `src/components/admin/templates/TemplatesList.tsx`
**Typecheck**: ✅ Required before push

---

### FT-023: Template Editor UI
**Branch**: `feature/FT-023-template-editor-ui`
**Description**: Editor để tạo/sửa templates với live preview
**Tasks**:
- [ ] Create template editor page
- [ ] Add form (name, subject, body)
- [ ] Add Handlebars syntax highlighting
- [ ] Add live preview panel
- [ ] Add variable inserter dropdown
- [ ] Add save button with validation
- [ ] Test creating & updating templates
**Files Changed**:
- `src/app/admin/templates/new/page.tsx`
- `src/app/admin/templates/[id]/edit/page.tsx`
- `src/components/admin/templates/TemplateEditor.tsx`
- `src/components/admin/templates/TemplatePreview.tsx`
**Typecheck**: ✅ Required before push

---

### FT-024: Analytics Dashboard
**Branch**: `feature/FT-024-analytics-dashboard`
**Description**: Analytics page với charts và metrics
**Tasks**:
- [ ] Create analytics page
- [ ] Add delivery rate chart
- [ ] Add channel distribution chart
- [ ] Add error breakdown chart
- [ ] Add date range picker
- [ ] Add export to CSV button
- [ ] Use Recharts or Chart.js
**Files Changed**:
- `src/app/admin/analytics/page.tsx`
- `src/components/admin/analytics/DeliveryChart.tsx`
- `src/components/admin/analytics/ChannelStats.tsx`
**Typecheck**: ✅ Required before push

---

### FT-025: API Key Management UI
**Branch**: `feature/FT-025-api-key-management`
**Description**: Manage API keys cho external integrations
**Tasks**:
- [ ] Create API keys management page
- [ ] Add create API key button
- [ ] Show API keys list with scopes
- [ ] Add revoke action
- [ ] Add copy API key to clipboard
- [ ] Show last used date
- [ ] Add scopes selection
**Files Changed**:
- `src/app/admin/settings/api-keys/page.tsx`
- `src/components/admin/settings/ApiKeysList.tsx`
**Typecheck**: ✅ Required before push

---

## ⚙️ Priority 4: Infrastructure & DevOps

### FT-026: CI/CD Pipeline - Lint & Test
**Branch**: `feature/FT-026-ci-pipeline`
**Description**: GitHub Actions workflow cho CI
**Tasks**:
- [ ] Create .github/workflows/ci.yml
- [ ] Add typecheck job
- [ ] Add lint job
- [ ] Add test job (with coverage)
- [ ] Add build job
- [ ] Run on pull requests to develop
- [ ] Cache node_modules
**Files Changed**: `.github/workflows/ci.yml`
**Typecheck**: ✅ Required before push

---

### FT-027: Deploy Preview Workflow
**Branch**: `feature/FT-027-deploy-preview`
**Description**: Auto deploy preview khi tạo PR
**Tasks**:
- [ ] Create .github/workflows/deploy-preview.yml
- [ ] Deploy to Vercel preview
- [ ] Comment PR with preview URL
- [ ] Run migrations on preview DB
- [ ] Add environment variables
**Files Changed**: `.github/workflows/deploy-preview.yml`
**Typecheck**: ✅ Required before push

---

### FT-028: Production Deploy Workflow
**Branch**: `feature/FT-028-deploy-production`
**Description**: Deploy to production khi merge vào main
**Tasks**:
- [ ] Create .github/workflows/deploy-production.yml
- [ ] Deploy to Vercel production
- [ ] Run migrations on prod DB
- [ ] Send Slack notification
- [ ] Add rollback capability
**Files Changed**: `.github/workflows/deploy-production.yml`
**Typecheck**: ✅ Required before push

---

### FT-029: Security Scanning
**Branch**: `feature/FT-029-security-scan`
**Description**: Security audit và secret scanning
**Tasks**:
- [ ] Create .github/workflows/security-scan.yml
- [ ] Add npm audit
- [ ] Add Snyk scanning
- [ ] Add secret scanning
- [ ] Run daily
- [ ] Send alerts on vulnerabilities
**Files Changed**: `.github/workflows/security-scan.yml`
**Typecheck**: ✅ Required before push

---

### FT-030: Monitoring Setup - Sentry
**Branch**: `feature/FT-030-sentry-integration`
**Description**: Integrate Sentry cho error tracking
**Tasks**:
- [ ] Install @sentry/nextjs
- [ ] Create sentry.client.config.ts
- [ ] Create sentry.server.config.ts
- [ ] Add error boundary
- [ ] Test error reporting
- [ ] Add release tracking
**Files Changed**:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `src/components/shared/ErrorBoundary.tsx`
**Typecheck**: ✅ Required before push

---

### FT-031: Prometheus Metrics
**Branch**: `feature/FT-031-prometheus-metrics`
**Description**: Expose Prometheus metrics endpoint
**Tasks**:
- [ ] Install prom-client
- [ ] Create metrics registry
- [ ] Add custom metrics (notifications_sent, notifications_failed)
- [ ] Add default metrics (CPU, memory)
- [ ] Expose /api/metrics endpoint
- [ ] Test with Prometheus scraper
**Files Changed**:
- `src/app/api/metrics/route.ts`
- `src/lib/metrics/prometheus.ts`
**Typecheck**: ✅ Required before push

---

## 🐛 Priority 5: Bug Fixes & Improvements

### BUG-001: Missing Error Handling in API
**Branch**: `fix/BUG-001-api-error-handling`
**Description**: Add proper error handling cho tất cả API endpoints
**Tasks**:
- [ ] Create AppError class hierarchy
- [ ] Add global error handler
- [ ] Wrap all endpoints with try-catch
- [ ] Return consistent error format
- [ ] Log all errors with correlation ID
**Files Changed**:
- `src/lib/errors/app-error.ts`
- `src/lib/errors/error-handler.ts`
- All API route files
**Typecheck**: ✅ Required before push

---

### BUG-002: Missing Input Validation
**Branch**: `fix/BUG-002-input-validation`
**Description**: Add Zod validation cho tất cả API inputs
**Tasks**:
- [ ] Create Zod schemas cho tất cả DTOs
- [ ] Add validation middleware
- [ ] Return validation errors (400)
- [ ] Add validation tests
**Files Changed**: All API route files
**Typecheck**: ✅ Required before push

---

### BUG-003: Missing Rate Limiting on APIs
**Branch**: `fix/BUG-003-api-rate-limiting`
**Description**: Add rate limiting cho public APIs
**Tasks**:
- [ ] Create rate limit middleware
- [ ] Apply to all public endpoints
- [ ] Return 429 with retry-after header
- [ ] Test rate limiting
**Files Changed**:
- `src/lib/middleware/rate-limit.ts`
- All public API routes
**Typecheck**: ✅ Required before push

---

### BUG-004: Missing Authorization Checks
**Branch**: `fix/BUG-004-authorization-checks`
**Description**: Add proper authorization cho tất cả protected endpoints
**Tasks**:
- [ ] Review all API endpoints
- [ ] Add requireAuth() where needed
- [ ] Add requireRole() for admin endpoints
- [ ] Add organization access checks
- [ ] Test authorization
**Files Changed**: All protected API routes
**Typecheck**: ✅ Required before push

---

### BUG-005: Missing Audit Logging
**Branch**: `fix/BUG-005-audit-logging`
**Description**: Log tất cả critical actions vào audit_logs table
**Tasks**:
- [ ] Create audit log service
- [ ] Log notification SEND, RESEND, CANCEL
- [ ] Log template CREATE, UPDATE, DELETE
- [ ] Log API key CREATE, REVOKE
- [ ] Add IP address and user agent
**Files Changed**:
- `src/core/services/audit-log.service.ts`
- All API routes with critical actions
**Typecheck**: ✅ Required before push

---

### BUG-006: Missing CORS Configuration
**Branch**: `fix/BUG-006-cors-config`
**Description**: Configure CORS properly cho external API access
**Tasks**:
- [ ] Add CORS headers to API responses
- [ ] Configure allowed origins
- [ ] Add OPTIONS handler
- [ ] Test from different origins
**Files Changed**: `next.config.js`, API middleware
**Typecheck**: ✅ Required before push

---

### BUG-007: Missing Health Check Details
**Branch**: `fix/BUG-007-health-check-details`
**Description**: Improve health check với more details
**Tasks**:
- [ ] Add Redis health check
- [ ] Add outbox queue depth
- [ ] Add worker status
- [ ] Return detailed status object
- [ ] Add liveness and readiness endpoints
**Files Changed**: `src/app/api/health/route.ts`
**Typecheck**: ✅ Required before push

---

## 📚 Priority 6: Documentation

### DOC-001: API Documentation
**Branch**: `docs/DOC-001-api-reference`
**Description**: Generate OpenAPI/Swagger documentation
**Tasks**:
- [ ] Install swagger-jsdoc
- [ ] Add JSDoc comments to all endpoints
- [ ] Generate openapi.json
- [ ] Add Swagger UI at /api-docs
- [ ] Test all endpoints in Swagger
**Files Changed**:
- `docs/35-API-REFERENCE.md`
- `src/app/api-docs/page.tsx`
**Typecheck**: ✅ Required before push

---

### DOC-002: Deployment Guide
**Branch**: `docs/DOC-002-deployment-guide`
**Description**: Complete deployment documentation
**Tasks**:
- [ ] Write deployment checklist
- [ ] Document Vercel setup
- [ ] Document NeonDB setup
- [ ] Document environment variables
- [ ] Add rollback procedures
**Files Changed**: `docs/27-DEPLOYMENT.md`
**Typecheck**: ✅ Required before push

---

### DOC-003: Troubleshooting Guide
**Branch**: `docs/DOC-003-troubleshooting`
**Description**: Common issues and solutions
**Tasks**:
- [ ] Document common errors
- [ ] Add debugging steps
- [ ] Add FAQ section
- [ ] Link to relevant docs
**Files Changed**: `docs/36-TROUBLESHOOTING.md`
**Typecheck**: ✅ Required before push

---

## 🎨 Priority 7: Nice-to-Have Features

### ENH-001: Email Templates Gallery
**Branch**: `enhancement/ENH-001-template-gallery`
**Description**: Pre-built template gallery
**Tasks**:
- [ ] Create 10 beautiful email templates
- [ ] Add template categories
- [ ] Add preview images
- [ ] Add "Use this template" button
**Files Changed**: `src/app/admin/templates/gallery/page.tsx`
**Typecheck**: ✅ Required before push

---

### ENH-002: Notification Scheduling
**Branch**: `enhancement/ENH-002-notification-scheduling`
**Description**: Schedule notifications for future delivery
**Tasks**:
- [ ] Add scheduledAt field support
- [ ] Update outbox poller to respect scheduledAt
- [ ] Add schedule UI in admin
- [ ] Add timezone support
**Files Changed**: Multiple files
**Typecheck**: ✅ Required before push

---

### ENH-003: A/B Testing
**Branch**: `enhancement/ENH-003-ab-testing`
**Description**: A/B test email subject lines and content
**Tasks**:
- [ ] Add variant support in templates
- [ ] Random variant selection
- [ ] Track open/click rates per variant
- [ ] Winner selection logic
**Files Changed**: Multiple files
**Typecheck**: ✅ Required before push

---

## 📊 Summary

**Total Features**: 31
**Total Bugs**: 7
**Total Docs**: 3
**Total Enhancements**: 3
**Grand Total**: 44 branches

---

## 🔄 Workflow

### Cho mỗi feature/issue:

1. **Tạo branch từ develop**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/FT-XXX-feature-name
   ```

2. **Implement feature**
   - Code theo tasks list
   - Write tests
   - Update documentation

3. **Pre-push checks**
   ```bash
   # REQUIRED: Must pass before push
   pnpm typecheck  # TypeScript errors
   pnpm lint       # ESLint warnings
   pnpm test       # Unit tests
   pnpm build      # Build check
   ```

4. **Commit & push**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   git push -u origin feature/FT-XXX-feature-name
   ```

5. **Create PR to develop**
   - Use PR template
   - Request review
   - Wait for CI checks
   - Merge when approved

---

## 🎯 Suggested Order of Implementation

### Week 1 (Critical):
1. FT-002 (Dependencies)
2. FT-001 (Environment)
3. FT-003 (Outbox Integration)
4. FT-004 (Template Integration)
5. BUG-001 (Error Handling)
6. BUG-002 (Input Validation)

### Week 2 (APIs):
7. FT-005 (List API)
8. FT-006 (Detail API)
9. FT-007 (Cancel API)
10. FT-008 (Resend API)
11. FT-009 (Template CRUD)
12. FT-011 (Preferences API)

### Week 3 (Advanced):
13. FT-015 (WebSocket Server)
14. FT-016 (WebSocket Channel)
15. FT-012 (Webhooks)
16. FT-013 (Stats API)
17. FT-014 (Batch API)

### Week 4 (UI):
18. FT-018 (Admin Layout)
19. FT-019 (Dashboard)
20. FT-020 (Notifications List)
21. FT-021 (Notification Detail)
22. FT-022 (Templates List)
23. FT-023 (Template Editor)

### Week 5 (Infrastructure):
24. FT-026 (CI Pipeline)
25. FT-027 (Deploy Preview)
26. FT-028 (Deploy Prod)
27. BUG-003 (Rate Limiting)
28. BUG-004 (Authorization)
29. FT-030 (Sentry)

---

**Last Updated**: 2025-11-06
**Next Review**: After each feature completion
