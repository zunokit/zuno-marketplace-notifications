import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const preferences = await prisma.userPreference.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ preferences })
  } catch (error) {
    logger.error('Error fetching preferences', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const body = await request.json()

    const preference = await prisma.userPreference.upsert({
      where: {
        userId_channel_type: {
          userId,
          channel: body.channel,
          type: body.type || 'WELCOME',
        },
      },
      update: {
        enabled: body.enabled,
        frequency: body.frequency,
        quietHoursStart: body.quietHoursStart,
        quietHoursEnd: body.quietHoursEnd,
        timezone: body.timezone,
      },
      create: {
        userId,
        channel: body.channel,
        type: body.type,
        enabled: body.enabled,
        frequency: body.frequency || 'REALTIME',
        quietHoursStart: body.quietHoursStart,
        quietHoursEnd: body.quietHoursEnd,
        timezone: body.timezone,
      },
    })

    logger.info('Preference updated', { userId, preferenceId: preference.id })

    return NextResponse.json(preference)
  } catch (error) {
    logger.error('Error updating preference', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
