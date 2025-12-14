# Gmail CSS Compatibility and Email Template Best Practices

## Summary of Gmail CSS Limitations
Gmail's rendering engine has significant limitations, often stripping modern CSS for security and rendering consistency across its varied clients (web, mobile apps). It primarily relies on inline styles and has poor support for `<style>` tags in the `<head>` (which are often stripped).

## Specific CSS Properties to Avoid
Avoid modern layout and positioning properties as they are largely unsupported or behave inconsistently:
-   `position`
-   `float`
-   `flexbox` (e.g., `display: flex`)
-   `grid` (e.g., `display: grid`)
-   `@media queries` (limited support, especially in older versions/clients)
-   `@import`
-   `@font-face`
-   Gmail also tends to remove `class` and `id` attributes in some contexts.

## Why Flexbox Doesn't Work in Gmail
Gmail's rendering engine is designed for older HTML and CSS standards to ensure broad compatibility and security. It strips out modern CSS properties like `display: flex` because they are not part of its supported stylesheet subset. This is a deliberate choice to prevent complex rendering issues and maintain control over how emails are displayed.

## Recommended Alternatives
-   **Table-based layouts**: The most reliable method for structuring email content. Use `<table>`, `<tr>`, and `<td>` elements for all structural layouts.
-   **Inline styles**: Apply all CSS directly to HTML elements using the `style` attribute (e.g., `<p style="font-family: Arial; font-size: 16px;">`). External and embedded stylesheets are often ignored or stripped.
-   **HTML attributes**: Utilize old-school HTML attributes like `align`, `valign`, `bgcolor`, and `width` for layout and styling where CSS is unreliable.

## Table-based Layout Patterns for Email Compatibility
When using tables for layout:
-   Set `cellpadding="0"`, `cellspacing="0"`, `border="0"` on all tables to prevent unwanted spacing.
-   Explicitly define `width` in pixels for tables and cells.
-   Use `role="presentation"` on layout tables for accessibility to indicate they are not data tables.

### Code Example: Basic Table-based Layout
```html
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding: 20px;">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="background-color: #f0f0f0; padding: 30px;">
            <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333333; margin: 0;">
              This is a compatible email content block.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

## Best Practices for Cross-Client Email Rendering
1.  **Test extensively**: Use tools like Litmus or Email on Acid to test across various email clients (Gmail, Outlook, Apple Mail, Yahoo, etc.) and devices.
2.  **Keep it simple**: The less complex your design, the more likely it will render consistently.
3.  **Max-width**: Aim for an overall email width around 600px for optimal viewing on most clients.
4.  **Responsive design**: Implement mobile-first design principles. While `@media queries` have limited support, fluid layouts and carefully chosen widths can help.

## MSO Conditional Comments for Outlook Compatibility
Microsoft Outlook (especially older desktop versions) uses its own rendering engine (Word), requiring specific hacks for compatibility.
Conditional comments are used to target or hide content specifically for Outlook:

### Code Example: MSO Conditional Comments
```html
<!--[if mso]>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td>
<![endif]-->
<div style="font-family: sans-serif; font-size: 16px;">
  Content visible in all clients.
</div>
<!--[if mso]>
    </td>
  </tr>
</table>
<![endif]-->

<!--[if mso]>
  <p style="font-family: Arial, sans-serif; color: blue;">This content is only for Outlook.</p>
<![endif]-->

<!--[if !mso]><!-->
  <p style="font-family: Arial, sans-serif; color: green;">This content is for non-Outlook clients.</p>
<!--<![endif]-->
```

## Sources:
-   [Campaign Monitor CSS Support Guide](https://www.campaignmonitor.com/css/)
-   [Can I Email - Flexbox](https://www.caniemail.com/features/css-flexbox/)
-   [Litmus - Understanding Conditional Comments in Email](https://www.litmus.com/blog/understanding-conditional-comments-in-email)