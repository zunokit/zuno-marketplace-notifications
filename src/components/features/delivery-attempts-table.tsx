'use client'

import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'

type DeliveryAttempt = {
  id: string
  attemptedAt: Date
  success: boolean
  provider: string | null
  duration: number | null
  error: string | null
  notification: {
    id: string
    type: string
    channel: string
    user: {
      email: string
      name: string | null
    }
  }
}

const columns: ColumnDef<DeliveryAttempt>[] = [
  {
    accessorKey: 'attemptedAt',
    header: 'Timestamp',
    cell: ({ row }) => {
      const date = row.getValue('attemptedAt') as Date
      return <div className="text-sm">{new Date(date).toLocaleString()}</div>
    },
  },
  {
    accessorKey: 'notification',
    id: 'user',
    header: 'User',
    cell: ({ row }) => {
      const notification = row.getValue('notification') as DeliveryAttempt['notification']
      return (
        <div className="font-medium">
          {notification.user.name || notification.user.email}
        </div>
      )
    },
  },
  {
    accessorKey: 'notification',
    id: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const notification = row.getValue('notification') as DeliveryAttempt['notification']
      return <div>{notification.type}</div>
    },
  },
  {
    accessorKey: 'notification',
    id: 'channel',
    header: 'Channel',
    cell: ({ row }) => {
      const notification = row.getValue('notification') as DeliveryAttempt['notification']
      return <Badge variant="outline">{notification.channel}</Badge>
    },
  },
  {
    accessorKey: 'success',
    header: 'Status',
    cell: ({ row }) => {
      const success = row.getValue('success') as boolean
      return (
        <Badge variant={success ? 'default' : 'destructive'}>
          {success ? 'Success' : 'Failed'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'provider',
    header: 'Provider',
    cell: ({ row }) => {
      const provider = row.getValue('provider') as string | null
      return (
        <div className="text-sm text-muted-foreground">
          {provider || 'N/A'}
        </div>
      )
    },
  },
  {
    accessorKey: 'duration',
    header: 'Response Time',
    cell: ({ row }) => {
      const duration = row.getValue('duration') as number | null
      return (
        <div className="text-sm text-muted-foreground">
          {duration ? `${duration}ms` : 'N/A'}
        </div>
      )
    },
  },
  {
    accessorKey: 'error',
    header: 'Error',
    cell: ({ row }) => {
      const error = row.getValue('error') as string | null
      if (!error) {
        return <span className="text-xs text-muted-foreground">-</span>
      }
      return (
        <span className="text-xs text-red-600">
          {error.substring(0, 50)}
          {error.length > 50 ? '...' : ''}
        </span>
      )
    },
  },
]

interface DeliveryAttemptsTableProps {
  data: DeliveryAttempt[]
}

export function DeliveryAttemptsTable({ data }: DeliveryAttemptsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No delivery attempts found"
      pageSize={10}
    />
  )
}
