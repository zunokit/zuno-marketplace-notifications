import { NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/database/prisma'

export async function GET() {
  try {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000)

    // Gather metrics
    const [
      totalNotifications,
      pendingNotifications,
      sentNotifications,
      failedNotifications,
      notificationsLast24h,
      notificationsLastHour,
      avgDeliveryTime,
      notificationsByChannel,
      notificationsByStatus,
      retryQueueSize,
    ] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { status: 'PENDING' } }),
      prisma.notification.count({ where: { status: 'SENT' } }),
      prisma.notification.count({ where: { status: 'FAILED' } }),
      prisma.notification.count({
        where: { createdAt: { gte: last24Hours } },
      }),
      prisma.notification.count({
        where: { createdAt: { gte: lastHour } },
      }),
      prisma.$queryRaw<
        Array<{ avg: number }>
      >`SELECT AVG(EXTRACT(EPOCH FROM (sent_at - created_at))) as avg FROM notifications WHERE sent_at IS NOT NULL`,
      prisma.notification.groupBy({
        by: ['channel'],
        _count: true,
      }),
      prisma.notification.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.notification.count({
        where: {
          status: 'FAILED',
          retryCount: {
            lt: 5,
          },
        },
      }),
    ])

    const avgDeliverySeconds = avgDeliveryTime[0]?.avg || 0

    // Build Prometheus-formatted metrics
    const metrics: string[] = []

    // Help and type definitions
    metrics.push('# HELP notifications_total Total number of notifications')
    metrics.push('# TYPE notifications_total counter')
    metrics.push(`notifications_total ${totalNotifications}`)
    metrics.push('')

    metrics.push(
      '# HELP notifications_pending Number of pending notifications'
    )
    metrics.push('# TYPE notifications_pending gauge')
    metrics.push(`notifications_pending ${pendingNotifications}`)
    metrics.push('')

    metrics.push('# HELP notifications_sent Number of sent notifications')
    metrics.push('# TYPE notifications_sent counter')
    metrics.push(`notifications_sent ${sentNotifications}`)
    metrics.push('')

    metrics.push('# HELP notifications_failed Number of failed notifications')
    metrics.push('# TYPE notifications_failed counter')
    metrics.push(`notifications_failed ${failedNotifications}`)
    metrics.push('')

    metrics.push(
      '# HELP notifications_last_24h Notifications in the last 24 hours'
    )
    metrics.push('# TYPE notifications_last_24h counter')
    metrics.push(`notifications_last_24h ${notificationsLast24h}`)
    metrics.push('')

    metrics.push(
      '# HELP notifications_last_hour Notifications in the last hour'
    )
    metrics.push('# TYPE notifications_last_hour counter')
    metrics.push(`notifications_last_hour ${notificationsLastHour}`)
    metrics.push('')

    metrics.push(
      '# HELP notification_delivery_time_seconds Average delivery time in seconds'
    )
    metrics.push('# TYPE notification_delivery_time_seconds gauge')
    metrics.push(`notification_delivery_time_seconds ${avgDeliverySeconds}`)
    metrics.push('')

    metrics.push('# HELP notifications_by_channel Notifications by channel')
    metrics.push('# TYPE notifications_by_channel gauge')
    notificationsByChannel.forEach((item) => {
      metrics.push(
        `notifications_by_channel{channel="${item.channel}"} ${item._count}`
      )
    })
    metrics.push('')

    metrics.push('# HELP notifications_by_status Notifications by status')
    metrics.push('# TYPE notifications_by_status gauge')
    notificationsByStatus.forEach((item) => {
      metrics.push(
        `notifications_by_status{status="${item.status}"} ${item._count}`
      )
    })
    metrics.push('')

    metrics.push(
      '# HELP retry_queue_size Number of notifications waiting for retry'
    )
    metrics.push('# TYPE retry_queue_size gauge')
    metrics.push(`retry_queue_size ${retryQueueSize}`)
    metrics.push('')

    metrics.push(
      '# HELP notification_success_rate Success rate of notifications'
    )
    metrics.push('# TYPE notification_success_rate gauge')
    const successRate =
      totalNotifications > 0 ? sentNotifications / totalNotifications : 0
    metrics.push(`notification_success_rate ${successRate}`)
    metrics.push('')

    // Return metrics in Prometheus text format
    return new NextResponse(metrics.join('\n'), {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
