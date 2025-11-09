'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'

type ApiKey = {
  id: string
  name: string
  keyPrefix: string
  scopes: string[]
  isActive: boolean
  lastUsedAt: Date | null
  usageCount: number
  expiresAt: Date | null
  organization: {
    name: string
  }
}

const columns: ColumnDef<ApiKey>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'organization',
    header: 'Organization',
    cell: ({ row }) => {
      const org = row.getValue('organization') as ApiKey['organization']
      return <div>{org.name}</div>
    },
  },
  {
    accessorKey: 'keyPrefix',
    header: 'Prefix',
    cell: ({ row }) => (
      <div className="font-mono text-xs">{row.getValue('keyPrefix')}...</div>
    ),
  },
  {
    accessorKey: 'scopes',
    header: 'Scopes',
    cell: ({ row }) => {
      const scopes = row.getValue('scopes') as string[]
      return (
        <div className="flex gap-1">
          {scopes.slice(0, 2).map((scope) => (
            <Badge key={scope} variant="outline" className="text-xs">
              {scope}
            </Badge>
          ))}
          {scopes.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{scopes.length - 2}
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
    accessorKey: 'lastUsedAt',
    header: 'Last Used',
    cell: ({ row }) => {
      const date = row.getValue('lastUsedAt') as Date | null
      return (
        <div className="text-sm text-muted-foreground">
          {date ? new Date(date).toLocaleDateString() : 'Never'}
        </div>
      )
    },
  },
  {
    accessorKey: 'usageCount',
    header: 'Usage Count',
    cell: ({ row }) => {
      const count = row.getValue('usageCount') as number
      return <div className="text-sm">{count.toLocaleString()}</div>
    },
  },
  {
    accessorKey: 'expiresAt',
    header: 'Expires',
    cell: ({ row }) => {
      const date = row.getValue('expiresAt') as Date | null
      return (
        <div className="text-sm text-muted-foreground">
          {date ? new Date(date).toLocaleDateString() : 'Never'}
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">
          View
        </Button>
        <Button variant="ghost" size="sm">
          Revoke
        </Button>
      </div>
    ),
  },
]

interface ApiKeysTableProps {
  data: ApiKey[]
}

export function ApiKeysTable({ data }: ApiKeysTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No API keys found"
      pageSize={10}
    />
  )
}
