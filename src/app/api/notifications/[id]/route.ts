import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const notification = await prisma.notification.findUnique({
      where: { id },
      include: {
        organization: { select: { name: true } },
        user: { select: { email: true, name: true } },
        template: { select: { name: true, slug: true } },
        deliveryAttempts: {
          orderBy: { attemptedAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(notification)
  } catch (error) {
    logger.error('Error fetching notification', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
