/**
 * Verify Notification Flow Test Script
 *
 * This script tests the complete notification flow:
 * 1. Creates a test notification via the SendNotificationUseCase
 * 2. Verifies the notification is created in the database
 * 3. Verifies the outbox entry is created
 * 4. Optionally processes the outbox entry
 *
 * Run: npx tsx scripts/verify-notification-flow.ts
 */

import { PrismaClient } from '../src/infrastructure/database/generated'
import { SendNotificationUseCase } from '../src/core/use-cases/notifications/send-notification.use-case'

const prisma = new PrismaClient()

async function main() {
  console.log('=== Notification Flow Verification ===\n')

  // Step 1: Get or create test organization and user
  console.log('Step 1: Setting up test data...')

  let org = await prisma.organization.findFirst({
    where: { slug: 'test-org' },
  })

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        slug: 'test-org',
        isActive: true,
      },
    })
    console.log('  ✓ Created test organization:', org.id)
  } else {
    console.log('  ✓ Using existing organization:', org.id)
  }

  let user = await prisma.user.findFirst({
    where: { email: 'test@example.com' },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    })
    console.log('  ✓ Created test user:', user.id)

    // Create organization membership
    await prisma.organizationMember.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: 'OWNER',
      },
    })
    console.log('  ✓ Created organization membership')
  } else {
    console.log('  ✓ Using existing user:', user.id)
  }

  // Step 2: Send a test notification
  console.log('\nStep 2: Sending test notification...')

  const useCase = new SendNotificationUseCase()
  const idempotencyKey = `test-${Date.now()}`

  try {
    const notification = await useCase.execute({
      organizationId: org.id,
      userId: user.id,
      type: 'WELCOME',
      channel: 'EMAIL',
      priority: 'NORMAL',
      payload: {
        to: user.email,
        subject: 'Test Notification',
        body: '<h1>Hello!</h1><p>This is a test notification.</p>',
      },
      idempotencyKey,
    })

    console.log('  ✓ Notification created:')
    console.log('    - ID:', notification.id)
    console.log('    - Status:', notification.status)
    console.log('    - Correlation ID:', notification.correlationId)

    // Step 3: Verify outbox entry
    console.log('\nStep 3: Verifying outbox entry...')

    const outbox = await prisma.outbox.findFirst({
      where: { notificationId: notification.id },
    })

    if (outbox) {
      console.log('  ✓ Outbox entry found:')
      console.log('    - Outbox ID:', outbox.id)
      console.log('    - Status:', outbox.status)
      console.log('    - Channel:', outbox.channel)
    } else {
      console.log('  ✗ No outbox entry found!')
    }

    // Step 4: Check delivery attempts
    console.log('\nStep 4: Checking delivery attempts...')

    const attempts = await prisma.deliveryAttempt.findMany({
      where: { notificationId: notification.id },
      orderBy: { attemptedAt: 'desc' },
    })

    if (attempts.length > 0) {
      console.log(`  ✓ Found ${attempts.length} delivery attempt(s):`)
      for (const attempt of attempts) {
        console.log(`    - Attempt #${attempt.attemptNumber}: ${attempt.success ? 'Success' : 'Failed'}`)
      }
    } else {
      console.log('  - No delivery attempts yet (waiting for worker)')
    }

    // Step 5: Summary
    console.log('\n=== Summary ===')
    console.log('Notification ID:', notification.id)
    console.log('Outbox ID:', outbox?.id || 'N/A')
    console.log('Status:', notification.status)
    console.log('')
    console.log('To process this notification, run the outbox worker:')
    console.log('  npx tsx scripts/process-outbox.ts')

  } catch (error) {
    console.error('  ✗ Error:', error instanceof Error ? error.message : error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('Script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
