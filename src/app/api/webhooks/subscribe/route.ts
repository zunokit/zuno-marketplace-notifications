import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'

const SubscribeWebhookSchema = z.object({
  organizationId: z.string().uuid(),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  description: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = SubscribeWebhookSchema.parse(body)

    // Generate webhook secret
    const secret = nanoid(32)

    // Create webhook subscription
    const webhook = await prisma.webhook.create({
      data: {
        url: validated.url,
        events: validated.events,
        secret,
        description: validated.description,
        isActive: true,
        organization: {
          connect: { id: validated.organizationId },
        },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    logger.info('Webhook subscription created', {
      webhookId: webhook.id,
      organizationId: validated.organizationId,
      url: validated.url,
    })

    return NextResponse.json(
      {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        secret: webhook.secret, // Return secret only once
        description: webhook.description,
        isActive: webhook.isActive,
        organization: webhook.organization,
        createdAt: webhook.createdAt,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Error creating webhook subscription', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Failed to create webhook subscription' },
      { status: 500 }
    )
  }
}
