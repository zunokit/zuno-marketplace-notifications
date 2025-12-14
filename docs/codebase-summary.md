# Codebase Summary

This document provides a high-level overview of the codebase.

## Recent Changes (Phase 03: Email Gmail Compatibility - Template Migration)

- **Email Templates:** 8 Gmail-compatible email templates have been migrated to use a consistent Row/Column layout.
- **Styling:** Gradients in email templates have been replaced with solid colors for broader email client compatibility.
- **Affected Files:**
    - `src/components/emails/welcome-email.tsx`
    - `src/components/emails/auction-won-email.tsx`
    - `src/components/emails/nft/auction-outbid-email.tsx`
    - `src/components/emails/nft/drop-announcement-email.tsx`
    - `src/components/emails/nft/floor-price-drop-email.tsx`
    - `src/components/emails/nft/mint-success-email.tsx`
    - `src/components/emails/nft/royalty-received-email.tsx`
    - `src/components/emails/nft/whitelist-approved-email.tsx`
    - `src/components/emails/preview/*.tsx` (8 preview files)
    - `src/components/emails/common/email-footer.tsx` (fixed nested p tag)

## Further Details

For a detailed breakdown of the codebase, refer to the `repomix-output.xml` file located at `E:\zuno-marketplace-notifications\repomix-output.xml`.
