import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TemplatesTable } from '@/components/features/templates-table'
import { prisma } from '@/infrastructure/database/prisma'

export default async function TemplatesPage() {
  const templates = await prisma.template.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Manage notification templates
          </p>
        </div>
        <Button>Create Template</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
          <CardDescription>
            Templates for different notification channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplatesTable data={templates} />
        </CardContent>
      </Card>
    </div>
  )
}
