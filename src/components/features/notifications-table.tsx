'use client'

import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'

type Notification = {
  id: string
  type: string
  channel: string
  status: string
  priority: string
  createdAt: Date
  user: {
    email: string
    name: string | null
  }
  organization: {
    name: string
  }
}

const columns: ColumnDef<Notification>[] = [
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => <div className="font-medium">{row.getValue('type')}</div>,
  },
  {
    accessorKey: 'channel',
    header: 'Channel',
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue('channel')}</Badge>
    ),
  },
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => {
      const user = row.getValue('user') as Notification['user']
      return <div>{user.name || user.email}</div>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge
          variant={
            status === 'DELIVERED'
              ? 'default'
              : status === 'FAILED'
                ? 'destructive'
                : 'secondary'
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      return <div>{new Date(date).toLocaleDateString()}</div>
    },
  },
]

interface NotificationsTableProps {
  data: Notification[]
}

export function NotificationsTable({ data }: NotificationsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No notifications found"
      pageSize={10}
    />
  )
}
