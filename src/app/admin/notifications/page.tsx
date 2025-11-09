import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { NotificationsTable } from '@/components/features/notifications-table'
import { prisma } from '@/infrastructure/database/prisma'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const notifications = await prisma.notification.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { email: true, name: true } },
      organization: { select: { name: true } },
    },
  })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          View and manage all notifications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            Last 50 notifications sent through the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationsTable data={notifications} />
        </CardContent>
      </Card>
    </div>
  )
}
