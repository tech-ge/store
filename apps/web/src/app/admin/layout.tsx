export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="bg-navy text-white px-6 py-4 font-display">Door Delivery Admin</div>
      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  )
}
