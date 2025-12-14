# Phase 02: Shared Components

## Context
- **Parent Plan**: [plan.md](./plan.md)
- **Dependencies**: [Phase 01](./phase-01-setup-structure.md)
- **Docs**: [Gmail CSS Compatibility](./research/gmail-css-compatibility.md), [React Email Components](./research/react-email-components.md)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Create reusable Gmail-compatible email components

## Key Insights
- All layouts must use `Row`/`Column` components (render as tables)
- Replace `display: flex` with `Row` + `Column` with `align` attribute
- Replace gradients with solid fallback colors
- Inline styles only - no external CSS

### CSS Properties to AVOID
```typescript
// ❌ NOT SUPPORTED IN GMAIL
display: 'flex'
alignItems: 'center'
justifyContent: 'center'
flexShrink: 0
flex: 1
background: 'linear-gradient(...)'
```

### Gmail-Safe Alternatives
```typescript
// ✅ USE THESE INSTEAD
// For centering: use Column with align="center"
<Row>
  <Column align="center">Content</Column>
</Row>

// For side-by-side: use multiple Columns with width
<Row>
  <Column style={{ width: '50%' }}>Left</Column>
  <Column style={{ width: '50%' }}>Right</Column>
</Row>

// For gradients: use solid color fallback
backgroundColor: '#6366f1'  // Instead of gradient
```

## Requirements
### Functional
- EmailHeader: Logo centered, consistent padding
- EmailFooter: Brand, social links, legal links
- EmailButton: Primary/secondary variants
- HeroSection: Emoji, title, subtitle with solid background
- FeatureCard: Icon, label, description in card

### Non-Functional
- Zero flexbox usage
- All components type-safe (TypeScript interfaces)
- Consistent with existing dark theme

## Architecture

### Component Interfaces
```typescript
// email-header.tsx
interface EmailHeaderProps {
  organizationName?: string
  logoUrl?: string
}

// email-footer.tsx
interface EmailFooterProps {
  brandName?: string
  showSocialLinks?: boolean
}

// email-button.tsx
interface EmailButtonProps {
  href: string
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
}

// hero-section.tsx
interface HeroSectionProps {
  emoji?: string
  title: string
  subtitle?: string
  backgroundColor?: string
}

// feature-card.tsx
interface FeatureCardProps {
  icon: string
  label: string
  description: string
}
```

## Related Code Files
### Files to Create
| Path | Action | Description |
|------|--------|-------------|
| `src/components/emails/common/email-header.tsx` | Create | Reusable header with logo |
| `src/components/emails/common/email-footer.tsx` | Create | Reusable footer with links |
| `src/components/emails/common/email-button.tsx` | Create | CTA button component |
| `src/components/emails/common/hero-section.tsx` | Create | Hero banner component |
| `src/components/emails/common/feature-card.tsx` | Create | Feature card for grids |
| `src/components/emails/common/index.ts` | Create | Barrel export |

## Implementation Steps

### Step 1: Create email-header.tsx
```tsx
import { Column, Img, Row, Section } from '@react-email/components'

interface EmailHeaderProps {
  organizationName?: string
  logoUrl?: string
}

export const EmailHeader = ({
  organizationName = 'Zuno Marketplace',
  logoUrl = 'https://zuno.market/logo.png',
}: EmailHeaderProps) => (
  <Section style={header}>
    <Row>
      <Column align="center">
        <Img
          src={logoUrl}
          width="140"
          height="40"
          alt={organizationName}
          style={logo}
        />
      </Column>
    </Row>
  </Section>
)

const header = {
  padding: '32px 40px 24px',
  backgroundColor: '#1a1a1a',
}

const logo = {
  margin: '0 auto',
}
```

### Step 2: Create hero-section.tsx
```tsx
import { Column, Heading, Row, Section, Text } from '@react-email/components'

interface HeroSectionProps {
  emoji?: string
  title: string
  subtitle?: string
  backgroundColor?: string
}

export const HeroSection = ({
  emoji,
  title,
  subtitle,
  backgroundColor = '#6366f1',
}: HeroSectionProps) => (
  <Section style={{ padding: '0 24px' }}>
    <Section style={{ ...heroBox, backgroundColor }}>
      <Row>
        <Column align="center">
          {emoji && <Text style={emojiStyle}>{emoji}</Text>}
          <Heading style={titleStyle}>{title}</Heading>
          {subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
        </Column>
      </Row>
    </Section>
  </Section>
)

const heroBox = {
  borderRadius: '16px',
  padding: '40px 32px',
  textAlign: 'center' as const,
}

const emojiStyle = {
  fontSize: '48px',
  margin: '0 0 12px',
}

const titleStyle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px',
  letterSpacing: '-0.5px',
}

const subtitleStyle = {
  color: 'rgba(255, 255, 255, 0.85)',
  fontSize: '16px',
  margin: '0',
}
```

