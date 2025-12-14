# Phase 03: Template Migration

## Context
- **Parent Plan**: [plan.md](./plan.md)
- **Dependencies**: [Phase 02](./phase-02-shared-components.md)
- **Docs**: [Gmail CSS Compatibility](./research/gmail-css-compatibility.md)

## Overview
- **Priority**: High
- **Status**: Completed (2025-12-15)
- **Description**: Migrate all 8 email templates to new location with Gmail-compatible styles

## Key Insights
### Common Issues to Fix in All Templates

| Original Pattern | Gmail-Safe Replacement |
|------------------|------------------------|
| `display: 'flex'` | Use `Row` + `Column` components |
| `alignItems: 'center'` | Use `<Column align="center">` |
| `alignItems: 'flex-start'` | Use `<Column align="left">` |
| `justifyContent: 'center'` | Use `<Column align="center">` |
| `flexShrink: 0` | Remove (not needed with tables) |
| `flex: 1` | Use `width: '100%'` or specific width |
| `linear-gradient(...)` | Use solid `backgroundColor` |
| `<div style={...}>` in layouts | Use `<Section>` or `<Row>/<Column>` |

### Template-Specific Color Mapping
| Template | Gradient | Solid Fallback |
|----------|----------|----------------|
| welcome-email | Purple gradient | `#6366f1` |
| auction-won-email | Green gradient | `#10b981` |
| auction-outbid-email | Orange gradient | `#f59e0b` |
| drop-announcement-email | Blue gradient | `#3b82f6` |
| floor-price-drop-email | Red gradient | `#ef4444` |
| mint-success-email | Emerald gradient | `#059669` |
| royalty-received-email | Gold gradient | `#eab308` |
| whitelist-approved-email | Violet gradient | `#8b5cf6` |

## Requirements
### Functional
- Move all 8 templates to `src/components/emails/`
- Replace shared patterns with components from `common/`
- Fix all Gmail-incompatible CSS

### Non-Functional
- Maintain visual appearance (colors, spacing)
- Keep all existing props and interfaces
- Preserve PreviewProps for React Email CLI

## Related Code Files
### Files to Create (copy + modify)
| Source | Destination |
|--------|-------------|
| `src/emails/welcome-email.tsx` | `src/components/emails/welcome-email.tsx` |
| `src/emails/auction-won-email.tsx` | `src/components/emails/auction-won-email.tsx` |
| `src/emails/nft/auction-outbid-email.tsx` | `src/components/emails/nft/auction-outbid-email.tsx` |
| `src/emails/nft/drop-announcement-email.tsx` | `src/components/emails/nft/drop-announcement-email.tsx` |
| `src/emails/nft/floor-price-drop-email.tsx` | `src/components/emails/nft/floor-price-drop-email.tsx` |
| `src/emails/nft/mint-success-email.tsx` | `src/components/emails/nft/mint-success-email.tsx` |
| `src/emails/nft/royalty-received-email.tsx` | `src/components/emails/nft/royalty-received-email.tsx` |
| `src/emails/nft/whitelist-approved-email.tsx` | `src/components/emails/nft/whitelist-approved-email.tsx` |

## Implementation Steps

### Step 1: Migrate welcome-email.tsx
Key changes:
1. Import shared components from `../common`
2. Replace header Section with `<EmailHeader />`
3. Replace heroSection `<div style={heroGradient}>` with `<HeroSection emoji="🎉" title="..." backgroundColor="#6366f1" />`
4. Replace feature grid `<div style={featureCard}>` with `<FeatureCard ... />`
5. Replace footer with `<EmailFooter />`
6. Remove all flexbox styles from remaining inline CSS

### Step 2: Migrate auction-won-email.tsx
Key changes:
1. Use shared components
2. Change `heroGradient` background to solid `#10b981`
3. Fix `nftPlaceholder` div (has `display: 'flex'`) - use Row/Column
4. Fix `stepItem` div (has `display: 'flex'`) - use Row/Column

Example fix for stepItem:
```tsx
// ❌ Before
<div style={stepItem}>
  <Text style={stepNumber}>1</Text>
  <div style={stepContent}>
    <Text style={stepLabel}>NFT Transfer</Text>
    <Text style={stepDesc}>Your NFT will appear...</Text>
  </div>
</div>

// ✅ After
<Row style={{ marginBottom: '16px' }}>
  <Column style={{ width: '36px' }}>
    <Text style={stepNumber}>1</Text>
  </Column>
  <Column>
    <Text style={stepLabel}>NFT Transfer</Text>
    <Text style={stepDesc}>Your NFT will appear...</Text>
  </Column>
</Row>
```

### Step 3: Migrate auction-outbid-email.tsx
Key changes:
1. Use shared components
2. Change hero background to solid `#f59e0b`
3. Fix `nftPlaceholder` div
4. Fix `tipItem` div (has `display: 'flex'`)

Example fix for tipItem:
```tsx
// ❌ Before
<div style={tipItem}>
  <Text style={tipBullet}>•</Text>
  <Text style={tipText}>Set a maximum bid...</Text>
</div>

// ✅ After
<Row style={{ marginBottom: '10px' }}>
  <Column style={{ width: '20px' }}>
    <Text style={tipBullet}>•</Text>
  </Column>
  <Column>
    <Text style={tipText}>Set a maximum bid...</Text>
  </Column>
</Row>
```

### Step 4-8: Migrate remaining NFT templates
Apply same patterns:
- Use shared components (EmailHeader, EmailFooter, HeroSection)
- Replace gradients with solid colors
- Convert all `<div style={{display: 'flex'}}>` to `<Row>/<Column>`
- Remove flexbox properties from all style objects

### Common Style Object Cleanup
Remove these properties from ALL style objects:
```typescript
// Remove from style objects:
display: 'flex',
alignItems: '...',
justifyContent: '...',
flexShrink: ...,
flex: ...,
```

## Todo List
- [x] Migrate `welcome-email.tsx`
- [x] Migrate `auction-won-email.tsx`
- [x] Migrate `auction-outbid-email.tsx`
- [x] Migrate `drop-announcement-email.tsx`
- [x] Migrate `floor-price-drop-email.tsx`
- [x] Migrate `mint-success-email.tsx`
- [x] Migrate `royalty-received-email.tsx`
- [x] Migrate `whitelist-approved-email.tsx`
- [x] Verify all templates in React Email preview
- [ ] Test render in Gmail (send test email)

## Success Criteria
- [x] All 8 templates in new location
- [x] No `display: flex` in any template
- [x] No `alignItems` or `justifyContent` properties
- [x] No `linear-gradient` (solid colors only)
- [x] All templates render in React Email CLI
- [x] TypeScript compilation passes

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Visual regression | Medium | Preview before/after in React Email CLI |
| Missing style conversion | High | Grep for flex properties after migration |
| Broken layouts | High | Test each template individually |

## Security Considerations
- No security concerns for this phase

## Next Steps
- Proceed to Phase 04: Integration & Cleanup
