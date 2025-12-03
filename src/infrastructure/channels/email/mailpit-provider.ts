import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

import { env } from '@/lib/config/env'
import { logger } from '@/lib/logger/logger'
import type { NotificationPayload, IProvider, ProviderSendResult } from '../channel.interface'

export class MailpitProvider implements IProvider {
  private transporter: Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.MAILPIT_SMTP_HOST,
      port: env.MAILPIT_SMTP_PORT,
      secure: false, // No TLS for Mailpit
      tls: {
        rejectUnauthorized: false,
      },
    })
  }

  async send(payload: NotificationPayload): Promise<ProviderSendResult> {
    try {
      const result = await this.transporter.sendMail({
        from: payload.from || 'Zuno Marketplace <noreply@zuno.market>',
        to: payload.to,
        subject: payload.subject || 'Notification',
        html: payload.body,
      })

      logger.info('Email sent via Mailpit', {
        messageId: result.messageId,
        to: payload.to,
      })

      return {
        success: true,
        messageId: result.messageId,
        provider: 'mailpit',
      }
    } catch (error) {
      logger.error('Failed to send email via Mailpit', {
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
    return 'mailpit'
  }
}
