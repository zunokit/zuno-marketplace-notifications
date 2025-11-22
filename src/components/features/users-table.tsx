'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'

type User = {
  id: string
  name: string | null
  email: string
  emailVerified: boolean
  createdAt: Date
  organizations: {
    id: string
    organization: {
      name: string
    }
  }[]
  _count: {
    notifications: number
  }
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const name = row.getValue('name') as string | null
      return <div className="font-medium">{name || 'N/A'}</div>
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'organizations',
    header: 'Organizations',
    cell: ({ row }) => {
      const orgs = row.getValue('organizations') as User['organizations']
      return (
        <div className="flex gap-1">
          {orgs.slice(0, 2).map((org) => (
            <Badge key={org.id} variant="outline" className="text-xs">
              {org.organization.name}
            </Badge>
          ))}
          {orgs.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{orgs.length - 2}
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'emailVerified',
    header: 'Verified',
    cell: ({ row }) => {
      const verified = row.getValue('emailVerified') as boolean
      return (
        <Badge variant={verified ? 'default' : 'secondary'}>
          {verified ? 'Verified' : 'Unverified'}
        </Badge>
      )
    },
  },
  {
    accessorKey: '_count',
    header: 'Notifications',
    cell: ({ row }) => {
      const count = row.getValue('_count') as User['_count']
      return <div className="text-sm">{count.notifications}</div>
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      return (
        <div className="text-sm text-muted-foreground">
          {new Date(date).toLocaleDateString()}
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
          Preferences
        </Button>
      </div>
    ),
  },
]

interface UsersTableProps {
  data: User[]
}

export function UsersTable({ data }: UsersTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No users found"
      pageSize={10}
    />
  )
}
