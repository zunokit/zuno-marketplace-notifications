import Handlebars from 'handlebars'
import { render } from '@react-email/render'
import * as React from 'react'

import { prisma } from '@/infrastructure/database/prisma'

// React Email templates
import WelcomeEmail from '@/components/emails/welcome-email'
import AuctionWonEmail from '@/components/emails/auction-won-email'
import AuctionOutbidEmail from '@/components/emails/nft/auction-outbid-email'
import DropAnnouncementEmail from '@/components/emails/nft/drop-announcement-email'
import FloorPriceDropEmail from '@/components/emails/nft/floor-price-drop-email'
import MintSuccessEmail from '@/components/emails/nft/mint-success-email'
import RoyaltyReceivedEmail from '@/components/emails/nft/royalty-received-email'
import WhitelistApprovedEmail from '@/components/emails/nft/whitelist-approved-email'
import BidReceivedEmail from '@/components/emails/nft/bid-received-email'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReactEmailComponent = React.FC<any>

export class TemplateService {
  private templates: Map<string, ReactEmailComponent> = new Map()

  constructor() {
    // Register React Email templates
    this.templates.set('welcome-email', WelcomeEmail)
    this.templates.set('auction-won-email', AuctionWonEmail)
    this.templates.set('auction-outbid-email', AuctionOutbidEmail)
    this.templates.set('drop-announcement-email', DropAnnouncementEmail)
    this.templates.set('floor-price-drop-email', FloorPriceDropEmail)
    this.templates.set('mint-success-email', MintSuccessEmail)
    this.templates.set('royalty-received-email', RoyaltyReceivedEmail)
    this.templates.set('whitelist-approved-email', WhitelistApprovedEmail)
    this.templates.set('bid-received-email', BidReceivedEmail)
  }

  /**
   * Get list of available React Email templates
   */
  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys())
  }

  /**
   * Check if a React Email template exists
   */
  hasReactTemplate(slug: string): boolean {
    return this.templates.has(slug)
  }

  /**
   * Render a React Email template directly (without database)
   */
  async renderReactTemplate(
    slug: string,
    variables: Record<string, unknown>
  ): Promise<string> {
    const Template = this.templates.get(slug)
    if (!Template) {
      throw new Error(`React Email template not found: ${slug}`)
    }
    return await render(React.createElement(Template, variables))
  }

  async renderTemplate(
    templateId: string,
    variables: Record<string, unknown>
  ): Promise<{ subject: string; body: string }> {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    // Check if it's a React Email template
    const ReactTemplate = this.templates.get(template.slug)
    if (ReactTemplate) {
      const html = await render(React.createElement(ReactTemplate, variables))
      const compiledSubject = Handlebars.compile(template.subject || '')

      return {
        subject: compiledSubject(variables),
        body: html,
      }
    }

    // Fallback to Handlebars template
    const compiledSubject = Handlebars.compile(template.subject || '')
    const compiledBody = Handlebars.compile(template.body)

    return {
      subject: compiledSubject(variables),
      body: compiledBody(variables),
    }
  }

  async renderTemplateBySlug(
    slug: string,
    variables: Record<string, unknown>
  ): Promise<{ subject: string; body: string }> {
    const template = await prisma.template.findFirst({
      where: {
        slug,
        isActive: true,
      },
      orderBy: {
        version: 'desc',
      },
    })

    if (!template) {
      throw new Error(`Template not found: ${slug}`)
    }

    return this.renderTemplate(template.id, variables)
  }
}
