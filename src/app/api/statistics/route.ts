import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/infrastructure/database/prisma'
import { logger } from '@/lib/logger/logger'

export async function GET(_request: NextRequest) {
  try {
    const [
      totalCount,
      sentCount,
      deliveredCount,
      failedCount,
      pendingCount,
    ] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { status: 'SENT' } }),
      prisma.notification.count({ where: { status: 'DELIVERED' } }),
      prisma.notification.count({ where: { status: 'FAILED' } }),
      prisma.notification.count({ where: { status: 'PENDING' } }),
    ])

    const deliveryRate =
      totalCount > 0 ? (deliveredCount / totalCount) * 100 : 100

    // Get stats by channel
    const byChannel = await prisma.notification.groupBy({
      by: ['channel'],
      _count: true,
    })

    // Get recent notifications
    const recent = await prisma.notification.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        channel: true,
        status: true,
        createdAt: true,
        sentAt: true,
        deliveredAt: true,
      },
    })

    return NextResponse.json({
      overview: {
        total: totalCount,
        sent: sentCount,
        delivered: deliveredCount,
        failed: failedCount,
        pending: pendingCount,
        deliveryRate: deliveryRate.toFixed(2),
      },
      byChannel: byChannel.map((c) => ({
        channel: c.channel,
        count: c._count,
      })),
      recent,
    })
  } catch (error) {
    logger.error('Error fetching statistics', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
