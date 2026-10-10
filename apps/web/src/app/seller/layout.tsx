import Link from 'next/link'
import { LogoutButton } from '@/components/auth/LogoutButton'

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/seller" className="font-display text-lg">Door Delivery · Seller</Link>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <Link href="/" className="hover:text-white">Storefront</Link>
            <LogoutButton className="!text-white/80 hover:!text-white" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <nav className="bg-white rounded-xl border border-surface-border p-2 text-sm">
            <NavLink href="/seller">Overview</NavLink>
            <NavLink href="/seller/products">My products</NavLink>
            <NavLink href="/seller/products/new">Add product</NavLink>
            <NavLink href="/seller/orders">Orders</NavLink>
            <NavLink href="/seller/enquiries">Enquiries</NavLink>
            <NavLink href="/seller/fees">Fee history</NavLink>
            <NavLink href="/search">Buy supplies</NavLink>
          </nav>
        </aside>
        <main className="col-span-12 md:col-span-9 lg:col-span-10">{children}</main>
      </div>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="block px-3 py-2 rounded-lg text-navy hover:bg-surface-muted">{children}</Link>
}
