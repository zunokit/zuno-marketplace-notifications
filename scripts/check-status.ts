/**
 * Check System Status Script
 *
 * Displays the current status of the notification system:
 * - Database connection
 * - Notification counts by status
 * - Outbox counts by status
 * - Recent notifications
 *
 * Run: npx tsx scripts/check-status.ts
 */

import { PrismaClient } from '../src/infrastructure/database/generated'

const prisma = new PrismaClient()

async function main() {
  console.log('=== System Status ===\n')

  // Check database connection
  console.log('Database Connection:')
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('  ✓ Connected to PostgreSQL\n')
  } catch (error) {
    console.log('  ✗ Database connection failed')
    console.log('    Error:', error instanceof Error ? error.message : error)
    return
  }

  // Get notification counts
  console.log('Notifications:')
  const notificationStats = await prisma.notification.groupBy({
    by: ['status'],
    _count: true,
  })

  if (notificationStats.length === 0) {
    console.log('  No notifications found')
  } else {
    for (const stat of notificationStats) {
      console.log(`  - ${stat.status}: ${stat._count}`)
    }
  }

  const totalNotifications = await prisma.notification.count()
  console.log(`  Total: ${totalNotifications}\n`)

  // Get outbox counts
  console.log('Outbox:')
  const outboxStats = await prisma.outbox.groupBy({
    by: ['status'],
    _count: true,
  })

  if (outboxStats.length === 0) {
    console.log('  No outbox entries found')
  } else {
    for (const stat of outboxStats) {
      console.log(`  - ${stat.status}: ${stat._count}`)
    }
  }

  const totalOutbox = await prisma.outbox.count()
  console.log(`  Total: ${totalOutbox}\n`)

  // Get dead letter queue count
  const dlqCount = await prisma.deadLetterQueue.count()
  console.log(`Dead Letter Queue: ${dlqCount}\n`)

  // Recent notifications
  console.log('Recent Notifications (last 5):')
  const recentNotifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      user: {
        select: { email: true },
      },
    },
  })

  if (recentNotifications.length === 0) {
    console.log('  No notifications found')
  } else {
    for (const notif of recentNotifications) {
      const createdAt = notif.createdAt.toISOString().replace('T', ' ').substring(0, 19)
      console.log(`  - [${notif.status}] ${notif.type} to ${notif.user?.email || 'unknown'} (${createdAt})`)
    }
  }

  // Organizations
  console.log('\nOrganizations:')
  const orgs = await prisma.organization.findMany({
    include: {
      _count: {
        select: {
          users: true,
          notifications: true,
        },
      },
    },
  })

  if (orgs.length === 0) {
    console.log('  No organizations found')
  } else {
    for (const org of orgs) {
      console.log(`  - ${org.name} (${org.slug}): ${org._count.users} members, ${org._count.notifications} notifications`)
    }
  }

  // Templates
  console.log('\nTemplates:')
  const templates = await prisma.template.findMany({
    where: { isActive: true },
    select: {
      name: true,
      slug: true,
      channel: true,
      type: true,
    },
  })

  if (templates.length === 0) {
    console.log('  No active templates found')
  } else {
    for (const template of templates) {
      console.log(`  - ${template.name} (${template.slug}) - ${template.channel}/${template.type}`)
    }
  }

  console.log('\n=== End of Status ===')
}

main()
  .catch((e) => {
    console.error('Script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
