import { Resend } from 'resend'

import { env } from '@/lib/config/env'
import {
  NotificationPayload,
  IProvider,
  ProviderSendResult,
} from '@/infrastructure/channels/channel.interface'
import { logger } from '@/lib/logger/logger'

export class ResendProvider implements IProvider {
  private resend: Resend

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY)
  }

  async send(payload: NotificationPayload): Promise<ProviderSendResult> {
    const startTime = Date.now()

    try {
      logger.info('ResendProvider: Sending email', {
        to: payload.to,
        subject: payload.subject,
      })

      const response = await this.resend.emails.send({
        from: payload.from || 'Zuno Notifications <notifications@zuno.market>',
        to: payload.to,
        subject: payload.subject || 'Notification',
        html: payload.body,
        text: payload.bodyText,
      })

      const responseTimeMs = Date.now() - startTime

      if (response.error) {
        logger.error('ResendProvider: Send failed', {
          error: response.error,
          to: payload.to,
        })

        return {
          success: false,
          error: response.error.message,
          provider: 'resend',
          responseTimeMs,
        }
      }

      logger.info('ResendProvider: Send successful', {
        messageId: response.data?.id,
        to: payload.to,
        responseTimeMs,
      })

      return {
        success: true,
        messageId: response.data?.id,
        provider: 'resend',
        responseTimeMs,
      }
    } catch (error) {
      const responseTimeMs = Date.now() - startTime
      logger.error('ResendProvider: Exception', {
        error: error instanceof Error ? error.message : 'Unknown error',
        to: payload.to,
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'resend',
        responseTimeMs,
        retryable: true,
      }
    }
  }

  getName(): string {
    return 'resend'
  }
}
