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

export default async function ApiKeysPage() {
  const apiKeys = await prisma.apiKey.findMany({
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
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for external integrations
          </p>
        </div>
        <Button>Create API Key</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All API Keys</CardTitle>
          <CardDescription>
            API keys for programmatic access to the notification service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Usage Count</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    No API keys found
                  </TableCell>
                </TableRow>
              ) : (
                apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>{key.organization.name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {key.keyPrefix}...
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {key.scopes.slice(0, 2).map((scope) => (
                          <Badge key={scope} variant="outline" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                        {key.scopes.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{key.scopes.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={key.isActive ? 'default' : 'secondary'}
                      >
                        {key.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {key.lastUsedAt
                        ? new Date(key.lastUsedAt).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {key.usageCount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {key.expiresAt
                        ? new Date(key.expiresAt).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          Revoke
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
