export function Footer() {
  return (
    <footer className="mt-16 border-t border-surface-border bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-6 px-4 py-8 text-sm text-text-muted sm:px-6 lg:px-8">
        <div className="font-medium text-navy">Door Delivery <span className="font-normal text-text-muted">· Worldwide stores, one checkout.</span></div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a href="/docs/api.md">API</a>
          <a href="/docs/architecture.md">Architecture</a>
          <a href="/docs/payments.md">Payments</a>
        </div>
      </div>
    </footer>
  )
}
