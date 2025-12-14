# React Email Components and Best Practices for Gmail Compatibility

## Key Components and HTML Output
- **`@react-email/components`:** Provides React components for building email templates.
- **`Html`**: Root component for the email document.
- **`Head`**: Contains metadata like title, styles, etc.
- **`Body`**: The main content of the email.
- **`Text`**: Renders a `<p>` tag.
- **`Link`**: Renders an `<a>` tag.
- **`Img`**: Renders an `<img>` tag.
- **`Section`**: Renders a `<table>` with proper email styling.
- **`Row`**: Renders a `<tr>` table row.
- **`Column`**: Renders a `<td>` table cell.

## Row/Column vs. div with flex

### React Email Row/Column (Table-based)
```tsx
<Row>
  <Column style={{ width: '50%' }}>Left content</Column>
  <Column style={{ width: '50%' }}>Right content</Column>
</Row>
```
Renders as:
```html
<tr>
  <td style="width: 50%">Left content</td>
  <td style="width: 50%">Right content</td>
</tr>
```

### div with flex (NOT Gmail compatible)
```tsx
// ❌ DO NOT USE - Gmail strips flex
<div style={{ display: 'flex' }}>
  <div style={{ flex: 1 }}>Left</div>
  <div style={{ flex: 1 }}>Right</div>
</div>
```

### Comparison Summary
| Feature | Row/Column | div + flex |
|---------|------------|------------|
| Gmail support | ✅ Full | ❌ Stripped |
| Outlook support | ✅ Full | ❌ Broken |
| Mobile clients | ✅ Full | ⚠️ Varies |
| Modern browsers | ✅ Full | ✅ Full |

## CLI Setup with Custom Directory

### Command Options
```bash
# Development server
email dev --dir ./src/components/emails --port 3001

# Build for production
email build --dir ./src/components/emails

# Export to HTML files
email export --dir ./src/components/emails --outDir ./out
```

### package.json Script
```json
{
  "scripts": {
    "email:dev": "email dev --dir src/components/emails --port 3001"
  }
}
```

### CLI FAQs
- Static files go in `emails/static` (or your custom dir + `/static`)
- Preview props: Add `Email.PreviewProps = { ... }` to component
- Ignored folders: Prefix with underscore (e.g., `_components`)

## Component Patterns for Reusable Email Parts

### Recommended Structure
```
src/components/emails/
├── _components/           # Shared (ignored by preview)
│   ├── email-header.tsx
│   ├── email-footer.tsx
│   ├── email-button.tsx
│   └── index.ts
├── static/                # Images, fonts
├── nft/                   # Category subfolder
│   └── *.tsx
└── *.tsx                  # Email templates
```

### Wrapper Component Pattern
```tsx
// _components/email-layout.tsx
export const EmailLayout = ({ children, preview }) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader />
        {children}
        <EmailFooter />
      </Container>
    </Body>
  </Html>
)
```

## Gmail Compatibility Rules

### Supported
- Inline styles via `style` attribute
- Table-based layouts (`<table>`, `<tr>`, `<td>`)
- Basic CSS (color, background-color, font-size, padding, margin)
- HTML attributes (align, valign, width, height, bgcolor)

### NOT Supported
- `<style>` tags (often stripped)
- `display: flex` / `display: grid`
- `@media` queries (limited)
- `@import` / `@font-face`
- CSS custom properties (variables)
- `position: absolute/relative`

## Sources
- [React Email Documentation](https://react.email/docs)
- [React Email Components API](https://react.email/docs/components/html)
- [React Email CLI Reference](https://react.email/docs/cli)
