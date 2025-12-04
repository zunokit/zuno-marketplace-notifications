import { Channel } from '@/infrastructure/database/prisma'

/**
 * Result from channel delivery attempt
 */
export interface ChannelDeliveryResult {
  success: boolean
  providerMessageId?: string
  responseCode?: number
  responseBody?: Record<string, unknown>
  error?: string
  duration: number
}

/**
 * Payload for sending notifications
 */
export interface NotificationPayload {
  to: string
  subject?: string
  body: string
  bodyText?: string
  from?: string
  metadata?: Record<string, unknown>
}

/**
 * High-level notification channel interface
 * Used by ChannelRouter to route notifications to appropriate channel
 */
export interface INotificationChannel {
  readonly channelType: Channel
  send(payload: NotificationPayload): Promise<ChannelDeliveryResult>
  validate(payload: NotificationPayload): boolean
}

/**
 * Result from provider send operation
 */
export interface ProviderSendResult {
  success: boolean
  messageId?: string
  error?: string
  provider?: string
  responseTimeMs?: number
  retryable?: boolean
  metadata?: Record<string, unknown>
}

/**
 * Low-level provider interface
 * Implemented by actual email/websocket providers (Resend, Mailpit, etc.)
 */
export interface IProvider {
  send(payload: NotificationPayload): Promise<ProviderSendResult>
  getName(): string
}
