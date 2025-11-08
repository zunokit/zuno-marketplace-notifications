# Project Setup Guide - Zuno Marketplace Notifications

**Document Version**: 1.0.0
**Last Updated**: 2025-01-06

---

## Prerequisites

### Required Software

| Tool | Version | Purpose | Installation |
|------|---------|---------|--------------|
| **Node.js** | 18.17.0+ | Runtime environment | [nodejs.org](https://nodejs.org) |
| **pnpm** | 8.0.0+ | Package manager | `npm install -g pnpm` |
| **Git** | 2.30.0+ | Version control | [git-scm.com](https://git-scm.com) |
| **Docker** | 20.10.0+ | Local services | [docker.com](https://docker.com) |
| **Docker Compose** | 2.0.0+ | Multi-container orchestration | Included with Docker Desktop |
| **VS Code** | Latest | IDE (recommended) | [code.visualstudio.com](https://code.visualstudio.com) |

### Accounts Required

1. **NeonDB** - PostgreSQL hosting ([neon.tech](https://neon.tech))
2. **Resend** - Email provider ([resend.com](https://resend.com))
3. **Vercel** (optional) - Deployment ([vercel.com](https://vercel.com))
4. **GitHub** - Version control and CI/CD

---

## Step 1: Initialize Next.js Project

```bash
# Navigate to project directory
cd /e/zuno-marketplace-notifications

# Initialize Next.js 16 with TypeScript
pnpm create next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# Prompts:
# ✔ Would you like to use TypeScript? › Yes
# ✔ Would you like to use ESLint? › Yes
# ✔ Would you like to use Tailwind CSS? › Yes
# ✔ Would you like to use `src/` directory? › Yes
# ✔ Would you like to use App Router? › Yes
# ✔ Would you like to customize the default import alias? › No

# Verify installation
pnpm dev
# Visit http://localhost:3000
```

---

## Step 2: Install Core Dependencies

### Production Dependencies

```bash
# Database & ORM
pnpm add @prisma/client@latest
pnpm add -D prisma@latest

# Authentication
pnpm add better-auth@latest

# Data Fetching
pnpm add @tanstack/react-query@latest
pnpm add @tanstack/react-query-devtools@latest

# UI Components
pnpm add @radix-ui/react-alert-dialog@latest
pnpm add @radix-ui/react-dialog@latest
pnpm add @radix-ui/react-dropdown-menu@latest
pnpm add @radix-ui/react-label@latest
pnpm add @radix-ui/react-select@latest
pnpm add @radix-ui/react-slot@latest
pnpm add @radix-ui/react-tabs@latest
pnpm add @radix-ui/react-toast@latest
pnpm add @radix-ui/react-tooltip@latest
pnpm add class-variance-authority@latest
pnpm add clsx@latest
pnpm add tailwind-merge@latest
pnpm add lucide-react@latest

# TanStack Table
pnpm add @tanstack/react-table@latest

# Email
pnpm add resend@latest
pnpm add react-email@latest
pnpm add @react-email/components@latest

# Validation
pnpm add zod@latest

# Utilities
pnpm add date-fns@latest
pnpm add nanoid@latest
pnpm add bcrypt@latest
pnpm add ws@latest
pnpm add redis@latest

# Logging
pnpm add winston@latest
pnpm add winston-daily-rotate-file@latest

# Template Engine
pnpm add handlebars@latest

# Environment Variables
pnpm add dotenv@latest
pnpm add zod@latest
```

### Development Dependencies

```bash
# TypeScript Types
pnpm add -D @types/node@latest
pnpm add -D @types/react@latest
pnpm add -D @types/react-dom@latest
pnpm add -D @types/bcrypt@latest
pnpm add -D @types/ws@latest

# Testing
pnpm add -D jest@latest
pnpm add -D @testing-library/react@latest
pnpm add -D @testing-library/jest-dom@latest
pnpm add -D @testing-library/user-event@latest
pnpm add -D jest-environment-jsdom@latest
pnpm add -D msw@latest

# Linting & Formatting
pnpm add -D eslint@latest
pnpm add -D eslint-config-next@latest
pnpm add -D eslint-config-prettier@latest
pnpm add -D prettier@latest
pnpm add -D prettier-plugin-tailwindcss@latest

# Git Hooks
# Note: Git hooks are optional and can be configured manually if needed

# Type Checking
pnpm add -D typescript@latest
```

---

## Step 3: Initialize Prisma

```bash
# Initialize Prisma
pnpm prisma init

# This creates:
# - prisma/schema.prisma
# - .env (with DATABASE_URL placeholder)
```

### Configure Prisma Schema

Create `prisma/schema.prisma` (see [03-DATABASE-SCHEMA.md](./03-DATABASE-SCHEMA.md) for complete schema).

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ... Add all models from DATABASE-SCHEMA.md
```

---

## Step 4: Set Up NeonDB

### Create Database

1. Visit [neon.tech](https://neon.tech) and sign up
2. Create new project: `zuno-notifications`
3. Copy connection string

### Configure Environment Variables

Create `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://user:password@host.neon.tech/db?sslmode=require"

# Better-Auth
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3000"

# Resend (Email)
RESEND_API_KEY="re_..."

# Mailpit (Local Email Testing)
MAILPIT_SMTP_HOST="localhost"
MAILPIT_SMTP_PORT="1025"

# Redis (Rate Limiting)
REDIS_URL="redis://localhost:6379"

# Application
NODE_ENV="development"
PORT="3000"

# Logging
LOG_LEVEL="debug"

# Feature Flags
ENABLE_WEBSOCKET="true"
ENABLE_PUSH="false"
ENABLE_SMS="false"
```

### Generate Prisma Client

```bash
# Generate Prisma client
pnpm prisma generate

# Run initial migration
pnpm prisma migrate dev --name init

# Seed database (optional)
pnpm prisma db seed
```

---

## Step 5: Initialize Git Repository

```bash
# Initialize Git
git init

# Create .gitignore
cat > .gitignore <<EOF
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage
.nyc_output

# Next.js
.next
out
build
dist

# Production
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Environment
.env
.env.local
.env.*.local

# Database
prisma/*.db
prisma/*.db-journal

# IDE
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
.idea
*.swp
*.swo
*~
.DS_Store

# Misc
.turbo
.cache
EOF

# Create initial commit
git add .
git commit -m "chore: initial project setup"

# Create develop branch
git checkout -b develop
```

---

## Step 6: Configure TypeScript

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/core/*": ["./src/core/*"],
      "@/infrastructure/*": ["./src/infrastructure/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/app/*": ["./src/app/*"]
    },
    "forceConsistentCasingInFileNames": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Step 7: Configure ESLint & Prettier

### ESLint Configuration

Create `.eslintrc.json`:

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "pathGroups": [
          {
            "pattern": "react",
            "group": "external",
            "position": "before"
          },
          {
            "pattern": "@/**",
            "group": "internal"
          }
        ],
        "pathGroupsExcludedImportTypes": ["react"],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ]
  }
}
```

### Prettier Configuration

Create `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "always",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Create `.prettierignore`:

```
node_modules
.next
build
dist
coverage
.env*
```

---

## Step 8: Set Up Docker Compose


---

## Step 9: Add Custom Scripts

Update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "typecheck": "tsc --noEmit",
    "test": "jest --watch",
    "test:ci": "jest --ci --coverage",
    "test:e2e": "playwright test",

    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",

    "worker:outbox": "tsx src/workers/outbox-poller.worker.ts",
    "worker:retry": "tsx src/workers/retry.worker.ts",
    "workers": "concurrently \"pnpm worker:outbox\" \"pnpm worker:retry\"",

    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f"
  }
}
```

---

## Step 10: Set Up Docker Compose

Create `docker-compose.yml` (see [24-DOCKER-COMPOSE.md](./24-DOCKER-COMPOSE.md) for complete configuration):

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: notifications_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  mailpit:
    image: axllent/mailpit:latest
    ports:
      - "1025:1025" # SMTP
      - "8025:8025" # Web UI
    environment:
      MP_SMTP_AUTH_ACCEPT_ANY: 1
      MP_SMTP_AUTH_ALLOW_INSECURE: 1

volumes:
  postgres_data:
  redis_data:
```

```bash
# Start services
pnpm docker:up

# Verify services are running
docker-compose ps

# View logs
pnpm docker:logs

# Access Mailpit UI
open http://localhost:8025
```

---

## Step 11: Initialize shadcn/ui

```bash
# Initialize shadcn/ui
pnpm dlx shadcn-ui@latest init

# Prompts:
# ✔ Would you like to use TypeScript? › yes
# ✔ Which style would you like to use? › Default
# ✔ Which color would you like to use as base color? › Slate
# ✔ Where is your global CSS file? › src/app/globals.css
# ✔ Would you like to use CSS variables for colors? › yes
# ✔ Are you using a custom tailwind prefix? › no
# ✔ Where is your tailwind.config.js located? › tailwind.config.ts
# ✔ Configure the import alias for components? › @/components
# ✔ Configure the import alias for utils? › @/lib/utils

# Add essential components
pnpm dlx shadcn-ui@latest add button
pnpm dlx shadcn-ui@latest add card
pnpm dlx shadcn-ui@latest add dialog
pnpm dlx shadcn-ui@latest add input
pnpm dlx shadcn-ui@latest add label
pnpm dlx shadcn-ui@latest add select
pnpm dlx shadcn-ui@latest add table
pnpm dlx shadcn-ui@latest add tabs
pnpm dlx shadcn-ui@latest add toast
pnpm dlx shadcn-ui@latest add dropdown-menu
```

---

## Step 12: Create Directory Structure

```bash
# Create core directory structure
mkdir -p src/{core,infrastructure,components,lib,workers}
mkdir -p src/core/{domain,use-cases,services}
mkdir -p src/core/domain/{entities,value-objects,events}
mkdir -p src/infrastructure/{repositories,channels,outbox}
mkdir -p src/infrastructure/channels/{email,websocket,push,sms}
mkdir -p src/components/{admin,shared}
mkdir -p src/lib/{utils,auth,logger}
mkdir -p src/app/{api,admin,webhooks}
mkdir -p prisma/{migrations,seeds}
mkdir -p tests/{unit,integration,e2e}
mkdir -p docs
```

See [05-DIRECTORY-STRUCTURE.md](./05-DIRECTORY-STRUCTURE.md) for complete structure.

---

## Step 13: Create Environment Configuration

Create `src/lib/config/env.ts`:

```typescript
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  RESEND_API_KEY: z.string().startsWith('re_'),
  REDIS_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

export const env = envSchema.parse(process.env)
```

---

## Step 14: Verify Setup

```bash
# 1. Type check
pnpm typecheck

# 2. Lint
pnpm lint

# 3. Build
pnpm build

# 4. Database connection
pnpm prisma db push

# 5. Start development server
pnpm dev

# 6. Start background workers (separate terminal)
pnpm workers

# 7. Open browser
open http://localhost:3000
```

---

## Step 15: Create Initial Commit

```bash
# Stage all changes
git add .

# Commit with conventional commit message
git commit -m "chore: complete project setup

- Initialize Next.js 16 with TypeScript
- Configure Prisma with NeonDB
- Set up shadcn/ui components
- Configure ESLint, Prettier
- Add Docker Compose for local services
- Create directory structure
- Add custom scripts
- Configure environment validation"

# Push to remote
git push origin develop
```

---

## Troubleshooting

### Issue: Prisma Client Generation Fails

```bash
# Clear Prisma cache
rm -rf node_modules/.prisma

# Regenerate client
pnpm prisma generate
```

### Issue: Docker Services Not Starting

```bash
# Check for port conflicts
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :8025  # Mailpit

# Stop conflicting services
brew services stop postgresql  # macOS
```

### Issue: TypeScript Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

---

## Next Steps

1. ✅ Complete initial setup (this document)
2. 📄 Review [05-DIRECTORY-STRUCTURE.md](./05-DIRECTORY-STRUCTURE.md)
3. 🔐 Set up [06-AUTHENTICATION.md](./06-AUTHENTICATION.md)
4. 🚀 Begin [31-PHASE-1-FOUNDATION.md](./31-PHASE-1-FOUNDATION.md)

---

## Checklist

- [ ] Node.js 18+ installed
- [ ] pnpm installed
- [ ] Docker Desktop installed
- [ ] NeonDB account created
- [ ] Resend account created
- [ ] Next.js project initialized
- [ ] All dependencies installed
- [ ] Prisma configured
- [ ] Git repository initialized
- [ ] Docker Compose services running
- [ ] shadcn/ui initialized
- [ ] Environment variables configured
- [ ] Initial commit created
- [ ] Development server running
- [ ] Database migrations applied
- [ ] Type checking passes
- [ ] Linting passes

---

**Related Documents**:
- [05-DIRECTORY-STRUCTURE.md](./05-DIRECTORY-STRUCTURE.md)
- [24-DOCKER-COMPOSE.md](./24-DOCKER-COMPOSE.md)
- [28-ENVIRONMENT-CONFIG.md](./28-ENVIRONMENT-CONFIG.md)
