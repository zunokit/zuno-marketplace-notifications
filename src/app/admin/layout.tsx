export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-lg font-semibold">Zuno Notifications Admin</h1>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
