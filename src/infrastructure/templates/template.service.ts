import Handlebars from 'handlebars'
import { render } from '@react-email/render'

import { prisma } from '@/infrastructure/database/prisma'
import WelcomeEmail from '@/emails/welcome-email'
import AuctionWonEmail from '@/emails/auction-won-email'

export class TemplateService {
  private templates: Map<string, any> = new Map()

  constructor() {
    // Register React Email templates
    this.templates.set('welcome-email', WelcomeEmail)
    this.templates.set('auction-won-email', AuctionWonEmail)
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
    const reactTemplate = this.templates.get(template.slug)
    if (reactTemplate) {
      const html = await render(reactTemplate(variables))
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
