import { nanoid } from 'nanoid'

import { OutboxRepository } from '@/infrastructure/outbox/outbox.repository'
import { OutboxService } from '@/infrastructure/outbox/outbox.service'
import { NotificationRepository } from '@/infrastructure/repositories/notification.repository'
import { ChannelRouter } from '@/infrastructure/channels/channel-router'
import { logger } from '@/lib/logger/logger'

const WORKER_ID = `retry-worker-${nanoid()}`
const POLL_INTERVAL_MS = 30000 // 30 seconds
const BATCH_SIZE = 50
const MAX_RETRIES = 5

class RetryWorker {
  private isRunning = false
  private outboxService: OutboxService
  private outboxRepository: OutboxRepository

  constructor() {
    this.outboxRepository = new OutboxRepository()
    const notificationRepository = new NotificationRepository()
    const channelRouter = new ChannelRouter()

    this.outboxService = new OutboxService(
      this.outboxRepository,
      notificationRepository,
      channelRouter
    )

    logger.info('RetryWorker: Initialized', {
      workerId: WORKER_ID,
      pollInterval: POLL_INTERVAL_MS,
      batchSize: BATCH_SIZE,
      maxRetries: MAX_RETRIES,
    })
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('RetryWorker: Already running')
      return
    }

    this.isRunning = true
    logger.info('RetryWorker: Started', { workerId: WORKER_ID })

    while (this.isRunning) {
      try {
        await this.processRetries()
      } catch (error) {
        logger.error('RetryWorker: Poll error', {
          workerId: WORKER_ID,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }

      // Wait before next poll
      await this.sleep(POLL_INTERVAL_MS)
    }
  }

  async stop(): Promise<void> {
    logger.info('RetryWorker: Stopping', { workerId: WORKER_ID })
    this.isRunning = false
  }

  private async processRetries(): Promise<void> {
    const messages = await this.outboxRepository.findFailedForRetry(BATCH_SIZE)

    if (messages.length === 0) {
      logger.debug('RetryWorker: No messages to retry')
      return
    }

    logger.info('RetryWorker: Processing retry batch', {
      workerId: WORKER_ID,
      count: messages.length,
    })

    for (const message of messages) {
      try {
        // Check if max retries exceeded
        if (message.retryCount >= MAX_RETRIES) {
          logger.warn('RetryWorker: Max retries exceeded, moving to dead letter', {
            outboxId: message.id,
            retryCount: message.retryCount,
          })

          await this.outboxRepository.moveToDeadLetter(message.id)
          continue
        }

        // Retry processing
        logger.info('RetryWorker: Retrying message', {
          outboxId: message.id,
          attemptNumber: message.retryCount + 1,
        })

        await this.outboxService.processOutboxMessage(message.id)
      } catch (error) {
        logger.error('RetryWorker: Retry failed', {
          outboxId: message.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Main execution
async function main() {
  const worker = new RetryWorker()

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('RetryWorker: Received SIGTERM')
    await worker.stop()
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    logger.info('RetryWorker: Received SIGINT')
    await worker.stop()
    process.exit(0)
  })

  // Start worker
  await worker.start()
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    logger.error('RetryWorker: Fatal error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    process.exit(1)
  })
}

export { RetryWorker }
