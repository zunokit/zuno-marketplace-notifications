# Git Workflow - Zuno Marketplace Notifications

**Document Version**: 1.0.0
**Last Updated**: 2025-01-06

---

## Overview

This document defines the **complete Git workflow** for the Zuno Marketplace Notifications project, including branch strategy, commit conventions, code review process, and release management.

---

## Branch Strategy

### Branch Types

```
main              # Production-ready code (protected)
├── develop       # Integration branch (protected)
│   ├── feature/  # New features
│   ├── fix/      # Bug fixes
│   ├── hotfix/   # Urgent production fixes
│   ├── refactor/ # Code refactoring
│   ├── docs/     # Documentation updates
│   └── test/     # Test improvements
```

### Branch Naming Convention

```
<type>/<ticket-id>-<short-description>

Examples:
feature/NOT-123-add-websocket-channel
fix/NOT-456-rate-limit-bug
hotfix/NOT-789-critical-email-failure
refactor/NOT-234-simplify-outbox-logic
docs/NOT-567-update-api-docs
test/NOT-890-add-retry-tests
```

#### Type Prefixes

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New functionality | `feature/NOT-123-sms-channel` |
| `fix/` | Bug fixes | `fix/NOT-456-template-render-bug` |
| `hotfix/` | Urgent production fixes | `hotfix/NOT-789-memory-leak` |
| `refactor/` | Code improvements (no behavior change) | `refactor/NOT-234-extract-service` |
| `docs/` | Documentation only | `docs/NOT-567-api-reference` |
| `test/` | Test additions/improvements | `test/NOT-890-integration-tests` |
| `chore/` | Maintenance tasks | `chore/NOT-345-update-deps` |
| `perf/` | Performance improvements | `perf/NOT-678-optimize-queries` |

---

## Conventional Commits

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples

#### Feature Commit
```
feat(email): add template versioning support

- Add version column to templates table
- Implement version history tracking
- Add migration for existing templates

Closes NOT-123
```

#### Bug Fix Commit
```
fix(rate-limit): prevent race condition in token bucket

The token bucket algorithm had a race condition when multiple
requests arrived simultaneously. Fixed by using Redis WATCH
for atomic operations.

Fixes NOT-456
```

#### Breaking Change
```
feat(api)!: change notification payload structure

BREAKING CHANGE: The notification payload now requires
`templateId` instead of embedding full template content.
Migrate existing code to reference templates by ID.

Closes NOT-789
```

### Commit Types

| Type | Description | Changelog |
|------|-------------|-----------|
| `feat` | New feature | Yes (minor) |
| `fix` | Bug fix | Yes (patch) |
| `docs` | Documentation only | No |
| `style` | Code style (formatting, no logic change) | No |
| `refactor` | Code refactoring (no behavior change) | No |
| `perf` | Performance improvement | Yes (patch) |
| `test` | Add/update tests | No |
| `build` | Build system changes | No |
| `ci` | CI/CD changes | No |
| `chore` | Maintenance tasks | No |
| `revert` | Revert previous commit | Yes |

### Scope Examples

- `email` - Email channel
- `websocket` - WebSocket channel
- `api` - API endpoints
- `db` - Database schema/migrations
- `auth` - Authentication/authorization
- `ui` - UI components
- `worker` - Background workers
- `outbox` - Outbox pattern
- `template` - Template system
- `rate-limit` - Rate limiting
- `ci` - CI/CD pipelines

### Commit Message Rules

1. **Subject line**:
   - Max 72 characters
   - Imperative mood ("add" not "added")
   - No period at end
   - Lowercase after colon

2. **Body** (optional):
   - Wrap at 72 characters
   - Explain "what" and "why", not "how"
   - Separate from subject with blank line

3. **Footer** (optional):
   - Reference issues: `Closes #123`, `Fixes #456`
   - Breaking changes: `BREAKING CHANGE: ...`
   - Co-authors: `Co-authored-by: Name <email>`

---

## Development Workflow

### 1. Start New Feature

