import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/database/prisma'
import { WebhookService } from '@/infrastructure/webhooks/webhook.service'
import { logger } from '@/lib/logger/logger'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const webhook = await prisma.webhook.findUnique({
      where: { id },
    })

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      )
    }

    if (!webhook.isActive) {
      return NextResponse.json(
        { error: 'Webhook is not active' },
        { status: 400 }
      )
    }

    // Send test webhook
    const webhookService = new WebhookService()
    const payload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        webhookId: webhook.id,
        message: 'This is a test webhook from Zuno Notifications',
      },
    }

    const result = await webhookService.send(
      webhook.url,
      payload,
      webhook.secret
    )

    if (result.success) {
      // Update webhook stats
      await prisma.webhook.update({
        where: { id },
        data: {
          lastTriggeredAt: new Date(),
        },
      })

      logger.info('Test webhook sent successfully', {
        webhookId: id,
        url: webhook.url,
      })

      return NextResponse.json({
        success: true,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
      })
    } else {
      // Update failure count
      await prisma.webhook.update({
        where: { id },
        data: {
          failureCount: { increment: 1 },
        },
      })

      logger.error('Test webhook failed', {
        webhookId: id,
        url: webhook.url,
        error: result.error,
      })

      return NextResponse.json(
        {
          success: false,
          error: result.error,
          statusCode: result.statusCode,
          responseTime: result.responseTime,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    logger.error('Error sending test webhook', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Failed to send test webhook' },
      { status: 500 }
    )
  }
}
