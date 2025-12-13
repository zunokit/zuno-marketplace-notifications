import crypto from 'crypto'
import { logger } from '@/lib/logger/logger'

export interface WebhookPayload {
  event: string
  timestamp: string
  data: unknown
}

export interface WebhookResult {
  success: boolean
  statusCode?: number
  error?: string
  responseTime?: number
}

export class WebhookService {
  /**
   * Send webhook to external endpoint
   */
  async send(
    url: string,
    payload: WebhookPayload,
    secret?: string
  ): Promise<WebhookResult> {
    const startTime = Date.now()

    try {
      // Generate signature if secret is provided
      let signature: string | undefined
      if (secret) {
        signature = this.generateSignature(payload, secret)
      }

      // Send webhook
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Zuno-Notifications/1.0',
          ...(signature && { 'X-Zuno-Signature': signature }),
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      const responseTime = Date.now() - startTime

      if (!response.ok) {
        logger.warn('Webhook failed with non-200 status', {
          url,
          statusCode: response.status,
          responseTime,
        })

        return {
          success: false,
          statusCode: response.status,
          error: `HTTP ${response.status}`,
          responseTime,
        }
      }

      logger.info('Webhook sent successfully', {
        url,
        statusCode: response.status,
        responseTime,
      })

      return {
        success: true,
        statusCode: response.status,
        responseTime,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      logger.error('Webhook send failed', {
        url,
        error: errorMessage,
        responseTime,
      })

      return {
        success: false,
        error: errorMessage,
        responseTime,
      }
    }
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  generateSignature(payload: WebhookPayload, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(JSON.stringify(payload))
    return hmac.digest('hex')
  }

  /**
   * Verify webhook signature
   */
  verifySignature(
    payload: WebhookPayload,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = this.generateSignature(payload, secret)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  }

  /**
   * Send webhook with retry logic
   */
  async sendWithRetry(
    url: string,
    payload: WebhookPayload,
    secret?: string,
    maxRetries: number = 3
  ): Promise<WebhookResult> {
    let lastResult: WebhookResult | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      logger.info('Sending webhook', { url, attempt, maxRetries })

      const result = await this.send(url, payload, secret)

      if (result.success) {
        return result
      }

      lastResult = result

      // Don't retry on 4xx errors (client errors)
      if (result.statusCode && result.statusCode >= 400 && result.statusCode < 500) {
        logger.warn('Webhook failed with client error, not retrying', {
          url,
          statusCode: result.statusCode,
        })
        break
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
        logger.info('Retrying webhook after delay', { url, delayMs, attempt })
        await this.sleep(delayMs)
      }
    }

    return lastResult || { success: false, error: 'All retry attempts failed' }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
