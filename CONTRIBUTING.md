# Contributing to Zuno Marketplace Notifications

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Start Docker services**
   ```bash
   pnpm docker:up
   ```

3. **Run database migrations**
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

## Code Quality Standards

### Before Committing

Run these commands to ensure code quality:

```bash
pnpm typecheck  # TypeScript type checking
pnpm lint       # ESLint
pnpm test       # Jest tests
pnpm build      # Verify build succeeds
```

### Git Hooks

Pre-commit and pre-push hooks are automatically configured via Husky.

## Testing

- **Unit tests**: `pnpm test`
- **Integration tests**: `pnpm test tests/integration`
- **Coverage**: `pnpm test:ci`

Aim for ≥80% test coverage.

## Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes
3. Write tests
4. Ensure all checks pass
5. Create PR using the template
6. Address review comments
7. Squash and merge

## Questions?

Open an issue or ask in #notifications Slack channel.
