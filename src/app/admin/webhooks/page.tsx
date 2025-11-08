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

export default async function WebhooksPage() {
  const webhooks = await prisma.webhook.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      organization: {
        select: {
          name: true,
        },
      },
    },
  })

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground">
            Manage webhook subscriptions for external integrations
          </p>
        </div>
        <Button>Create Webhook</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Webhooks</CardTitle>
          <CardDescription>
            Webhook endpoints that receive notification events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Triggered</TableHead>
                <TableHead>Failure Count</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No webhooks found
                  </TableCell>
                </TableRow>
              ) : (
                webhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell className="font-mono text-sm">
                      {webhook.url.length > 50
                        ? webhook.url.substring(0, 50) + '...'
                        : webhook.url}
                    </TableCell>
                    <TableCell>{webhook.organization.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {webhook.events.slice(0, 2).map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                        {webhook.events.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{webhook.events.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={webhook.isActive ? 'default' : 'secondary'}
                      >
                        {webhook.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {webhook.lastTriggeredAt
                        ? new Date(webhook.lastTriggeredAt).toLocaleString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          webhook.failureCount > 10
                            ? 'destructive'
                            : webhook.failureCount > 0
                              ? 'secondary'
                              : 'default'
                        }
                      >
                        {webhook.failureCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          Test
                        </Button>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          Delete
                        </Button>
                      </div>
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
