export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 text-sm text-text-muted flex flex-wrap gap-6 justify-between">
        <div>Door Delivery. Worldwide stores, one checkout.</div>
        <div className="flex gap-4">
          <a href="/docs/api.md">API</a>
          <a href="/docs/architecture.md">Architecture</a>
          <a href="/docs/payments.md">Payments</a>
        </div>
      </div>
    </footer>
  )
}
