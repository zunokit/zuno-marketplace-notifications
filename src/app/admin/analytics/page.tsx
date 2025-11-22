import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { prisma } from '@/infrastructure/database/prisma'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const [totalCount, sentCount, deliveredCount, failedCount] =
    await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { status: 'SENT' } }),
      prisma.notification.count({ where: { status: 'DELIVERED' } }),
      prisma.notification.count({ where: { status: 'FAILED' } }),
    ])

  const deliveryRate =
    totalCount > 0 ? ((deliveredCount / totalCount) * 100).toFixed(2) : '100.00'

  const byChannel = await prisma.notification.groupBy({
    by: ['channel'],
    _count: true,
  })

  const byType = await prisma.notification.groupBy({
    by: ['type'],
    _count: true,
  })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Notification performance and insights
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>By Channel</CardTitle>
            <CardDescription>
              Distribution across notification channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {byChannel.map((item) => (
                <div key={item.channel} className="flex justify-between">
                  <span className="font-medium">{item.channel}</span>
                  <span className="text-muted-foreground">{item._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By Type</CardTitle>
            <CardDescription>Distribution by notification type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {byType.slice(0, 10).map((item) => (
                <div key={item.type} className="flex justify-between">
                  <span className="font-medium">{item.type}</span>
                  <span className="text-muted-foreground">{item._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Delivery Rate</CardTitle>
          <CardDescription>
            Percentage of successfully delivered notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{deliveryRate}%</div>
          <p className="text-sm text-muted-foreground mt-2">
            {deliveredCount} out of {totalCount} notifications delivered
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
