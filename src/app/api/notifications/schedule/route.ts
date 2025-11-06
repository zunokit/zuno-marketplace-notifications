import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'

const ScheduleNotificationSchema = z.object({
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum([
    'WELCOME',
    'AUCTION_WON',
    'BID_PLACED',
    'EMAIL_VERIFICATION',
    'CUSTOM',
  ]),
  channel: z.enum(['EMAIL', 'WEBSOCKET', 'PUSH', 'SMS']),
  scheduledAt: z.string().datetime(),
  templateSlug: z.string().optional(),
  payload: z.record(z.unknown()),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = ScheduleNotificationSchema.parse(body)

    const scheduledAt = new Date(validated.scheduledAt)

    // Check if scheduled time is in the past
    if (scheduledAt < new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      )
    }

    // Find template if slug is provided
    let templateId: string | undefined
    if (validated.templateSlug) {
      const template = await prisma.template.findFirst({
        where: {
          slug: validated.templateSlug,
          organizationId: validated.organizationId,
          isActive: true,
        },
      })
      templateId = template?.id
    }

    // Create the notification with scheduled status
    const notification = await prisma.notification.create({
      data: {
        type: validated.type,
        channel: validated.channel,
        status: 'PENDING',
        priority: validated.priority,
        scheduledAt,
        payload: validated.payload as any,
        organizationId: validated.organizationId,
        userId: validated.userId,
        ...(templateId && { templateId }),
      },
    })

    logger.info('Notification scheduled', {
      notificationId: notification.id,
      scheduledAt: notification.scheduledAt,
      organizationId: validated.organizationId,
      userId: validated.userId,
    })

    return NextResponse.json(
      {
        id: notification.id,
        type: notification.type,
        channel: notification.channel,
        status: notification.status,
        scheduledAt: notification.scheduledAt,
        priority: notification.priority,
        organizationId: notification.organizationId,
        userId: notification.userId,
        createdAt: notification.createdAt,
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

    logger.error('Error scheduling notification', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Failed to schedule notification' },
      { status: 500 }
    )
  }
}
