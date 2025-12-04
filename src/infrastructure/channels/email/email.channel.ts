import { Channel } from '@/infrastructure/database/prisma'
import { env } from '@/lib/config/env'
import { logger } from '@/lib/logger/logger'
import {
  INotificationChannel,
  IProvider,
  NotificationPayload,
  ChannelDeliveryResult,
} from '@/infrastructure/channels/channel.interface'
import { ResendProvider } from './resend.provider'
import { MailpitProvider } from './mailpit-provider'

export class EmailChannel implements INotificationChannel {
  readonly channelType: Channel = 'EMAIL'
  private provider: IProvider

  constructor() {
    // Use Mailpit for development, Resend for production
    this.provider =
      env.NODE_ENV === 'production'
        ? new ResendProvider()
        : new MailpitProvider()

    logger.info('EmailChannel initialized', {
      provider: this.provider.getName(),
      environment: env.NODE_ENV,
    })
  }

  /**
   * Get the underlying provider for direct access (used by workers)
   */
  getProvider(): IProvider {
    return this.provider
  }

  validate(payload: NotificationPayload): boolean {
    if (!payload.to || !this.isValidEmail(payload.to)) {
      logger.warn('EmailChannel: Invalid email address', { to: payload.to })
      return false
    }

    if (!payload.body || payload.body.trim().length === 0) {
      logger.warn('EmailChannel: Empty body')
      return false
    }

    return true
  }

  async send(payload: NotificationPayload): Promise<ChannelDeliveryResult> {
    const startTime = Date.now()

    if (!this.validate(payload)) {
      return {
        success: false,
        error: 'Invalid email payload',
        responseCode: 400,
        duration: 0,
      }
    }

    logger.info('EmailChannel: Sending email', {
      to: payload.to,
      subject: payload.subject,
      provider: this.provider.getName(),
    })

    const result = await this.provider.send(payload)
    const duration = Date.now() - startTime

    return {
      success: result.success,
      providerMessageId: result.messageId,
      error: result.error,
      responseCode: result.success ? 200 : 500,
      duration,
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}
