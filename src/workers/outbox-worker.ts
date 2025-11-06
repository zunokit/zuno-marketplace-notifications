import { nanoid } from 'nanoid'

import { EmailChannel } from '@/infrastructure/channels/email/email-channel'
import { OutboxRepository } from '@/infrastructure/outbox/outbox.repository'
import { logger } from '@/lib/logger/logger'

export class OutboxWorker {
  private workerId: string
  private outboxRepo: OutboxRepository
  private emailChannel: EmailChannel
  private isRunning: boolean = false

  constructor() {
    this.workerId = `worker-${nanoid(8)}`
    this.outboxRepo = new OutboxRepository()
    this.emailChannel = new EmailChannel()
  }

  async start(intervalMs: number = 5000) {
    if (this.isRunning) {
      logger.warn('Outbox worker already running')
      return
    }

    this.isRunning = true
    logger.info('Outbox worker started', { workerId: this.workerId })

    while (this.isRunning) {
      try {
        await this.processOutbox()
      } catch (error) {
        logger.error('Error in outbox worker', {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }

      await this.sleep(intervalMs)
    }
  }

  stop() {
    this.isRunning = false
    logger.info('Outbox worker stopped', { workerId: this.workerId })
  }

  private async processOutbox() {
    const pending = await this.outboxRepo.getPending(10)

    if (pending.length === 0) {
      return
    }

    logger.info('Processing outbox items', {
      count: pending.length,
      workerId: this.workerId,
    })

    for (const outbox of pending) {
      try {
        // Lock the outbox item
        await this.outboxRepo.lock(outbox.id, this.workerId)

        // Process based on channel
        if (outbox.channel === 'EMAIL') {
          await this.processEmail(outbox)
        }

        // Mark as processed
        await this.outboxRepo.markProcessed(outbox.id)

        logger.info('Outbox item processed', { outboxId: outbox.id })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'

        logger.error('Failed to process outbox item', {
          outboxId: outbox.id,
          error: errorMessage,
        })

        await this.outboxRepo.markFailed(outbox.id, errorMessage)
      }
    }
  }

  private async processEmail(outbox: any) {
    const payload = outbox.payload as any
    const provider = this.emailChannel.getProvider()

    const result = await provider.send({
      to: payload.to,
      subject: payload.subject,
      body: payload.body,
      from: payload.from,
    })

    if (!result.success) {
      throw new Error(result.error || 'Failed to send email')
    }

    logger.info('Email sent successfully', {
      outboxId: outbox.id,
      messageId: result.messageId,
    })
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
