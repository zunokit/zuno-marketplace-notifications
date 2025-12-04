/* eslint-disable no-console */
import { hashPassword } from 'better-auth/crypto'
import { PrismaClient } from '@/infrastructure/database/prisma'

const prisma = new PrismaClient()

function getApiKeysFromEnv(): string[] {
  const apiKeysEnv = process.env.API_KEYS || ''
  return apiKeysEnv
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
}

async function main() {
  console.log('🌱 Seeding database...')

  // Create test organization
  const org = await prisma.organization.upsert({
    where: { slug: 'test-org' },
    update: {},
    create: {
      name: 'Test Organization',
      slug: 'test-org',
      isActive: true,
    },
  })
  console.log('✓ Created organization:', org.name)

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
    },
  })
  console.log('✓ Created user:', user.email)

  // Create organization membership
  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: user.id,
      role: 'OWNER',
    },
  })
  console.log('✓ Created organization membership')

  // Create test template
  const template = await prisma.template.upsert({
    where: {
      organizationId_slug_version: {
        organizationId: org.id,
        slug: 'welcome-email',
        version: 1,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Welcome Email',
      slug: 'welcome-email',
      channel: 'EMAIL',
      type: 'WELCOME',
      subject: 'Welcome to {{organizationName}}!',
      body: "<h1>Welcome {{userName}}!</h1><p>We're excited to have you.</p>",
      variables: ['organizationName', 'userName'],
      createdBy: user.id,
      isActive: true,
    },
  })
  console.log('✓ Created template:', template.name)

  // Create user preferences for WELCOME notifications
  await prisma.userPreference.upsert({
    where: {
      userId_channel_type: {
        userId: user.id,
        channel: 'EMAIL',
        type: 'WELCOME',
      },
    },
    update: {},
    create: {
      userId: user.id,
      channel: 'EMAIL',
      type: 'WELCOME',
      enabled: true,
      frequency: 'REALTIME',
    },
  })
  console.log('✓ Created user preferences')

  // Create rate limit config
  await prisma.rateLimitConfig.upsert({
    where: {
      organizationId_channel: {
        organizationId: org.id,
        channel: 'EMAIL',
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      channel: 'EMAIL',
      maxPerMinute: 100,
      maxPerHour: 1000,
      maxPerDay: 10000,
      isActive: true,
    },
  })
  console.log('✓ Created rate limit config')

  // Seed API keys from environment variable
  const apiKeys = getApiKeysFromEnv()
  if (apiKeys.length > 0) {
    console.log(`🔑 Seeding ${apiKeys.length} API key(s)...`)

    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i]
      const keyPrefix = apiKey.substring(0, 8)
      const keyHash = await hashPassword(apiKey)
      const keyName = `Seeded API Key ${i + 1}`

      // Check if API key with this prefix already exists
      const existingKey = await prisma.apiKey.findFirst({
        where: { keyPrefix },
      })

      if (existingKey) {
        // Update the existing key hash
        await prisma.apiKey.update({
          where: { id: existingKey.id },
          data: {
            keyHash,
            isActive: true,
            revokedAt: null,
            revokedBy: null,
          },
        })
        console.log(`✓ Updated API key: ${keyPrefix}...`)
      } else {
        await prisma.apiKey.create({
          data: {
            name: keyName,
            keyHash,
            keyPrefix,
            scopes: ['*'], // Full access
            isActive: true,
            createdBy: user.id,
            organization: {
              connect: { id: org.id },
            },
          },
        })
        console.log(`✓ Created API key: ${keyPrefix}...`)
      }
    }
  } else {
    console.log('ℹ No API_KEYS environment variable set, skipping API key seeding')
  }

  console.log('✨ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
