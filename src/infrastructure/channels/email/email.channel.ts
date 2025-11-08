import { Channel } from '@prisma/client'

import {
  INotificationChannel,
  NotificationPayload,
  ChannelDeliveryResult,
} from '@/infrastructure/channels/channel.interface'
import { ResendProvider } from './resend.provider'
import { logger } from '@/lib/logger/logger'

export class EmailChannel implements INotificationChannel {
  readonly channelType: Channel = 'EMAIL'
  private provider: ResendProvider

  constructor() {
    this.provider = new ResendProvider()
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
    })

    return this.provider.send(payload)
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}
