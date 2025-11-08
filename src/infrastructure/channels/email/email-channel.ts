import { env } from '@/lib/config/env'

import type { IChannel } from '../base-channel'
import { MailpitProvider } from './mailpit-provider'
import { ResendProvider } from './resend-provider'

export class EmailChannel {
  private provider: IChannel

  constructor() {
    // Use Mailpit for development, Resend for production
    this.provider =
      env.NODE_ENV === 'production'
        ? new ResendProvider()
        : new MailpitProvider()
  }

  getProvider(): IChannel {
    return this.provider
  }
}
