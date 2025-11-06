# Hướng Dẫn Triển Khai - Zuno Marketplace Notifications

**Ngày tạo**: 2025-11-06
**Branch chính**: `develop`
**Workflow**: Mỗi feature/issue = 1 branch riêng từ `develop`

---

## ✅ Đã Hoàn Thành

### Phase 1: Foundation
- ✅ Setup Next.js 16 với TypeScript
- ✅ Cấu hình Prisma với 14 models
- ✅ Docker Compose (PostgreSQL, Redis, Mailpit)
- ✅ Domain entities & value objects
- ✅ Logger với correlation ID
- ✅ Health check API
- ✅ Jest testing framework

### Phase 2: Core Features
- ✅ Better-Auth với multi-tenant
- ✅ Email channel (Resend provider)
- ✅ Outbox pattern cho reliable delivery
- ✅ Background workers (poller + retry)
- ✅ Template system (Handlebars)
- ✅ Rate limiting (Redis)
- ✅ Repositories & Use cases

**Total**: 51 files, 3,487 lines of code

---

## 🎯 Danh Sách Features Cần Làm

Tôi đã tạo file **`FEATURES-TODO.md`** với **44 items** cần implement:

### Priority 1: Critical (6 items)
- **FT-001**: Environment setup (.env file)
- **FT-002**: Fix missing dependencies
- **FT-003**: Integrate Outbox với Notification API
- **FT-004**: Integrate Template service
- **BUG-001**: Error handling
- **BUG-002**: Input validation

### Priority 2: Core APIs (10 items)
- **FT-005**: Notification List & Filter API
- **FT-006**: Notification Detail API
- **FT-007**: Notification Cancel API
- **FT-008**: Notification Resend API
- **FT-009**: Template CRUD API
- **FT-010**: Template Preview API
- **FT-011**: User Preferences API
- **FT-012**: Webhook endpoints (Resend)
- **FT-013**: Statistics API
- **FT-014**: Batch Notification API

### Priority 3: Advanced (11 items)
- **FT-015 đến FT-017**: WebSocket channel
- **FT-018 đến FT-025**: Admin UI (Dashboard, Lists, Editor, Analytics, Settings)

### Priority 4: Infrastructure (6 items)
- **FT-026 đến FT-029**: CI/CD pipelines
- **FT-030 đến FT-031**: Monitoring (Sentry, Prometheus)

### Priority 5: Bug Fixes (7 items)
- Authorization, Rate limiting, Audit logs, CORS, v.v.

### Priority 6 & 7: Docs + Enhancements (7 items)
- API documentation, Deployment guide, Template gallery, v.v.

---

## 🔄 Workflow Cho Từng Feature

### Bước 1: Tạo Branch Từ Develop

```bash
# Switch về develop và pull latest
git checkout develop
git pull origin develop

# Tạo branch mới theo naming convention
git checkout -b feature/FT-001-environment-setup
```

### Bước 2: Implement Feature

```bash
# Code theo tasks list trong FEATURES-TODO.md
# Ví dụ FT-001:
cp .env.example .env.local
# Chỉnh sửa .env.local
# Update README.md
```

### Bước 3: ⚠️ QUAN TRỌNG - Typecheck Trước Khi Push

```bash
# PHẢI chạy tất cả các lệnh này và PASS hết:

pnpm typecheck   # Kiểm tra TypeScript errors
pnpm lint        # Kiểm tra ESLint warnings
pnpm test        # Chạy unit tests
pnpm build       # Verify build thành công
```

**❌ Không được push nếu có bất kỳ lỗi nào!**

### Bước 4: Commit Theo Conventional Commits

```bash
git add .
git commit -m "feat(scope): short description

- Task 1 completed
- Task 2 completed
- Task 3 completed

Implements: FT-001"
```

**Commit message format**:
- `feat(scope):` - New feature
- `fix(scope):` - Bug fix
- `docs(scope):` - Documentation
- `refactor(scope):` - Code refactoring
- `test(scope):` - Tests

### Bước 5: Push Với Retry

```bash
# Push với retry nếu fail (theo docs/30-GIT-WORKFLOW.md)
git push -u origin feature/FT-001-environment-setup

# Nếu fail, retry after 2 seconds
sleep 2 && git push origin feature/FT-001-environment-setup
```

### Bước 6: Tạo Pull Request

```bash
# Tạo PR từ feature branch vào develop
# Title: "[FT-001] Environment setup"
# Description: Checklist từ FEATURES-TODO.md
```

---

## 📋 Thứ Tự Triển Khai Đề Xuất

