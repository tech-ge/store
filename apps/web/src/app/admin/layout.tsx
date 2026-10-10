import Link from 'next/link'
import { LogoutButton } from '@/components/auth/LogoutButton'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/admin" className="font-display text-lg">Door Delivery · Admin</Link>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <Link href="/" className="hover:text-white">Storefront</Link>
            <LogoutButton className="!text-white/80 hover:!text-white" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <nav className="bg-white rounded-xl border border-surface-border p-2 text-sm">
            <NavLink href="/admin">Dashboard</NavLink>
            <NavLink href="/admin/kyc">KYC queue</NavLink>
            <NavLink href="/admin/users">Users</NavLink>
            <NavLink href="/admin/sellers">Sellers</NavLink>
            <NavLink href="/admin/stores">Stores</NavLink>
            <NavLink href="/admin/products">Products</NavLink>
            <NavLink href="/admin/products/new">Add product</NavLink>
            <NavLink href="/admin/orders">Orders</NavLink>
            <NavLink href="/admin/fraud/devices">Fraud · Devices</NavLink>
            <NavLink href="/admin/fraud/ips">Fraud · IPs</NavLink>
            <NavLink href="/admin/logs">Audit logs</NavLink>
          </nav>
        </aside>

        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-lg text-navy hover:bg-surface-muted"
    >
      {children}
    </Link>
  )
}
