import { IChannel, ChannelPayload, SendResult } from '@/infrastructure/channels/base-channel'
import { getWebSocketServer } from '@/infrastructure/websocket/websocket-server'
import { logger } from '@/lib/logger/logger'

export class WebSocketProvider implements IChannel {
  async send(payload: ChannelPayload): Promise<SendResult> {
    const startTime = Date.now()

    try {
      const wsServer = getWebSocketServer()

      // Extract userId from payload metadata
      const userId = (payload.metadata as { userId?: string })?.userId
      if (!userId) {
        throw new Error('userId is required for WebSocket notifications')
      }

      // Create notification message
      const notification = {
        id: (payload.metadata as { notificationId?: string })?.notificationId,
        type: payload.subject || 'notification',
        title: payload.subject,
        body: payload.body,
        timestamp: new Date().toISOString(),
        metadata: payload.metadata,
      }

      // Send to user via WebSocket
      wsServer.sendNotificationToUser(userId, notification)

      const responseTime = Date.now() - startTime

      logger.info('WebSocket notification sent', {
        userId,
        responseTime,
      })

      return {
        success: true,
        messageId: notification.id,
        provider: 'websocket',
        responseTimeMs: responseTime,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      logger.error('WebSocket send failed', {
        error: errorMessage,
        responseTime,
      })

      return {
        success: false,
        error: errorMessage,
        retryable: false, // WebSocket failures are typically not retryable
        provider: 'websocket',
        responseTimeMs: responseTime,
      }
    }
  }

  async verify(): Promise<boolean> {
    try {
      const wsServer = getWebSocketServer()
      const stats = wsServer.getStats()
      logger.info('WebSocket server status', stats)
      return true
    } catch (error) {
      logger.error('WebSocket verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return false
    }
  }

  getName(): string {
    return 'WebSocket Provider'
  }
}
