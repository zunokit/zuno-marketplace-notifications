'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'

type Webhook = {
  id: string
  url: string
  events: string[]
  isActive: boolean
  lastTriggeredAt: Date | null
  failureCount: number
  organization: {
    name: string
  }
}

const columns: ColumnDef<Webhook>[] = [
  {
    accessorKey: 'url',
    header: 'URL',
    cell: ({ row }) => {
      const url = row.getValue('url') as string
      return (
        <div className="font-mono text-sm">
          {url.length > 50 ? url.substring(0, 50) + '...' : url}
        </div>
      )
    },
  },
  {
    accessorKey: 'organization',
    header: 'Organization',
    cell: ({ row }) => {
      const org = row.getValue('organization') as Webhook['organization']
      return <div>{org.name}</div>
    },
  },
  {
    accessorKey: 'events',
    header: 'Events',
    cell: ({ row }) => {
      const events = row.getValue('events') as string[]
      return (
        <div className="flex gap-1">
          {events.slice(0, 2).map((event) => (
            <Badge key={event} variant="outline" className="text-xs">
              {event}
            </Badge>
          ))}
          {events.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{events.length - 2}
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'lastTriggeredAt',
    header: 'Last Triggered',
    cell: ({ row }) => {
      const date = row.getValue('lastTriggeredAt') as Date | null
      return (
        <div className="text-sm text-muted-foreground">
          {date ? new Date(date).toLocaleString() : 'Never'}
        </div>
      )
    },
  },
  {
    accessorKey: 'failureCount',
    header: 'Failure Count',
    cell: ({ row }) => {
      const count = row.getValue('failureCount') as number
      return (
        <Badge
          variant={
            count > 10
              ? 'destructive'
              : count > 0
                ? 'secondary'
                : 'default'
          }
        >
          {count}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => (
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
    ),
  },
]

interface WebhooksTableProps {
  data: Webhook[]
}

export function WebhooksTable({ data }: WebhooksTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No webhooks found"
      pageSize={10}
    />
  )
}
