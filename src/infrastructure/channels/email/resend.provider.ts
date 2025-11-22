import { Resend } from 'resend'

import { env } from '@/lib/config/env'
import {
  ChannelDeliveryResult,
  NotificationPayload,
} from '@/infrastructure/channels/channel.interface'
import { logger } from '@/lib/logger/logger'

export class ResendProvider {
  private resend: Resend

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY)
  }

  async send(payload: NotificationPayload): Promise<ChannelDeliveryResult> {
    const startTime = Date.now()

    try {
      logger.info('ResendProvider: Sending email', {
        to: payload.to,
        subject: payload.subject,
      })

      const response = await this.resend.emails.send({
        from: 'Zuno Notifications <notifications@zuno.market>',
        to: payload.to,
        subject: payload.subject || 'Notification',
        html: payload.body,
        text: payload.bodyText,
      })

      const duration = Date.now() - startTime

      if (response.error) {
        logger.error('ResendProvider: Send failed', {
          error: response.error,
          to: payload.to,
        })

        return {
          success: false,
          error: response.error.message,
          responseCode: 500,
          duration,
        }
      }

      logger.info('ResendProvider: Send successful', {
        messageId: response.data?.id,
        to: payload.to,
        duration,
      })

      return {
        success: true,
        providerMessageId: response.data?.id,
        responseCode: 200,
        responseBody: response.data as unknown as Record<string, unknown>,
        duration,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('ResendProvider: Exception', {
        error: error instanceof Error ? error.message : 'Unknown error',
        to: payload.to,
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseCode: 500,
        duration,
      }
    }
  }
}
