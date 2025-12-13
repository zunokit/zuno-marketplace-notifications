'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'

type Template = {
  id: string
  name: string
  slug: string
  channel: string
  type: string | null
  version: number
  isActive: boolean
}

const columns: ColumnDef<Template>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
    cell: ({ row }) => (
      <code className="rounded bg-muted px-2 py-1 text-xs">
        {row.getValue('slug')}
      </code>
    ),
  },
  {
    accessorKey: 'channel',
    header: 'Channel',
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue('channel')}</Badge>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string | null
      return <div>{type || 'N/A'}</div>
    },
  },
  {
    accessorKey: 'version',
    header: 'Version',
    cell: ({ row }) => <div>v{row.getValue('version')}</div>,
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
    id: 'actions',
    header: 'Actions',
    cell: () => (
      <Button variant="ghost" size="sm">
        Edit
      </Button>
    ),
  },
]

interface TemplatesTableProps {
  data: Template[]
}

export function TemplatesTable({ data }: TemplatesTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No templates found"
      pageSize={10}
    />
  )
}
