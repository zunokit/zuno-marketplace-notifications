import Link from 'next/link'
import { Bell, BarChart3, FileText, Settings, Users, Webhook, Key, Calendar } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Templates', href: '/admin/templates', icon: FileText },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Delivery Tracking', href: '/admin/delivery', icon: Calendar },
  { name: 'Preferences', href: '/admin/preferences', icon: Settings },
  { name: 'API Keys', href: '/admin/api-keys', icon: Key },
  { name: 'Webhooks', href: '/admin/webhooks', icon: Webhook },
  { name: 'Users', href: '/admin/users', icon: Users },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-gray-50">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-lg font-semibold">Zuno Notifications</h1>
        </div>
        <nav className="space-y-1 p-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href as any}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <header className="border-b bg-white">
          <div className="flex h-16 items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Admin Dashboard</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Admin User</span>
            </div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}