### Step 3: Create email-button.tsx
```tsx
import { Button } from '@react-email/components'

interface EmailButtonProps {
  href: string
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
  style?: React.CSSProperties
}

export const EmailButton = ({
  href,
  variant = 'primary',
  children,
  style,
}: EmailButtonProps) => (
  <Button style={{ ...buttonStyles[variant], ...style }} href={href}>
    {children}
  </Button>
)

const buttonStyles = {
  primary: {
    backgroundColor: '#6366f1',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 40px',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderRadius: '10px',
    color: '#a1a1aa',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 32px',
    border: '1px solid #404040',
  },
}
```

### Step 4: Create email-footer.tsx
```tsx
import { Column, Hr, Link, Row, Section, Text } from '@react-email/components'

interface EmailFooterProps {
  brandName?: string
  showSocialLinks?: boolean
}

export const EmailFooter = ({
  brandName = 'Zuno Marketplace',
  showSocialLinks = true,
}: EmailFooterProps) => (
  <>
    <Hr style={divider} />
    <Section style={footer}>
      <Row>
        <Column align="center">
          <Text style={footerBrand}>{brandName}</Text>
          {showSocialLinks && (
            <Row style={{ marginBottom: '16px' }}>
              <Column align="center">
                <Link href="https://twitter.com/zunomarket" style={socialLink}>Twitter</Link>
                <Text style={socialDot}>•</Text>
                <Link href="https://discord.gg/zuno" style={socialLink}>Discord</Link>
                <Text style={socialDot}>•</Text>
                <Link href="https://instagram.com/zunomarket" style={socialLink}>Instagram</Link>
              </Column>
            </Row>
          )}
          <Text style={footerText}>© 2025 {brandName}. All rights reserved.</Text>
          <Text style={{ margin: '0', textAlign: 'center' as const }}>
            <Link href="https://zuno.market/privacy" style={footerLink}>Privacy Policy</Link>
            <Text style={footerDot}>•</Text>
            <Link href="https://zuno.market/terms" style={footerLink}>Terms of Service</Link>
            <Text style={footerDot}>•</Text>
            <Link href="https://zuno.market/settings/notifications" style={footerLink}>Unsubscribe</Link>
          </Text>
        </Column>
      </Row>
    </Section>
  </>
)

const divider = { borderColor: '#2a2a2a', margin: '0' }
const footer = { padding: '32px 40px', backgroundColor: '#141414' }
const footerBrand = { color: '#ffffff', fontSize: '16px', fontWeight: '600', margin: '0 0 16px', textAlign: 'center' as const }
const socialLink = { color: '#a1a1aa', fontSize: '13px', textDecoration: 'none' }
const socialDot = { color: '#404040', fontSize: '13px', margin: '0 12px', display: 'inline' }
const footerText = { color: '#52525b', fontSize: '12px', lineHeight: '20px', margin: '0 0 12px', textAlign: 'center' as const }
const footerLink = { color: '#71717a', fontSize: '12px', textDecoration: 'none' }
const footerDot = { color: '#404040', fontSize: '12px', margin: '0 8px', display: 'inline' }
```

### Step 5: Create feature-card.tsx
```tsx
import { Column, Row, Section, Text } from '@react-email/components'

interface FeatureCardProps {
  icon: string
  label: string
  description: string
}

export const FeatureCard = ({ icon, label, description }: FeatureCardProps) => (
  <Section style={card}>
    <Row>
      <Column align="center">
        <Text style={iconStyle}>{icon}</Text>
        <Text style={labelStyle}>{label}</Text>
        <Text style={descStyle}>{description}</Text>
      </Column>
    </Row>
  </Section>
)

const card = {
  backgroundColor: '#252525',
  borderRadius: '12px',
  padding: '20px 16px',
  textAlign: 'center' as const,
  border: '1px solid #333',
}

const iconStyle = { fontSize: '24px', margin: '0 0 8px' }
const labelStyle = { color: '#ffffff', fontSize: '14px', fontWeight: '600', margin: '0 0 4px' }
const descStyle = { color: '#71717a', fontSize: '12px', lineHeight: '18px', margin: '0' }
```

### Step 6: Create barrel export (index.ts)
```typescript
export { EmailHeader } from './email-header'
export { EmailFooter } from './email-footer'
export { EmailButton } from './email-button'
export { HeroSection } from './hero-section'
export { FeatureCard } from './feature-card'
```

## Todo List
- [ ] Create `email-header.tsx`
- [ ] Create `hero-section.tsx`
- [ ] Create `email-button.tsx`
- [ ] Create `email-footer.tsx`
- [ ] Create `feature-card.tsx`
- [ ] Create `index.ts` barrel export
- [ ] Verify no flexbox properties used

## Success Criteria
- [ ] All 5 components created
- [ ] No `display: flex` in any component
- [ ] TypeScript compilation passes
- [ ] Components export correctly from barrel file

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing Row/Column imports | Medium | Code review checklist |
| Inconsistent styling | Low | Use existing style constants |

## Security Considerations
- No security concerns for this phase

## Next Steps
- Proceed to Phase 03: Template Migration
