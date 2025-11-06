import { nanoid } from 'nanoid'

import { OutboxRepository } from '@/infrastructure/outbox/outbox.repository'
import { OutboxService } from '@/infrastructure/outbox/outbox.service'
import { NotificationRepository } from '@/infrastructure/repositories/notification.repository'
import { ChannelRouter } from '@/infrastructure/channels/channel-router'
import { logger } from '@/lib/logger/logger'

const WORKER_ID = `outbox-worker-${nanoid()}`
const POLL_INTERVAL_MS = 5000 // 5 seconds
const BATCH_SIZE = 100

class OutboxPollerWorker {
  private isRunning = false
  private outboxService: OutboxService

  constructor() {
    const outboxRepository = new OutboxRepository()
    const notificationRepository = new NotificationRepository()
    const channelRouter = new ChannelRouter()

    this.outboxService = new OutboxService(
      outboxRepository,
      notificationRepository,
      channelRouter
    )

    logger.info('OutboxPollerWorker: Initialized', {
      workerId: WORKER_ID,
      pollInterval: POLL_INTERVAL_MS,
      batchSize: BATCH_SIZE,
    })
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('OutboxPollerWorker: Already running')
      return
    }

    this.isRunning = true
    logger.info('OutboxPollerWorker: Started', { workerId: WORKER_ID })

    while (this.isRunning) {
      try {
        await this.poll()
      } catch (error) {
        logger.error('OutboxPollerWorker: Poll error', {
          workerId: WORKER_ID,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }

      // Wait before next poll
      await this.sleep(POLL_INTERVAL_MS)
    }
  }

  async stop(): Promise<void> {
    logger.info('OutboxPollerWorker: Stopping', { workerId: WORKER_ID })
    this.isRunning = false
  }

  private async poll(): Promise<void> {
    const outboxRepository = new OutboxRepository()
    const messages = await outboxRepository.findPendingMessages(
      BATCH_SIZE,
      WORKER_ID
    )

    if (messages.length === 0) {
      logger.debug('OutboxPollerWorker: No pending messages')
      return
    }

    logger.info('OutboxPollerWorker: Processing batch', {
      workerId: WORKER_ID,
      count: messages.length,
    })

    // Process messages in parallel (with concurrency limit)
    const promises = messages.map((message) =>
      this.processMessage(message.id).catch((error) => {
        logger.error('OutboxPollerWorker: Message processing failed', {
          outboxId: message.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      })
    )

    await Promise.all(promises)
  }

  private async processMessage(outboxId: string): Promise<void> {
    try {
      await this.outboxService.processOutboxMessage(outboxId)
    } catch (error) {
      logger.error('OutboxPollerWorker: Error processing message', {
        outboxId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Main execution
async function main() {
  const worker = new OutboxPollerWorker()

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('OutboxPollerWorker: Received SIGTERM')
    await worker.stop()
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    logger.info('OutboxPollerWorker: Received SIGINT')
    await worker.stop()
    process.exit(0)
  })

  // Start worker
  await worker.start()
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    logger.error('OutboxPollerWorker: Fatal error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    process.exit(1)
  })
}

export { OutboxPollerWorker }
