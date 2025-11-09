import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ApiKeysTable } from '@/components/features/api-keys-table'
import { prisma } from '@/infrastructure/database/prisma'

export const dynamic = 'force-dynamic'

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
          <ApiKeysTable data={apiKeys} />
        </CardContent>
      </Card>
    </div>
  )
}
