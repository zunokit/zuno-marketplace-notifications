/**
 * Process Outbox Script
 *
 * Manually processes pending outbox entries (simulates what the worker does).
 * Useful for testing the complete notification delivery flow.
 *
 * Run: npx tsx scripts/process-outbox.ts
 */

import { PrismaClient, Prisma } from '../src/infrastructure/database/generated'
import { EmailChannel } from '../src/infrastructure/channels/email/email.channel'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

type EmailPayload = {
  to: string
  subject?: string
  body: string
  from?: string
}

async function main() {
  console.log('=== Outbox Processor ===\n')

  const workerId = `manual-${nanoid(8)}`
  console.log('Worker ID:', workerId)
  console.log('')

  // Get pending outbox entries
  const pending = await prisma.outbox.findMany({
    where: {
      status: 'PENDING',
      scheduledAt: {
        lte: new Date(),
      },
    },
    include: {
      notification: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: 10,
  })

  if (pending.length === 0) {
    console.log('No pending outbox entries found.')
    console.log('')
    console.log('To create a test notification, run:')
    console.log('  npx tsx scripts/verify-notification-flow.ts')
    return
  }

  console.log(`Found ${pending.length} pending entries\n`)

  const emailChannel = new EmailChannel()
  let successCount = 0
  let failCount = 0

  for (const outbox of pending) {
    console.log(`Processing outbox ${outbox.id}...`)
    console.log(`  - Notification ID: ${outbox.notificationId}`)
    console.log(`  - Channel: ${outbox.channel}`)

    try {
      // Lock the entry
      await prisma.outbox.update({
        where: { id: outbox.id },
        data: {
          status: 'PROCESSING',
          lockedAt: new Date(),
          lockedBy: workerId,
          processingAt: new Date(),
        },
      })

      // Process based on channel
      if (outbox.channel === 'EMAIL') {
        const payload = outbox.payload as Prisma.JsonObject as EmailPayload

        console.log(`  - To: ${payload.to}`)
        console.log(`  - Subject: ${payload.subject || '(no subject)'}`)

        const result = await emailChannel.send({
          to: payload.to,
          subject: payload.subject,
          body: payload.body,
          from: payload.from,
        })

        if (result.success) {
          // Mark as processed
          await prisma.outbox.update({
            where: { id: outbox.id },
            data: {
              status: 'PROCESSED',
              processedAt: new Date(),
              lockedAt: null,
              lockedBy: null,
            },
          })

          // Update notification status
          await prisma.notification.update({
            where: { id: outbox.notificationId },
            data: {
              status: 'SENT',
              sentAt: new Date(),
            },
          })

          // Record delivery attempt
          await prisma.deliveryAttempt.create({
            data: {
              notificationId: outbox.notificationId,
              attemptNumber: 1,
              channel: outbox.channel,
              provider: emailChannel.getProvider().getName(),
              success: true,
              responseCode: 200,
              duration: result.duration,
              providerMessageId: result.providerMessageId,
              attemptedAt: new Date(),
            },
          })

          console.log(`  ✓ Sent successfully (${result.duration}ms)`)
          successCount++
        } else {
          throw new Error(result.error || 'Failed to send email')
        }
      } else {
        console.log(`  - Skipping unsupported channel: ${outbox.channel}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.log(`  ✗ Failed: ${errorMessage}`)

      // Mark as failed
      await prisma.outbox.update({
        where: { id: outbox.id },
        data: {
          status: 'FAILED',
          lastError: errorMessage,
          retryCount: { increment: 1 },
          lockedAt: null,
          lockedBy: null,
        },
      })

      // Record failed delivery attempt
      await prisma.deliveryAttempt.create({
        data: {
          notificationId: outbox.notificationId,
          attemptNumber: 1,
          channel: outbox.channel,
          provider: 'unknown',
          success: false,
          error: errorMessage,
          duration: 0,
          attemptedAt: new Date(),
        },
      })

      failCount++
    }

    console.log('')
  }

  // Summary
  console.log('=== Summary ===')
  console.log(`Processed: ${pending.length}`)
  console.log(`Success: ${successCount}`)
  console.log(`Failed: ${failCount}`)

  if (emailChannel.getProvider().getName() === 'mailpit') {
    console.log('')
    console.log('📧 View sent emails at: http://localhost:8025')
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