```bash
# Ensure develop is up to date
git checkout develop
git pull origin develop

# Create feature branch from develop
git checkout -b feature/NOT-123-add-sms-channel

# Push branch to remote (tracking)
git push -u origin feature/NOT-123-add-sms-channel
```

### 2. Make Changes

```bash
# Make code changes
vim src/infrastructure/channels/sms/sms.channel.ts

# Stage changes
git add src/infrastructure/channels/sms/

# Commit with conventional message
git commit -m "feat(sms): add Twilio SMS channel

- Implement SMS channel interface
- Add Twilio provider integration
- Add rate limiting for SMS
- Update channel router

Closes NOT-123"
```

### 3. Keep Branch Updated

```bash
# Regularly rebase on develop to avoid conflicts
git fetch origin develop
git rebase origin/develop

# If conflicts, resolve and continue
git rebase --continue

# Force push (rebase changes history)
git push --force-with-lease
```

### 4. Pre-Push Checklist

**CRITICAL**: Run ALL checks before pushing:

```bash
# 1. Type check (must pass)
pnpm typecheck

# 2. Lint (must pass)
pnpm lint

# 3. Tests (must pass)
pnpm test --passWithNoTests

# 4. Build (must succeed)
pnpm build

# If all pass, push
git push origin feature/NOT-123-add-sms-channel
```

### 5. Create Pull Request

```bash
# Push final changes
git push origin feature/NOT-123-add-sms-channel

# Open PR on GitHub
# Use PR template (see below)
```

---

## Pull Request Template

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description

<!-- Provide a concise description of the changes -->

Closes #[issue-number]

## Type of Change

<!-- Mark with [x] -->

- [ ] 🚀 New feature (non-breaking change adding functionality)
- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] 💥 Breaking change (fix or feature causing existing functionality to break)
- [ ] 📝 Documentation update
- [ ] ♻️ Refactoring (no functional changes)
- [ ] ✅ Test improvements
- [ ] 🏗️ Chore (dependencies, build, CI/CD)

## Changes Made

<!-- List key changes -->

- Added SMS channel implementation
- Integrated Twilio provider
- Updated channel router to support SMS
- Added rate limiting for SMS

## Testing

<!-- Describe testing performed -->

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed
- [ ] Tested in local environment
- [ ] Tested with Docker Compose

### Test Coverage

<!-- If applicable -->

- Before: 85%
- After: 87%

## Screenshots

<!-- If UI changes, add screenshots -->

## Breaking Changes

<!-- If breaking changes, describe migration path -->

None

## Checklist

<!-- All must be checked before merge -->

- [ ] Code follows project style guidelines
- [ ] Self-review performed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated and passing
- [ ] All CI checks passing
- [ ] Branch is up to date with `develop`
- [ ] No merge conflicts

## Reviewer Notes

<!-- Any special instructions for reviewers -->

Please pay special attention to the rate limiting logic in `sms.channel.ts`.

## Related PRs

<!-- Link related PRs if any -->

- #123 (depends on this)
- #456 (related)
```

---

## Code Review Process

### Review Checklist for Reviewers

#### Functionality
- [ ] Code works as described
- [ ] Edge cases handled
- [ ] Error handling is comprehensive
- [ ] No obvious bugs

#### Code Quality
- [ ] Follows coding standards ([29-CODING-STANDARDS.md](./29-CODING-STANDARDS.md))
- [ ] No code duplication (DRY principle)
- [ ] Functions are single-purpose (SRP)
- [ ] Names are descriptive and clear
- [ ] Comments explain "why", not "what"

#### Architecture
- [ ] Follows Clean Architecture layers
- [ ] Dependencies point in correct direction
- [ ] No circular dependencies
- [ ] Separation of concerns maintained

#### Security
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] SQL injection prevented (Prisma)
- [ ] XSS prevention (React escaping)
- [ ] Authentication/authorization correct

#### Performance
- [ ] No N+1 queries
- [ ] Indexes added for new queries
- [ ] Caching used where appropriate
- [ ] No memory leaks

#### Testing
- [ ] Unit tests present
- [ ] Integration tests present (if needed)
- [ ] Test coverage ≥ 80%
- [ ] Tests are meaningful (not just for coverage)

#### Documentation
- [ ] README updated (if needed)
- [ ] API docs updated (if API changed)
- [ ] JSDoc comments for public APIs
- [ ] Migration guide (if breaking change)

### Review Comments

#### Approval States

| State | Meaning | Action |
|-------|---------|--------|
| **Approved** | Ready to merge | Author can merge |
| **Request Changes** | Requires fixes | Author must address |
| **Comment** | Suggestions only | Author can ignore or address |

#### Comment Categories

```
💡 Suggestion: Consider using a Map instead of object for better performance
❓ Question: Why did you choose this approach?
🐛 Bug: This will fail when array is empty
🔒 Security: This input needs validation
⚡ Performance: This causes N+1 query
📝 Docs: Add JSDoc comment for this function
✨ Praise: Great abstraction!
```

### Addressing Review Comments

```bash
# Make requested changes
git add .
git commit -m "refactor(sms): address review comments

