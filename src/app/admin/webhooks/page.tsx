import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { WebhooksTable } from '@/components/features/webhooks-table'
import { prisma } from '@/infrastructure/database/prisma'

export const dynamic = 'force-dynamic'

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
          <WebhooksTable data={webhooks} />
        </CardContent>
      </Card>
    </div>
  )
}
