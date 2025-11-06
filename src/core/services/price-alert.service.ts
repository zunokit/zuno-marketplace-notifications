import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'
import { SendNotificationUseCase } from '@/core/use-cases/notifications/send-notification.use-case'

export class PriceAlertService {
  private sendNotificationUseCase: SendNotificationUseCase

  constructor() {
    this.sendNotificationUseCase = new SendNotificationUseCase()
  }

  /**
   * Create a price alert for an NFT or collection
   */
  async createPriceAlert(params: {
    userId: string
    organizationId: string
    itemType: 'nft' | 'collection'
    itemId: string
    targetPrice: number
    condition: 'above' | 'below' | 'equals'
  }) {
    const alert = await prisma.priceAlert.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        itemType: params.itemType,
        itemId: params.itemId,
        targetPrice: params.targetPrice,
        condition: params.condition,
        isActive: true,
      },
    })

    logger.info('Price alert created', {
      alertId: alert.id,
      userId: params.userId,
      itemType: params.itemType,
      itemId: params.itemId,
      targetPrice: params.targetPrice,
    })

    return alert
  }

  /**
   * Check price alerts and trigger notifications
   */
  async checkPriceAlerts(params: {
    itemType: 'nft' | 'collection'
    itemId: string
    currentPrice: number
    itemName: string
    imageUrl?: string
  }) {
    const { itemType, itemId, currentPrice, itemName, imageUrl } = params

    // Find all active alerts for this item
    const alerts = await prisma.priceAlert.findMany({
      where: {
        itemType,
        itemId,
        isActive: true,
        triggered: false,
      },
      include: {
        user: true,
      },
    })

    logger.info('Checking price alerts', {
      itemType,
      itemId,
      currentPrice,
      alertsCount: alerts.length,
    })

    for (const alert of alerts) {
      const shouldTrigger = this.shouldTriggerAlert(
        Number(alert.targetPrice),
        currentPrice,
        alert.condition
      )

      if (shouldTrigger) {
        await this.triggerAlert(alert, currentPrice, itemName, imageUrl)
      }
    }
  }

  /**
   * Check if alert should be triggered
   */
  private shouldTriggerAlert(
    targetPrice: number,
    currentPrice: number,
    condition: string
  ): boolean {
    switch (condition) {
      case 'above':
        return currentPrice >= targetPrice
      case 'below':
        return currentPrice <= targetPrice
      case 'equals':
        return Math.abs(currentPrice - targetPrice) < targetPrice * 0.01 // Within 1%
      default:
        return false
    }
  }

  /**
   * Trigger a price alert notification
   */
  private async triggerAlert(
    alert: any,
    currentPrice: number,
    itemName: string,
    imageUrl?: string
  ) {
    try {
      // Mark alert as triggered
      await prisma.priceAlert.update({
        where: { id: alert.id },
        data: {
          triggered: true,
          triggeredAt: new Date(),
        },
      })

      // Send notification
      await this.sendNotificationUseCase.execute({
        organizationId: alert.organizationId,
        userId: alert.userId,
        type: 'TARGET_PRICE_REACHED',
        channel: 'EMAIL',
        priority: 'HIGH',
        payload: {
          to: alert.user.email,
          subject: `Price Alert: ${itemName} reached ${alert.condition} ${alert.targetPrice}`,
          body: `The ${alert.itemType} "${itemName}" has reached your target price of ${alert.targetPrice}. Current price: ${currentPrice}`,
          itemType: alert.itemType,
          itemId: alert.itemId,
          itemName,
          imageUrl,
          targetPrice: Number(alert.targetPrice),
          currentPrice,
          condition: alert.condition,
        },
      })

      logger.info('Price alert triggered', {
        alertId: alert.id,
        userId: alert.userId,
        itemType: alert.itemType,
        itemId: alert.itemId,
        targetPrice: Number(alert.targetPrice),
        currentPrice,
      })
    } catch (error) {
      logger.error('Failed to trigger price alert', {
        alertId: alert.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Check floor price drops for collections
   */
  async checkFloorPriceDrops(params: {
    collectionId: string
    collectionName: string
    previousFloorPrice: number
    currentFloorPrice: number
    dropPercentage: number // e.g., 10 for 10% drop
  }) {
    const { collectionId, collectionName, previousFloorPrice, currentFloorPrice, dropPercentage } = params

    // Calculate actual drop percentage
    const actualDrop = ((previousFloorPrice - currentFloorPrice) / previousFloorPrice) * 100

    if (actualDrop < dropPercentage) {
      return // Not a significant drop
    }

    // Find all users watching this collection
    const watchers = await prisma.watchlist.findMany({
      where: {
        itemType: 'collection',
        itemId: collectionId,
      },
      include: {
        user: true,
      },
    })

    logger.info('Floor price drop detected', {
      collectionId,
      previousFloorPrice,
      currentFloorPrice,
      dropPercentage: actualDrop,
      watchersCount: watchers.length,
    })

    // Notify all watchers
    for (const watcher of watchers) {
      try {
        await this.sendNotificationUseCase.execute({
          organizationId: watcher.organizationId,
          userId: watcher.userId,
          type: 'FLOOR_PRICE_DROP',
          channel: 'WEBSOCKET', // Real-time notification
          priority: 'HIGH',
          payload: {
            to: watcher.user.email,
            subject: `Floor Price Drop: ${collectionName}`,
            body: `The floor price of ${collectionName} has dropped ${actualDrop.toFixed(1)}% from ${previousFloorPrice} to ${currentFloorPrice}`,
            collectionId,
            collectionName,
            previousFloorPrice,
            currentFloorPrice,
            dropPercentage: actualDrop,
          },
        })
      } catch (error) {
        logger.error('Failed to send floor price drop notification', {
          watcherId: watcher.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }

  /**
   * Deactivate a price alert
   */
  async deactivateAlert(alertId: string) {
    await prisma.priceAlert.update({
      where: { id: alertId },
      data: { isActive: false },
    })

    logger.info('Price alert deactivated', { alertId })
  }

  /**
   * Get user's active price alerts
   */
  async getUserAlerts(userId: string) {
    return await prisma.priceAlert.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
