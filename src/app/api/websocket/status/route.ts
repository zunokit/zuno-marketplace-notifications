import { NextResponse } from 'next/server'
import { getWebSocketServer } from '@/infrastructure/websocket/websocket-server'
import { logger } from '@/lib/logger/logger'

export async function GET() {
  try {
    const wsServer = getWebSocketServer()
    const stats = wsServer.getStats()

    return NextResponse.json({
      status: 'running',
      ...stats,
    })
  } catch (error) {
    logger.error('Error getting WebSocket status', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to get WebSocket status',
      },
      { status: 500 }
    )
  }
}
