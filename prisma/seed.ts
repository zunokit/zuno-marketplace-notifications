import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

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
  console.log('Created organization:', org.name)

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
    },
  })
  console.log('Created user:', user.email)

  // Create membership
  const membership = await prisma.organizationMember.upsert({
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
  console.log('Created organization membership')

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
      body: '<h1>Welcome {{userName}}!</h1><p>We\'re excited to have you.</p>',
      variables: ['organizationName', 'userName'],
      createdBy: user.id,
      isActive: true,
    },
  })
  console.log('Created template:', template.name)

  // Create user preferences
  await prisma.userPreference.upsert({
    where: {
      userId_channel_type: {
        userId: user.id,
        channel: 'EMAIL',
        type: null,
      },
    },
    update: {},
    create: {
      userId: user.id,
      channel: 'EMAIL',
      enabled: true,
      frequency: 'REALTIME',
    },
  })
  console.log('Created user preferences')

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
  console.log('Created rate limit config')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
