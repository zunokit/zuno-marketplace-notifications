# Phase 04: Integration & Cleanup

## Context
- **Parent Plan**: [plan.md](./plan.md)
- **Dependencies**: [Phase 03](./phase-03-template-migration.md)
- **Docs**: [Codebase Summary](../../docs/codebase-summary.md)

## Overview
- **Priority**: High
- **Status**: Completed (2025-12-15)
- **Description**: Update imports, verify integration, and remove old email folder

## Requirements
### Functional
- Update `template.service.ts` imports to new location
- Verify email rendering works end-to-end
- Remove old `src/emails/` folder

### Non-Functional
- Zero breaking changes to existing API
- All tests pass

## Related Code Files
### Files to Modify
| Path | Action | Description |
|------|--------|-------------|
| `src/infrastructure/templates/template.service.ts` | Modify | Update import paths |

### Files to Delete
| Path | Action | Description |
|------|--------|-------------|
| `src/emails/welcome-email.tsx` | Delete | Old location |
| `src/emails/auction-won-email.tsx` | Delete | Old location |
| `src/emails/nft/auction-outbid-email.tsx` | Delete | Old location |
| `src/emails/nft/drop-announcement-email.tsx` | Delete | Old location |
| `src/emails/nft/floor-price-drop-email.tsx` | Delete | Old location |
| `src/emails/nft/mint-success-email.tsx` | Delete | Old location |
| `src/emails/nft/royalty-received-email.tsx` | Delete | Old location |
| `src/emails/nft/whitelist-approved-email.tsx` | Delete | Old location |
| `src/emails/nft/` | Delete | Old folder |
| `src/emails/` | Delete | Old folder |

## Implementation Steps

### Step 1: Update template.service.ts Imports
```typescript
// ❌ Before
import WelcomeEmail from '@/emails/welcome-email'
import AuctionWonEmail from '@/emails/auction-won-email'
import AuctionOutbidEmail from '@/emails/nft/auction-outbid-email'
import DropAnnouncementEmail from '@/emails/nft/drop-announcement-email'
import FloorPriceDropEmail from '@/emails/nft/floor-price-drop-email'
import MintSuccessEmail from '@/emails/nft/mint-success-email'
import RoyaltyReceivedEmail from '@/emails/nft/royalty-received-email'
import WhitelistApprovedEmail from '@/emails/nft/whitelist-approved-email'

// ✅ After
import WelcomeEmail from '@/components/emails/welcome-email'
import AuctionWonEmail from '@/components/emails/auction-won-email'
import AuctionOutbidEmail from '@/components/emails/nft/auction-outbid-email'
import DropAnnouncementEmail from '@/components/emails/nft/drop-announcement-email'
import FloorPriceDropEmail from '@/components/emails/nft/floor-price-drop-email'
import MintSuccessEmail from '@/components/emails/nft/mint-success-email'
import RoyaltyReceivedEmail from '@/components/emails/nft/royalty-received-email'
import WhitelistApprovedEmail from '@/components/emails/nft/whitelist-approved-email'
```

### Step 2: Verify TypeScript Compilation
```bash
pnpm typecheck
```
Ensure no import errors.

### Step 3: Run Tests
```bash
pnpm test
```
Ensure all existing tests pass.

### Step 4: Test Email Rendering
1. Start dev server: `pnpm dev`
2. Trigger test email send (via API or Mailpit)
3. Verify email renders correctly in Mailpit

### Step 5: Test Gmail Rendering
1. Configure Resend with test API key
2. Send test email to Gmail account
3. Verify layout renders correctly (no broken flex layouts)

### Step 6: Delete Old Email Folder
Only after all verification passes:
```bash
rm -rf src/emails
```

### Step 7: Final Verification
```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Verification Checklist
Run these commands to ensure no leftover references:
```bash
# Check for old import paths
grep -r "@/emails/" src/
# Should return 0 results

# Check for flexbox in new templates
grep -r "display: 'flex'" src/components/emails/
# Should return 0 results

# Check for gradient in new templates
grep -r "linear-gradient" src/components/emails/
# Should return 0 results
```

## Todo List
- [x] Update `template.service.ts` imports
- [x] Run `pnpm typecheck`
- [x] Run `pnpm test` (190 tests passed)
- [x] Test email rendering in Mailpit
- [x] Test email rendering in Gmail
- [x] Delete old `src/emails/` folder
- [x] Run `pnpm build`
- [x] Run final verification grep commands

## Success Criteria
- [x] `template.service.ts` uses new import paths
- [x] TypeScript compilation passes
- [x] All tests pass (190 tests)
- [x] Email renders correctly in Mailpit
- [x] Email renders correctly in Gmail
- [x] Old `src/emails/` folder deleted
- [x] Production build succeeds
- [x] No references to old paths remain

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Missed import update | High | Grep for old paths before deleting |
| Build failure | High | Run full build before cleanup |
| Email rendering regression | High | Test in actual Gmail before deploy |

## Security Considerations
- Verify no secrets in deleted files (none expected)

## Next Steps
- Deploy to staging for QA
- Monitor email delivery metrics
