import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'
import { SendNotificationUseCase } from '@/core/use-cases/notifications/send-notification.use-case'

export class WatchlistService {
  private sendNotificationUseCase: SendNotificationUseCase

  constructor() {
    this.sendNotificationUseCase = new SendNotificationUseCase()
  }

  /**
   * Add item to watchlist
   */
  async addToWatchlist(params: {
    userId: string
    organizationId: string
    itemType: 'nft' | 'collection' | 'user'
    itemId: string
    notes?: string
  }) {
    try {
      const watchlistItem = await prisma.watchlist.create({
        data: {
          organizationId: params.organizationId,
          userId: params.userId,
          itemType: params.itemType,
          itemId: params.itemId,
          notes: params.notes,
        },
      })

      logger.info('Item added to watchlist', {
        userId: params.userId,
        itemType: params.itemType,
        itemId: params.itemId,
      })

      return watchlistItem
    } catch (error) {
      // Handle unique constraint violation (already in watchlist)
      logger.warn('Item already in watchlist', {
        userId: params.userId,
        itemType: params.itemType,
        itemId: params.itemId,
      })
      throw error
    }
  }

  /**
   * Remove item from watchlist
   */
  async removeFromWatchlist(params: {
    userId: string
    organizationId: string
    itemType: string
    itemId: string
  }) {
    await prisma.watchlist.deleteMany({
      where: {
        organizationId: params.organizationId,
        userId: params.userId,
        itemType: params.itemType,
        itemId: params.itemId,
      },
    })

    logger.info('Item removed from watchlist', {
      userId: params.userId,
      itemType: params.itemType,
      itemId: params.itemId,
    })
  }

  /**
   * Get user's watchlist
   */
  async getUserWatchlist(userId: string, itemType?: 'nft' | 'collection' | 'user') {
    const where: any = { userId }
    if (itemType) {
      where.itemType = itemType
    }
    return await prisma.watchlist.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Notify watchers when NFT is listed
   */
  async notifyNFTListed(params: {
    nftId: string
    nftName: string
    collectionId: string
    collectionName: string
    price: number
    imageUrl?: string
    listingUrl?: string
  }) {
    const { nftId, nftName, collectionId, collectionName, price, imageUrl, listingUrl } = params

    // Find watchers of this specific NFT
    const nftWatchers = await prisma.watchlist.findMany({
      where: {
        itemType: 'nft',
        itemId: nftId,
      },
      include: {
        user: true,
      },
    })

    // Find watchers of this collection
    const collectionWatchers = await prisma.watchlist.findMany({
      where: {
        itemType: 'collection',
        itemId: collectionId,
      },
      include: {
        user: true,
      },
    })

    const allWatchers = [...nftWatchers, ...collectionWatchers]

    logger.info('Notifying watchers of NFT listing', {
      nftId,
      watchersCount: allWatchers.length,
    })

    for (const watcher of allWatchers) {
      try {
        await this.sendNotificationUseCase.execute({
          organizationId: watcher.organizationId,
          userId: watcher.userId,
          type: watcher.itemType === 'nft' ? 'ACTIVITY_ON_OWNED_NFT' : 'LISTING_CREATED',
          channel: 'WEBSOCKET', // Real-time
          priority: 'NORMAL',
          payload: {
            to: watcher.user.email,
            subject: `New Listing: ${nftName}`,
            body: `${nftName} from ${collectionName} has been listed for ${price}`,
            nftId,
            nftName,
            collectionId,
            collectionName,
            price,
            imageUrl,
            listingUrl,
          },
        })
      } catch (error) {
        logger.error('Failed to notify watcher', {
          watcherId: watcher.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }

  /**
   * Notify followers when user lists an NFT
   */
  async notifyFollowingUserListed(params: {
    sellerId: string
    sellerName: string
    nftId: string
    nftName: string
    price: number
    imageUrl?: string
  }) {
    const { sellerId, sellerName, nftId, nftName, price, imageUrl } = params

    // Find users following this seller
    const followers = await prisma.watchlist.findMany({
      where: {
        itemType: 'user',
        itemId: sellerId,
      },
      include: {
        user: true,
      },
    })

    logger.info('Notifying followers of user listing', {
      sellerId,
      followersCount: followers.length,
    })

    for (const follower of followers) {
      try {
        await this.sendNotificationUseCase.execute({
          organizationId: follower.organizationId,
          userId: follower.userId,
          type: 'FOLLOWING_LISTED_NFT',
          channel: 'WEBSOCKET',
          priority: 'NORMAL',
          payload: {
            to: follower.user.email,
            subject: `${sellerName} listed ${nftName}`,
            body: `${sellerName} has listed ${nftName} for ${price}`,
            sellerId,
            sellerName,
            nftId,
            nftName,
            price,
            imageUrl,
          },
        })
      } catch (error) {
        logger.error('Failed to notify follower', {
          followerId: follower.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }

  /**
   * Notify watchers of activity on their NFTs
   */
  async notifyNFTActivity(params: {
    nftId: string
    nftName: string
    ownerId: string
    activityType: 'bid' | 'offer' | 'sale'
    actorName: string
    amount?: number
  }) {
    const { nftId, nftName, ownerId, activityType, actorName, amount } = params

    try {
      let notificationType: string
      let subject: string
      let body: string

      switch (activityType) {
        case 'bid':
          notificationType = 'BID_PLACED'
          subject = `New bid on ${nftName}`
          body = `${actorName} placed a bid of ${amount} on ${nftName}`
          break
        case 'offer':
          notificationType = 'OFFER_RECEIVED'
          subject = `New offer on ${nftName}`
          body = `${actorName} made an offer of ${amount} on ${nftName}`
          break
        case 'sale':
          notificationType = 'LISTING_SOLD'
          subject = `${nftName} was sold!`
          body = `${nftName} was sold to ${actorName} for ${amount}`
          break
        default:
          return
      }

      await this.sendNotificationUseCase.execute({
        organizationId: 'default', // You'd get this from user data
        userId: ownerId,
        type: notificationType as any,
        channel: 'WEBSOCKET',
        priority: 'HIGH',
        payload: {
          to: '', // Will be filled from user data
          subject,
          body,
          nftId,
          nftName,
          activityType,
          actorName,
          amount,
        },
      })

      logger.info('NFT activity notification sent', {
        nftId,
        ownerId,
        activityType,
      })
    } catch (error) {
      logger.error('Failed to send NFT activity notification', {
        nftId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
