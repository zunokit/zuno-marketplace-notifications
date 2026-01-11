# Codebase Summary

This document provides a high-level overview of the codebase.

## Recent Changes (Phase 04: Email Gmail Compatibility - Integration & Cleanup)

- **Email Templates Location:** All email templates have been successfully migrated from `src/emails/` to `src/components/emails/`.
- **New Structure:**
    - Common email components are now located in `src/components/emails/common/`.
    - NFT-specific email templates are in `src/components/emails/nft/`.
    - Email preview files are found in `src/components/emails/preview/`.
- **Deleted Folder:** The old `src/emails/` directory and its contents have been removed.
- **Affected File:** `src/infrastructure/templates/template.service.ts` has been updated to reflect the new import paths for email templates.

## Further Details

For a detailed breakdown of the codebase, refer to the `repomix-output.xml` file located at `E:\zuno-marketplace-notifications\repomix-output.xml`.
