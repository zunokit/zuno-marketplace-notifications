import { Channel } from '@prisma/client'

export interface ChannelDeliveryResult {
  success: boolean
  providerMessageId?: string
  responseCode?: number
  responseBody?: Record<string, unknown>
  error?: string
  duration: number
}

export interface NotificationPayload {
  to: string
  subject?: string
  body: string
  bodyText?: string
  metadata?: Record<string, unknown>
}

export interface INotificationChannel {
  readonly channelType: Channel
  send(payload: NotificationPayload): Promise<ChannelDeliveryResult>
  validate(payload: NotificationPayload): boolean
}
