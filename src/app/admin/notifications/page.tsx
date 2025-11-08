import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { prisma } from '@/infrastructure/database/prisma'

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No notifications found
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">
                      {notification.type}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{notification.channel}</Badge>
                    </TableCell>
                    <TableCell>
                      {notification.user.name || notification.user.email}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{notification.priority}</TableCell>
                    <TableCell>
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
