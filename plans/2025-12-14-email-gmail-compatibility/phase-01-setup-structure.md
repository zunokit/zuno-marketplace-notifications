# Phase 01: Setup & Structure

## Context
- **Parent Plan**: [plan.md](./plan.md)
- **Dependencies**: None
- **Docs**: [Gmail CSS Compatibility](./research/gmail-css-compatibility.md)

## Overview
- **Priority**: High
- **Status**: DONE (2025-12-14)
- **Description**: Create new folder structure and update project configuration

## Key Insights
- React Email CLI uses `--dir` option to point to custom emails folder
- Folders prefixed with `_` are ignored by CLI preview (good for shared components)
- `static/` folder needed for images served by preview server

## Requirements
### Functional
- Create `src/components/emails/` directory structure
- Add `email:dev` npm script to package.json
- Keep old `src/emails/` until migration complete

### Non-Functional
- Follow existing kebab-case naming convention
- Maintain TypeScript compatibility

## Architecture
```
src/components/emails/
├── common/           # Shared reusable components (ignored by CLI)
│   ├── email-header.tsx
│   ├── email-footer.tsx
│   ├── email-button.tsx
│   ├── hero-section.tsx
│   └── feature-card.tsx
├── static/                # Static assets for preview
│   └── .gitkeep
├── nft/                   # NFT-specific templates
│   ├── auction-outbid-email.tsx
│   ├── drop-announcement-email.tsx
│   ├── floor-price-drop-email.tsx
│   ├── mint-success-email.tsx
│   ├── royalty-received-email.tsx
│   └── whitelist-approved-email.tsx
├── welcome-email.tsx
└── auction-won-email.tsx
```

## Related Code Files
### Files to Create
| Path | Action | Description |
|------|--------|-------------|
| `src/components/emails/common/.gitkeep` | Create | Placeholder for shared components |
| `src/components/emails/static/.gitkeep` | Create | Static assets folder |
| `src/components/emails/nft/.gitkeep` | Create | NFT templates subfolder |

### Files to Modify
| Path | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add `email:dev` script |

## Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/components/emails/common
mkdir -p src/components/emails/static
mkdir -p src/components/emails/nft
```

### Step 2: Create Placeholder Files
```bash
touch src/components/emails/common/.gitkeep
touch src/components/emails/static/.gitkeep
touch src/components/emails/nft/.gitkeep
```

### Step 3: Update package.json
Add to scripts section:
```json
{
  "scripts": {
    "email:dev": "email dev --dir src/components/emails --port 3001"
  }
}
```
Note: Use port 3001 to avoid conflict with Next.js dev server (3000)

### Step 4: Verify Setup
```bash
pnpm email:dev
```
Should start preview server at http://localhost:3001

## Todo List
- [x] Create `src/components/emails/` directory
- [x] Create `common/` subdirectory
- [x] Create `static/` subdirectory
- [x] Create `nft/` subdirectory
- [x] Add `email:dev` script to package.json
- [x] Installed @react-email/preview-server@4.3.2
- [x] Verified CLI starts at localhost:3001

## Success Criteria
- [ ] All directories exist
- [ ] `pnpm email:dev` starts without errors
- [ ] Preview server accessible at localhost:3001

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Port conflict | Low | Use port 3001 instead of 3000 |

## Security Considerations
- No security concerns for this phase

## Next Steps
- Proceed to Phase 02: Shared Components
