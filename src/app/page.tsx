export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold">Zuno Marketplace Notifications</h1>
        <p className="mt-4 text-lg">
          Enterprise-grade, multi-channel notification service
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">Multi-Channel Support</h2>
            <p className="mt-2 text-gray-600">
              Email, WebSocket, Push, SMS notifications
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">Reliable Delivery</h2>
            <p className="mt-2 text-gray-600">
              At-least-once semantics via Outbox Pattern
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">Scalable Architecture</h2>
            <p className="mt-2 text-gray-600">
              Horizontal scaling with stateless workers
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">Observability</h2>
            <p className="mt-2 text-gray-600">
              Structured logging, metrics, correlation IDs
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
