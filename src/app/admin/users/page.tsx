import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { UsersTable } from '@/components/features/users-table'
import { prisma } from '@/infrastructure/database/prisma'

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: {
      organizations: {
        include: {
          organization: true,
        },
      },
      _count: {
        select: {
          notifications: true,
        },
      },
    },
  })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">
          Manage users and their notification settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Users registered in the notification service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable data={users} />
        </CardContent>
      </Card>
    </div>
  )
}
