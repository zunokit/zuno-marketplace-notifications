import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

export default async function PreferencesPage() {
  const preferences = await prisma.userPreference.findMany({
    take: 100,
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { email: true, name: true } },
    },
  })

  // Group preferences by user
  const userPrefs = preferences.reduce(
    (acc, pref) => {
      const userId = pref.userId
      if (!acc[userId]) {
        acc[userId] = {
          user: pref.user,
          channels: {},
          frequency: pref.frequency,
          timezone: pref.timezone,
        }
      }
      acc[userId].channels[pref.channel] = pref.enabled
      return acc
    },
    {} as Record<
      string,
      {
        user: { email: string; name: string | null }
        channels: Record<string, boolean>
        frequency: string
        timezone: string | null
      }
    >
  )

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Preferences</h1>
        <p className="text-muted-foreground">
          Manage notification preferences for all users
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All User Preferences</CardTitle>
          <CardDescription>
            Channel settings and notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>WebSocket</TableHead>
                <TableHead>Push</TableHead>
                <TableHead>SMS</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Timezone</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.keys(userPrefs).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No preferences found
                  </TableCell>
                </TableRow>
              ) : (
                Object.entries(userPrefs).map(([userId, data]) => (
                  <TableRow key={userId}>
                    <TableCell className="font-medium">
                      {data.user.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={data.channels.EMAIL ? 'default' : 'secondary'}
                      >
                        {data.channels.EMAIL ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          data.channels.WEBSOCKET ? 'default' : 'secondary'
                        }
                      >
                        {data.channels.WEBSOCKET ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={data.channels.PUSH ? 'default' : 'secondary'}
                      >
                        {data.channels.PUSH ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={data.channels.SMS ? 'default' : 'secondary'}
                      >
                        {data.channels.SMS ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{data.frequency}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {data.timezone || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
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
