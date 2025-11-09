'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'

type UserPreference = {
  user: { email: string; name: string | null }
  channels: Record<string, boolean>
  frequency: string
  timezone: string | null
}

const columns: ColumnDef<UserPreference>[] = [
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => {
      const user = row.getValue('user') as UserPreference['user']
      return <div className="font-medium">{user.name || 'N/A'}</div>
    },
  },
  {
    accessorKey: 'channels',
    id: 'email',
    header: 'Email',
    cell: ({ row }) => {
      const channels = row.getValue('channels') as Record<string, boolean>
      return (
        <Badge variant={channels.EMAIL ? 'default' : 'secondary'}>
          {channels.EMAIL ? 'Enabled' : 'Disabled'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'channels',
    id: 'websocket',
    header: 'WebSocket',
    cell: ({ row }) => {
      const channels = row.getValue('channels') as Record<string, boolean>
      return (
        <Badge variant={channels.WEBSOCKET ? 'default' : 'secondary'}>
          {channels.WEBSOCKET ? 'Enabled' : 'Disabled'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'channels',
    id: 'push',
    header: 'Push',
    cell: ({ row }) => {
      const channels = row.getValue('channels') as Record<string, boolean>
      return (
        <Badge variant={channels.PUSH ? 'default' : 'secondary'}>
          {channels.PUSH ? 'Enabled' : 'Disabled'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'channels',
    id: 'sms',
    header: 'SMS',
    cell: ({ row }) => {
      const channels = row.getValue('channels') as Record<string, boolean>
      return (
        <Badge variant={channels.SMS ? 'default' : 'secondary'}>
          {channels.SMS ? 'Enabled' : 'Disabled'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'frequency',
    header: 'Frequency',
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue('frequency')}</Badge>
    ),
  },
  {
    accessorKey: 'timezone',
    header: 'Timezone',
    cell: ({ row }) => {
      const timezone = row.getValue('timezone') as string | null
      return (
        <div className="text-sm text-muted-foreground">
          {timezone || 'N/A'}
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => (
      <Button variant="ghost" size="sm">
        Edit
      </Button>
    ),
  },
]

interface PreferencesTableProps {
  data: UserPreference[]
}

export function PreferencesTable({ data }: PreferencesTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No preferences found"
      pageSize={10}
    />
  )
}
