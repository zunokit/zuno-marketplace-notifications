export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold">Zuno Marketplace Notifications</h1>
        <p className="text-xl text-muted-foreground">
          Enterprise-grade multi-channel notification service
        </p>
        <div className="flex gap-4 mt-8">
          <a
            href="/api/health"
            className="rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Check Health
          </a>
          <a
            href="/admin"
            className="rounded-lg border border-border px-6 py-3 hover:bg-accent transition-colors"
          >
            Admin Dashboard
          </a>
        </div>
      </main>
    </div>
  )
}