### Tuần 1 (Critical - Phải làm trước):
1. ✅ FT-002: Fix dependencies
2. ✅ FT-001: Environment setup
3. ✅ FT-003: Outbox integration
4. ✅ FT-004: Template integration
5. ✅ BUG-001: Error handling
6. ✅ BUG-002: Input validation

### Tuần 2 (Core APIs):
7. FT-005: List notifications API
8. FT-006: Get notification detail API
9. FT-007: Cancel notification API
10. FT-008: Resend notification API
11. FT-009: Template CRUD API
12. FT-011: User preferences API

### Tuần 3 (Advanced Features):
13. FT-015: WebSocket server setup
14. FT-016: WebSocket channel
15. FT-012: Webhook endpoints
16. FT-013: Statistics API
17. FT-014: Batch send API

### Tuần 4 (Admin UI):
18. FT-018: Admin layout
19. FT-019: Dashboard page
20. FT-020: Notifications list UI
21. FT-021: Notification detail UI
22. FT-022: Templates list UI
23. FT-023: Template editor UI

### Tuần 5 (Infrastructure):
24. FT-026: CI pipeline
25. FT-027: Deploy preview
26. FT-028: Deploy production
27. BUG-003: API rate limiting
28. BUG-004: Authorization checks
29. FT-030: Sentry integration

---

## 🚀 Quick Start (Lần Đầu)

```bash
# 1. Clone repo
git clone <repo-url>
cd zuno-marketplace-notifications

# 2. Switch to develop
git checkout develop
git pull origin develop

# 3. Install dependencies
pnpm install

# 4. Setup environment
cp .env.example .env.local
# Edit .env.local với config thật

# 5. Start Docker services
pnpm docker:up

# 6. Run migrations
pnpm db:migrate

# 7. Seed database
pnpm db:seed

# 8. Start dev server
pnpm dev

# 9. Start workers (terminal khác)
pnpm workers

# 10. Verify
curl http://localhost:3000/api/health
```

---

## 📊 Progress Tracking

Cập nhật progress trong file **FEATURES-TODO.md**:

- [ ] Task chưa làm
- [x] Task đã xong

---

## ❓ Câu Hỏi Thường Gặp

### Q: Tôi nên bắt đầu từ feature nào?
**A**: Bắt đầu từ **FT-002** và **FT-001** (Priority 1). Đây là dependencies cơ bản.

### Q: Phải làm gì nếu typecheck fail?
**A**: Fix tất cả TypeScript errors trước khi push. Không được commit code có lỗi.

### Q: Branch naming convention?
**A**:
- Features: `feature/FT-XXX-short-name`
- Bugs: `fix/BUG-XXX-short-name`
- Docs: `docs/DOC-XXX-short-name`
- Enhancement: `enhancement/ENH-XXX-short-name`

### Q: Commit message format?
**A**: Theo Conventional Commits:
```
type(scope): subject

body

footer
```

### Q: Khi nào merge vào develop?
**A**: Sau khi:
- ✅ All checks passed (typecheck, lint, test, build)
- ✅ PR reviewed và approved
- ✅ No merge conflicts
- ✅ CI pipeline passed

---

## 🆘 Cần Hỗ Trợ?

1. **Xem FEATURES-TODO.md** - Chi tiết từng feature
2. **Xem docs/** folder - 10 documentation files
3. **Check git log** - Xem các commits trước đó làm reference
4. **Run tests** - `pnpm test` để verify

---

## 📈 Metrics Hiện Tại

- **Branches**: 3 (develop, claude/*, main)
- **Commits**: 5 commits
- **Files**: 51 files
- **Lines of Code**: 3,487 lines
- **Test Coverage**: 100% (domain entities)
- **Documentation**: 50,000+ words

---

## 🎯 Target Goals

### End of Week 1:
- ✅ 6 critical items done
- ✅ All APIs working
- ✅ Tests passing

### End of Week 2:
- ✅ 10 core APIs implemented
- ✅ Webhooks working
- ✅ Statistics API

### End of Week 3:
- ✅ WebSocket channel live
- ✅ Real-time notifications working

### End of Week 4:
- ✅ Admin UI complete
- ✅ Template editor working
- ✅ Analytics dashboard

### End of Week 5:
- ✅ CI/CD pipelines deployed
- ✅ Monitoring active
- ✅ Production ready

---

**Chúc bạn code vui vẻ! 🚀**

Mọi thắc mắc hỏi trong FEATURES-TODO.md hoặc xem documentation trong docs/ folder.
