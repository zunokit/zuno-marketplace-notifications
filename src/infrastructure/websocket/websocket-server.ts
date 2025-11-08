import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { logger } from '@/lib/logger/logger'

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string
  organizationId?: string
  isAlive?: boolean
}

interface WebSocketMessage {
  type: 'notification' | 'ping' | 'pong' | 'subscribe' | 'unsubscribe'
  payload?: unknown
}

export class NotificationWebSocketServer {
  private wss: WebSocketServer
  private clients: Map<string, Set<AuthenticatedWebSocket>>
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor(port: number = 3001) {
    this.wss = new WebSocketServer({ port })
    this.clients = new Map()
    this.setupServer()
    logger.info('WebSocket server initialized', { port })
  }

  private setupServer() {
    this.wss.on('connection', (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
      logger.info('New WebSocket connection', {
        ip: req.socket.remoteAddress,
      })

      ws.isAlive = true

      ws.on('pong', () => {
        ws.isAlive = true
      })

      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString())
          this.handleMessage(ws, message)
        } catch (error) {
          logger.error('Error parsing WebSocket message', {
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          this.sendError(ws, 'Invalid message format')
        }
      })

      ws.on('close', () => {
        this.handleDisconnect(ws)
        logger.info('WebSocket connection closed', { userId: ws.userId })
      })

      ws.on('error', (error) => {
        logger.error('WebSocket error', {
          error: error.message,
          userId: ws.userId,
        })
      })
    })

    this.startHeartbeat()
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(ws, message.payload as { userId: string; organizationId: string })
        break
      case 'unsubscribe':
        this.handleUnsubscribe(ws)
        break
      case 'ping':
        this.send(ws, { type: 'pong' })
        break
      default:
        this.sendError(ws, 'Unknown message type')
    }
  }

  private handleSubscribe(
    ws: AuthenticatedWebSocket,
    payload: { userId: string; organizationId: string }
  ) {
    if (!payload.userId || !payload.organizationId) {
      this.sendError(ws, 'Missing userId or organizationId')
      return
    }

    ws.userId = payload.userId
    ws.organizationId = payload.organizationId

    if (!this.clients.has(payload.userId)) {
      this.clients.set(payload.userId, new Set())
    }

    this.clients.get(payload.userId)!.add(ws)

    this.send(ws, {
      type: 'subscribed',
      payload: { userId: payload.userId },
    })

    logger.info('Client subscribed', {
      userId: payload.userId,
      organizationId: payload.organizationId,
    })
  }

  private handleUnsubscribe(ws: AuthenticatedWebSocket) {
    if (ws.userId) {
      const userClients = this.clients.get(ws.userId)
      if (userClients) {
        userClients.delete(ws)
        if (userClients.size === 0) {
          this.clients.delete(ws.userId)
        }
      }
    }
  }

  private handleDisconnect(ws: AuthenticatedWebSocket) {
    this.handleUnsubscribe(ws)
    logger.debug('Client disconnected and unsubscribed')
  }

  private send(ws: WebSocket, message: unknown) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  private sendError(ws: WebSocket, message: string) {
    this.send(ws, { type: 'error', payload: { message } })
  }

  public sendNotificationToUser(userId: string, notification: unknown) {
    const userClients = this.clients.get(userId)
    if (!userClients || userClients.size === 0) {
      logger.debug('No active WebSocket clients for user', { userId })
      return
    }

    const message = {
      type: 'notification',
      payload: notification,
    }

    let successCount = 0
    userClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        this.send(client, message)
        successCount++
      }
    })

    logger.info('Notification sent via WebSocket', {
      userId,
      clientCount: successCount,
    })
  }

  public broadcastToOrganization(organizationId: string, notification: unknown) {
    const message = {
      type: 'notification',
      payload: notification,
    }

    let successCount = 0
    this.clients.forEach((userClients) => {
      userClients.forEach((client) => {
        if (
          client.organizationId === organizationId &&
          client.readyState === WebSocket.OPEN
        ) {
          this.send(client, message)
          successCount++
        }
      })
    })

    logger.info('Broadcast sent to organization', {
      organizationId,
      clientCount: successCount,
    })
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        const client = ws as AuthenticatedWebSocket
        if (client.isAlive === false) {
          logger.info('Terminating inactive WebSocket connection', {
            userId: client.userId,
          })
          return client.terminate()
        }

        client.isAlive = false
        client.ping()
      })
    }, 30000) // 30 seconds
  }

  public close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    this.wss.close()
    logger.info('WebSocket server closed')
  }

  public getStats() {
    return {
      totalConnections: this.wss.clients.size,
      totalUsers: this.clients.size,
    }
  }
}

// Singleton instance
let wsServer: NotificationWebSocketServer | null = null

export function getWebSocketServer(): NotificationWebSocketServer {
  if (!wsServer) {
    wsServer = new NotificationWebSocketServer()
  }
  return wsServer
}
