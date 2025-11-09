import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DeliveryAttemptsTable } from '@/components/features/delivery-attempts-table'
import { prisma } from '@/infrastructure/database/prisma'

export default async function DeliveryTrackingPage() {
  const deliveryAttempts = await prisma.deliveryAttempt.findMany({
    take: 100,
    orderBy: { attemptedAt: 'desc' },
    include: {
      notification: {
        select: {
          id: true,
          type: true,
          channel: true,
          user: { select: { email: true, name: true } },
        },
      },
    },
  })

  const recentNotifications = await prisma.notification.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    where: {
      deliveryAttempts: {
        some: {},
      },
    },
    include: {
      deliveryAttempts: {
        orderBy: { attemptedAt: 'desc' },
      },
      user: { select: { email: true, name: true } },
    },
  })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Delivery Tracking</h1>
        <p className="text-muted-foreground">
          Monitor delivery attempts and track notification delivery status
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Delivery Attempts</CardTitle>
            <CardDescription>
              Latest 100 delivery attempts across all channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeliveryAttemptsTable data={deliveryAttempts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications with Attempt History</CardTitle>
            <CardDescription>
              Detailed view of notifications and their delivery attempts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentNotifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No notifications with delivery attempts found
                </p>
              ) : (
                recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">
                          {notification.type} -{' '}
                          {notification.user.name || notification.user.email}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {notification.channel} • Created{' '}
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <Badge
                        variant={
                          notification.status === 'DELIVERED'
                            ? 'default'
                            : notification.status === 'FAILED'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {notification.status}
                      </Badge>
                    </div>

                    <div className="pl-4 border-l-2 space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Delivery Attempts ({notification.deliveryAttempts.length})
                      </div>
                      {notification.deliveryAttempts.map((attempt, idx) => (
                        <div
                          key={attempt.id}
                          className="text-sm flex items-center gap-2"
                        >
                          <Badge
                            variant="outline"
                            className="w-16 justify-center"
                          >
                            #{idx + 1}
                          </Badge>
                          <span className="text-muted-foreground">
                            {new Date(attempt.attemptedAt).toLocaleString()}
                          </span>
                          <Badge
                            variant={attempt.success ? 'default' : 'destructive'}
                          >
                            {attempt.success ? 'Success' : 'Failed'}
                          </Badge>
                          {attempt.provider && (
                            <span className="text-xs text-muted-foreground">
                              via {attempt.provider}
                            </span>
                          )}
                          {attempt.duration && (
                            <span className="text-xs text-muted-foreground">
                              ({attempt.duration}ms)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