- Use Map instead of object for provider registry
- Add input validation for phone numbers
- Add JSDoc comments

Co-authored-by: Reviewer Name <reviewer@example.com>"

# Push changes
git push origin feature/NOT-123-add-sms-channel
```

---

## Merging Strategy

### Merge Methods

#### 1. Squash and Merge (Recommended for Features)

**When**: Feature branches with many small commits

**Result**: Single commit on develop

```bash
# GitHub UI: "Squash and merge"
# Commit message:
feat(sms): add Twilio SMS channel (#123)

- Implement SMS channel interface
- Add Twilio provider integration
- Add rate limiting for SMS
- Update channel router

Co-authored-by: Contributor <email>
```

#### 2. Rebase and Merge (For Clean History)

**When**: Branch has clean, atomic commits

**Result**: All commits added to develop

```bash
# GitHub UI: "Rebase and merge"
# Preserves individual commit messages
```

#### 3. Merge Commit (Never Use)

**When**: Never (creates unnecessary merge commits)

### After Merge

```bash
# Delete remote branch (GitHub UI or command)
git push origin --delete feature/NOT-123-add-sms-channel

# Switch to develop and pull
git checkout develop
git pull origin develop

# Delete local branch
git branch -d feature/NOT-123-add-sms-channel
```

---

## Hotfix Workflow

### Critical Production Bug

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/NOT-999-critical-email-failure

# 2. Fix bug
vim src/infrastructure/channels/email/email.channel.ts

# 3. Commit
git commit -m "fix(email)!: prevent null pointer in template rendering

CRITICAL: Email sending was failing when template had no subject.
Added null check and default fallback.

Fixes NOT-999"

# 4. Test thoroughly
pnpm test
pnpm build

# 5. Push
git push origin hotfix/NOT-999-critical-email-failure

# 6. Create PR to main (fast-track review)

# 7. After merge to main, also merge to develop
git checkout develop
git pull origin main
git push origin develop
```

---

## Release Management

### Versioning (Semantic Versioning)

```
MAJOR.MINOR.PATCH

Example: 1.2.3

- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)
```

### Release Process

```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. Update version
npm version minor  # or major/patch

# 3. Update CHANGELOG.md
cat >> CHANGELOG.md <<EOF
## [1.2.0] - 2025-01-15

### Added
- SMS channel support (NOT-123)
- Template versioning (NOT-234)

### Fixed
- Rate limit race condition (NOT-456)

### Changed
- Improved retry backoff algorithm (NOT-567)
EOF

# 4. Commit changes
git commit -am "chore(release): prepare v1.2.0"

# 5. Merge to main
git checkout main
git merge --no-ff release/v1.2.0

# 6. Tag release
git tag -a v1.2.0 -m "Release v1.2.0

- SMS channel support
- Template versioning
- Rate limit fixes"

# 7. Push to remote
git push origin main --tags

# 8. Merge back to develop
git checkout develop
git merge --no-ff release/v1.2.0
git push origin develop

# 9. Delete release branch
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

### GitHub Release

```bash
# Create GitHub release from tag
gh release create v1.2.0 \
  --title "v1.2.0 - SMS Channel Support" \
  --notes "$(cat CHANGELOG.md | grep -A 20 '## \[1.2.0\]')"
```

---

## Troubleshooting

### Undo Last Commit (Not Pushed)

```bash
# Keep changes
git reset --soft HEAD~1

# Discard changes
git reset --hard HEAD~1
```

### Revert Pushed Commit

```bash
# Create revert commit
git revert <commit-hash>
git push origin develop
```

### Resolve Merge Conflicts

```bash
# Fetch latest develop
git fetch origin develop

# Rebase on develop
git rebase origin/develop

# Conflicts? Resolve in editor, then:
git add .
git rebase --continue

# Force push (history changed)
git push --force-with-lease
```

### Accidentally Committed to Wrong Branch

```bash
# Move commits to correct branch
git checkout correct-branch
git cherry-pick <commit-hash>

# Remove from wrong branch
git checkout wrong-branch
git reset --hard HEAD~1
```

### Clean Up Old Branches

```bash
# List merged branches
git branch --merged develop

# Delete local merged branches
git branch --merged develop | grep -v "\* develop" | xargs -n 1 git branch -d

# Prune deleted remote branches
git fetch --prune
```

---

## Best Practices

### Commit Frequency

- ✅ **DO**: Commit frequently (atomic changes)
- ✅ **DO**: Commit after each logical change
- ❌ **DON'T**: Commit half-finished work
- ❌ **DON'T**: Commit commented-out code

### Commit Size

- ✅ **Small**: One logical change per commit
- ❌ **Large**: Multiple unrelated changes

### Branch Lifetime

- ✅ **Short-lived**: < 3 days ideal, < 1 week max
- ❌ **Long-lived**: Merge conflicts accumulate

### Rebase vs Merge

- ✅ **Rebase**: Updating feature branch with develop
- ✅ **Merge**: Integrating feature into develop (via PR)
- ❌ **Rebase**: Public branches (main, develop)

### Force Push

- ✅ **Safe**: `git push --force-with-lease` (checks remote hasn't changed)
- ❌ **Dangerous**: `git push --force` (can overwrite others' work)

---

## Git Aliases (Optional)

Add to `~/.gitconfig`:

```ini
[alias]
  # Status
  st = status -sb

  # Logs
  lg = log --graph --oneline --decorate --all
  last = log -1 HEAD --stat

  # Branches
  br = branch -v
  brd = branch -d

  # Commits
  cm = commit -m
  ca = commit --amend

  # Rebase
  rb = rebase
  rbc = rebase --continue
  rba = rebase --abort

  # Push/Pull
  po = push origin
  pof = push origin --force-with-lease
  pl = pull origin

  # Cleanup
  cleanup = "!git branch --merged develop | grep -v '\\* develop' | xargs -n 1 git branch -d"
```

---

## Related Documents

- [29-CODING-STANDARDS.md](./29-CODING-STANDARDS.md) - Coding conventions
- [04-PROJECT-SETUP.md](./04-PROJECT-SETUP.md) - Git repository setup
- [26-CICD-PIPELINE.md](./26-CICD-PIPELINE.md) - CI/CD workflows

---

## Quick Reference

### Common Commands

```bash
# Start feature
git checkout develop && git pull && git checkout -b feature/NOT-123-description

# Commit
git add . && git commit -m "feat(scope): description"

# Keep updated
git fetch origin develop && git rebase origin/develop

# Pre-push
pnpm typecheck && pnpm lint && pnpm test && pnpm build

# Push
git push origin feature/NOT-123-description

# After merge
git checkout develop && git pull && git branch -d feature/NOT-123-description
```

### Conventional Commit Template

```
<type>(<scope>): <subject>

<body>

Closes #<issue>
```

---

**Remember**: Clean Git history makes debugging easier and code reviews faster. Commit early, commit often, and write meaningful messages! 🚀
