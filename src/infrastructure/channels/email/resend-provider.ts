import { Resend } from 'resend'

import { env } from '@/lib/config/env'
import { logger } from '@/lib/logger/logger'

import type { ChannelPayload, IChannel, SendResult } from '../base-channel'

export class ResendProvider implements IChannel {
  private resend: Resend

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY)
  }

  async send(payload: ChannelPayload): Promise<SendResult> {
    try {
      const result = await this.resend.emails.send({
        from: payload.from || 'Zuno Marketplace <noreply@zuno.market>',
        to: payload.to,
        subject: payload.subject || 'Notification',
        html: payload.body,
      })

      logger.info('Email sent via Resend', {
        messageId: result.data?.id,
        to: payload.to,
      })

      return {
        success: true,
        messageId: result.data?.id,
        metadata: { provider: 'resend' },
      }
    } catch (error) {
      logger.error('Failed to send email via Resend', {
        error: error instanceof Error ? error.message : 'Unknown error',
        to: payload.to,
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  getName(): string {
    return 'resend'
  }
}
