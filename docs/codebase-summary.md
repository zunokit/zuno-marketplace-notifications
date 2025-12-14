# Codebase Summary

This document provides a high-level overview of the codebase, with a focus on recently added or modified components.

## Email Gmail Compatibility - Phase 02: Shared Components

New shared email components have been introduced to enhance Gmail compatibility and streamline email templating. These components are designed for reusability across various email types.

### Components:
- **EmailHeader**: Standardized header for all emails.
- **HeroSection**: A prominent section typically used for key messages or calls to action.
- **EmailButton**: Reusable button component for consistent styling and functionality.
- **EmailFooter**: Standardized footer for all emails, including legal disclaimers and contact information.
- **FeatureCard**: Component for showcasing individual features or highlights within an email.

### Usage:
These components can be imported from `src/components/emails/common`.

### Files Created:
- `src/components/emails/common/email-header.tsx`
- `src/components/emails/common/hero-section.tsx`
- `src/components/emails/common/email-button.tsx`
- `src/components/emails/common/email-footer.tsx`
- `src/components/emails/common/feature-card.tsx`
- `src/components/emails/common/index.ts` (barrel export)
- `src/components/emails/test-components-email.tsx` (test email for shared components)

This summary will be expanded as more codebase changes occur.
