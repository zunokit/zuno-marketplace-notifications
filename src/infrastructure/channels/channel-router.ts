import { Channel } from '@prisma/client'

import { INotificationChannel } from './channel.interface'
import { EmailChannel } from './email/email.channel'
import { logger } from '@/lib/logger/logger'

export class ChannelRouter {
  private channels: Map<Channel, INotificationChannel>

  constructor() {
    this.channels = new Map()
    this.registerChannels()
  }

  private registerChannels(): void {
    // Register Email channel
    const emailChannel = new EmailChannel()
    this.channels.set('EMAIL', emailChannel)

    logger.info('ChannelRouter: Registered channels', {
      channels: Array.from(this.channels.keys()),
    })
  }

  getChannel(channelType: Channel): INotificationChannel {
    const channel = this.channels.get(channelType)

    if (!channel) {
      throw new Error(`Channel ${channelType} is not registered`)
    }

    return channel
  }

  isChannelAvailable(channelType: Channel): boolean {
    return this.channels.has(channelType)
  }

  getAvailableChannels(): Channel[] {
    return Array.from(this.channels.keys())
  }
}
