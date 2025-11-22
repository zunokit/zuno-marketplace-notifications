import { NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'
import { withAuth } from '@/lib/api/route-handler'

const CreateTemplateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  channel: z.enum(['EMAIL', 'WEBSOCKET', 'PUSH', 'SMS']),
  type: z.enum([
    'WELCOME',
    'AUCTION_WON',
    'BID_PLACED',
    'EMAIL_VERIFICATION',
    'CUSTOM',
  ]).optional(),
  subject: z.string().optional(),
  body: z.string().min(1),
  bodyText: z.string().optional(),
  variables: z.array(z.string()),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  fromName: z.string().optional(),
  fromEmail: z.string().email().optional(),
  replyTo: z.string().email().optional(),
})

export const POST = withAuth(async (request, { user, organization }) => {
  try {
    const body = await request.json()
    const validated = CreateTemplateSchema.parse(body)

    const template = await prisma.template.create({
      data: {
        ...validated,
        organizationId: organization.id, // ✅ From authenticated context
        createdBy: user.id,
      },
    })

    logger.info('Template created', {
      templateId: template.id,
      organizationId: organization.id,
      userId: user.id,
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Error creating template', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
