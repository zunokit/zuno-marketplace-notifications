export interface SendResult {
  success: boolean
  messageId?: string
  error?: string
  metadata?: Record<string, unknown>
}

export interface ChannelPayload {
  to: string
  subject?: string
  body: string
  from?: string
  metadata?: Record<string, unknown>
}

export interface IChannel {
  send(payload: ChannelPayload): Promise<SendResult>
  getName(): string
}
