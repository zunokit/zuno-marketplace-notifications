import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'
import { SendNotificationUseCase } from '@/core/use-cases/notifications/send-notification.use-case'

export class DropNotificationService {
  private sendNotificationUseCase: SendNotificationUseCase

  constructor() {
    this.sendNotificationUseCase = new SendNotificationUseCase()
  }

  /**
   * Announce a new drop
   */
  async announceDrop(params: {
    dropId: string
    organizationId: string
    collectionId: string
    dropName: string
    description: string
    startTime: string
    totalSupply?: number
    pricePerNFT?: number
    imageUrl?: string
    mintUrl?: string
  }) {
    const { dropId, organizationId, collectionId, dropName, description, startTime, totalSupply, pricePerNFT, imageUrl } = params
    const startDate = new Date(startTime)

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

    logger.info('Announcing drop to watchers', {
      dropId,
      collectionId,
      watchersCount: watchers.length,
    })

    for (const watcher of watchers) {
      try {
        await this.sendNotificationUseCase.execute({
          organizationId,
          userId: watcher.userId,
          type: 'DROP_ANNOUNCED',
          channel: 'EMAIL', // Important announcement via email
          priority: 'HIGH',
          payload: {
            to: watcher.user.email,
            subject: `New Drop Announced: ${dropName}`,
            body: `${description}\n\nStarts: ${startDate.toLocaleString()}\nSupply: ${totalSupply || 'Unlimited'}\nPrice: ${pricePerNFT || 'TBA'}`,
            dropId,
            collectionId,
            dropName,
            description,
            startTime: startDate.toISOString(),
            totalSupply,
            pricePerNFT,
            imageUrl,
          },
        })
      } catch (error) {
        logger.error('Failed to announce drop to watcher', {
          watcherId: watcher.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }

  /**
   * Notify when drop is starting soon (e.g., 5 minutes before)
   */
  async notifyDropStartingSoon(params: {
    dropId: string
    dropName: string
    startTime: Date
    mintUrl: string
  }) {
    const { dropId, dropName, startTime, mintUrl } = params

    // Find all whitelist users for this drop
    const whitelistUsers = await prisma.whitelistEntry.findMany({
      where: {
        dropId,
        isApproved: true,
      },
      include: {
        user: true,
      },
    })

    logger.info('Notifying drop starting soon', {
      dropId,
      whitelistUsersCount: whitelistUsers.length,
    })

    for (const entry of whitelistUsers) {
      try {
        await this.sendNotificationUseCase.execute({
          organizationId: entry.organizationId,
          userId: entry.userId,
          type: 'DROP_STARTING_SOON',
          channel: 'WEBSOCKET', // Real-time alert
          priority: 'URGENT',
          payload: {
            to: entry.user.email,
            subject: `${dropName} starting in 5 minutes!`,
            body: `Get ready! The ${dropName} drop is starting in 5 minutes. You have ${entry.spots} spot(s) reserved.`,
            dropId,
            dropName,
            startTime: startTime.toISOString(),
            spots: entry.spots,
            mintUrl,
          },
        })

        // Also send email for redundancy
        await this.sendNotificationUseCase.execute({
          organizationId: entry.organizationId,
          userId: entry.userId,
          type: 'DROP_STARTING_SOON',
          channel: 'EMAIL',
          priority: 'URGENT',
          payload: {
            to: entry.user.email,
            subject: `⏰ ${dropName} starting in 5 minutes!`,
            body: `Get ready! The ${dropName} drop is starting in 5 minutes.\n\nYou have ${entry.spots} spot(s) reserved.\nMint URL: ${mintUrl}`,
            dropId,
            dropName,
            startTime: startTime.toISOString(),
            spots: entry.spots,
            mintUrl,
          },
        })
      } catch (error) {
        logger.error('Failed to notify drop starting soon', {
          entryId: entry.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }

  /**
   * Notify when drop goes live
   */
  async notifyDropLive(params: {
    dropId: string
    dropName: string
    mintUrl: string
  }) {
    const { dropId, dropName, mintUrl } = params

    const whitelistUsers = await prisma.whitelistEntry.findMany({
      where: {
        dropId,
        isApproved: true,
      },
      include: {
        user: true,
      },
    })

    logger.info('Notifying drop is live', {
      dropId,
      whitelistUsersCount: whitelistUsers.length,
    })

    for (const entry of whitelistUsers) {
      try {
        await this.sendNotificationUseCase.execute({
          organizationId: entry.organizationId,
          userId: entry.userId,
          type: 'DROP_LIVE',
          channel: 'WEBSOCKET',
          priority: 'URGENT',
          payload: {
            to: entry.user.email,
            subject: `🚀 ${dropName} is LIVE!`,
            body: `The ${dropName} drop is now live! Mint now: ${mintUrl}`,
            dropId,
            dropName,
            mintUrl,
          },
        })
      } catch (error) {
        logger.error('Failed to notify drop live', {
          entryId: entry.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Update drop status
    await prisma.drop.update({
      where: { id: dropId },
      data: { status: 'live' },
    })
  }

  /**
   * Notify user of whitelist approval
   */
  async notifyWhitelistApproved(params: {
    userId: string
    organizationId: string
    dropId: string
    dropName: string
    spots: number
    startTime?: string
    mintUrl?: string
  }) {
    const { userId, organizationId, dropId, dropName, spots, startTime, mintUrl } = params

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error('User not found')
      }

      await this.sendNotificationUseCase.execute({
        organizationId,
        userId,
        type: 'WHITELIST_APPROVED',
        channel: 'EMAIL',
        priority: 'HIGH',
        payload: {
          to: user.email,
          subject: `✅ You're on the whitelist for ${dropName}!`,
          body: `Congratulations! You've been approved for the ${dropName} whitelist with ${spots} spot(s).\n\nYou'll receive another notification when the drop goes live.`,
          dropId,
          dropName,
          spots,
          startTime,
          mintUrl,
        },
      })

      // Mark as notified
      await prisma.whitelistEntry.updateMany({
        where: {
          dropId,
          userId,
        },
        data: {
          hasNotified: true,
        },
      })

      logger.info('Whitelist approval notification sent', {
        userId,
        dropId,
      })
    } catch (error) {
      logger.error('Failed to send whitelist approval notification', {
        userId,
        dropId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Notify user of successful mint
   *
   * @param params - Mint success notification parameters
   * @param params.organizationId - Organization ID (required, no defaults)
   * @param params.userId - User ID who performed the mint
   * @param params.nftId - Minted NFT identifier
   * @param params.nftName - NFT name for display
   * @param params.transactionHash - Blockchain transaction hash
   * @param params.imageUrl - Optional NFT image URL
   * @param params.marketplaceUrl - Optional marketplace link
   */
  async notifyMintSuccess(params: {
    organizationId: string
    userId: string
    nftId: string
    nftName: string
    transactionHash: string
    imageUrl?: string
    marketplaceUrl?: string
  }) {
    const { organizationId, userId, nftId, nftName, transactionHash, imageUrl, marketplaceUrl } = params

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) return

      await this.sendNotificationUseCase.execute({
        organizationId, // ✅ From parameter, not hardcoded
        userId,
        type: 'MINT_SUCCESS',
        channel: 'EMAIL',
        priority: 'NORMAL',
        payload: {
          to: user.email,
          subject: `🎉 You minted ${nftName}!`,
          body: `Congratulations! You successfully minted ${nftName}.\n\nTransaction: ${transactionHash}\nView on marketplace: ${marketplaceUrl}`,
          nftId,
          nftName,
          transactionHash,
          imageUrl,
          marketplaceUrl,
        },
      })

      logger.info('Mint success notification sent', {
        organizationId,
        userId,
        nftId,
      })
    } catch (error) {
      logger.error('Failed to send mint success notification', {
        organizationId,
        userId,
        nftId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Notify user of failed mint
   *
   * @param params - Mint failure notification parameters
   * @param params.organizationId - Organization ID (required, no defaults)
   * @param params.userId - User ID who attempted the mint
   * @param params.dropName - Drop name for display
   * @param params.reason - Failure reason to display to user
   * @param params.retryUrl - Optional URL for retry attempt
   */
  async notifyMintFailed(params: {
    organizationId: string
    userId: string
    dropName: string
    reason: string
    retryUrl?: string
  }) {
    const { organizationId, userId, dropName, reason, retryUrl } = params

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) return

      await this.sendNotificationUseCase.execute({
        organizationId, // ✅ From parameter, not hardcoded
        userId,
        type: 'MINT_FAILED',
        channel: 'EMAIL',
        priority: 'HIGH',
        payload: {
          to: user.email,
          subject: `Mint failed for ${dropName}`,
          body: `Your mint for ${dropName} failed: ${reason}\n\n${retryUrl ? `Try again: ${retryUrl}` : 'Please try again later.'}`,
          dropName,
          reason,
          retryUrl,
        },
      })

      logger.info('Mint failed notification sent', {
        organizationId,
        userId,
        dropName,
      })
    } catch (error) {
      logger.error('Failed to send mint failed notification', {
        organizationId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
