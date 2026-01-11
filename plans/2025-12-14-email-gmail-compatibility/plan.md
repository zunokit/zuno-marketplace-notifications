# Email Templates Gmail Compatibility Migration

## Overview
Migrate email templates to `src/components/emails/`, setup React Email CLI, and fix Gmail compatibility issues (flexbox → table-based layouts).

## Status
- **Created**: 2025-12-14
- **Priority**: High
- **Status**: Complete (2025-12-15)

## Research
- [Gmail CSS Compatibility](./research/gmail-css-compatibility.md)
- [React Email Components](./research/react-email-components.md)

## Problem Statement
Current email templates in `src/emails/` use CSS flexbox (`display: flex`, `alignItems`, `justifyContent`) which Gmail strips out, causing broken layouts in production.

## Solution
1. Move templates to `src/components/emails/`
2. Create reusable email components (`_components/`)
3. Replace flexbox with table-based Row/Column components
4. Replace gradients with solid fallback colors
5. Setup React Email CLI for preview/dev

## Implementation Phases

| Phase | Name | Status | Progress | File |
|-------|------|--------|----------|------|
| 01 | Setup & Structure | Complete | 100% | [phase-01-setup-structure.md](./phase-01-setup-structure.md) |
| 02 | Shared Components | Complete | 100% | [phase-02-shared-components.md](./phase-02-shared-components.md) |
| 03 | Template Migration | Complete | 100% | [phase-03-template-migration.md](./phase-03-template-migration.md) |
| 04 | Integration & Cleanup | Complete | 100% | [phase-04-integration-cleanup.md](./phase-04-integration-cleanup.md) |

## Key Decisions
- **New Location**: `src/components/emails/` (follows component organization pattern)
- **Reusable Components**: `_components/` prefix (ignored by React Email CLI preview)
- **Color Strategy**: Replace gradients with solid colors for Gmail compatibility

## Files Affected
- 8 email templates to migrate
- 1 file to update imports (`template.service.ts`)
- 1 file to update (`package.json` - add email:dev script)

## Success Criteria
- All templates render correctly in Gmail
- React Email CLI preview works
- No flexbox/grid CSS in email templates
- Shared components reduce code duplication
