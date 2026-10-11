import Link from 'next/link'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { Icon, type IconName } from '@/components/ui/Icon'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#091a30]/95 text-white shadow-lg shadow-navy/10 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-3 font-display text-base font-semibold sm:text-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white"><Icon name="shield" size={19} /></span>
            <span>Admin console</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-white/75 sm:gap-4">
            <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-xl px-2 transition hover:bg-white/10 hover:text-white sm:px-3"><Icon name="bag" size={17} /><span className="hidden sm:inline">Storefront</span></Link>
            <LogoutButton className="!text-white/80 hover:!bg-white/10 hover:!text-white" />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-5 sm:px-6 md:grid-cols-12 md:gap-6 md:py-8 lg:px-8">
        <aside className="min-w-0 md:col-span-3 lg:col-span-2">
          <nav aria-label="Admin navigation" className="flex gap-1 overflow-x-auto rounded-2xl border border-surface-border bg-white p-2 text-sm shadow-card md:sticky md:top-24 md:block md:overflow-visible">
            <NavLink href="/admin" icon="grid">Dashboard</NavLink>
            <NavLink href="/admin/kyc" icon="shield">KYC queue</NavLink>
            <NavLink href="/admin/users" icon="user">Users</NavLink>
            <NavLink href="/admin/sellers" icon="store">Sellers</NavLink>
            <NavLink href="/admin/stores" icon="store">Stores</NavLink>
            <NavLink href="/admin/products" icon="package">Products</NavLink>
            <NavLink href="/admin/products/new" icon="plus">Add product</NavLink>
            <NavLink href="/admin/orders" icon="clipboard">Orders</NavLink>
            <NavLink href="/admin/transactions" icon="wallet">Transactions</NavLink>
            <NavLink href="/admin/fraud/devices" icon="shield">Fraud · Devices</NavLink>
            <NavLink href="/admin/fraud/ips" icon="shield">Fraud · IPs</NavLink>
            <NavLink href="/admin/logs" icon="inbox">Audit logs</NavLink>
          </nav>
        </aside>

        <main className="min-w-0 md:col-span-9 lg:col-span-10">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavLink({ href, children, icon }: { href: string; children: React.ReactNode; icon: IconName }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-navy transition hover:bg-surface-muted hover:text-brand md:flex"
    >
      <Icon name={icon} size={17} />
      <span>{children}</span>
    </Link>
  )
}
