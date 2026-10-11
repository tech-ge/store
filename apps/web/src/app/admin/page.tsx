import Link from 'next/link'
import { connectMongo, User, KycRecord, Seller, Order, Product } from '@dd/db-mongo'

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  await connectMongo()

  const [
    totalUsers,
    activeUsers,
    pendingKyc,
    totalSellers,
    totalProducts,
    totalOrders,
    paidOrders
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ status: 'active' }),
    KycRecord.countDocuments({ status: 'pending' }),
    Seller.countDocuments({}),
    Product.countDocuments({}),
    Order.countDocuments({}),
    Order.aggregate([
      { $match: { status: { $in: ['paid_20', 'assigned_driver', 'out_for_delivery', 'delivered'] } } },
      { $group: { _id: null, sum: { $sum: '$pricing.totalUsd' } } }
    ])
  ])

  const revenue = paidOrders[0]?.sum || 0

  const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(8).lean()
  const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(8).lean()

  const cards = [
    { label: 'Total users',     value: totalUsers,          href: '/admin/users' },
    { label: 'Active users',    value: activeUsers,         href: '/admin/users?status=active' },
    { label: 'Pending KYC',     value: pendingKyc,          href: '/admin/kyc', highlight: pendingKyc > 0 },
    { label: 'Sellers',         value: totalSellers,        href: '/admin/sellers' },
    { label: 'Products',        value: totalProducts,       href: '/admin/products' },
    { label: 'Orders',          value: totalOrders,         href: '/admin/orders' },
    { label: 'Revenue (USD)',   value: `$${Number(revenue).toFixed(2)}`, href: '/admin/orders' }
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="cinematic-hero relative isolate overflow-hidden rounded-3xl px-6 py-7 text-white shadow-card sm:px-8 sm:py-9">
        <div aria-hidden="true" className="hero-orbit hero-orbit-one" />
        <div className="relative z-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-400">Platform overview</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Admin dashboard</h1>
          <p className="mt-2 text-sm text-white/65">Monitor accounts, orders and marketplace activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(c => (
          <Link
            key={c.label}
            href={c.href}
            className={`rounded-2xl border bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift sm:p-5 ${
              c.highlight ? 'border-brand' : 'border-surface-border'
            }`}
          >
            <div className="text-xs text-text-muted">{c.label}</div>
            <div className="text-2xl font-bold text-navy mt-1">{c.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-3xl border border-surface-border bg-white p-5 shadow-card sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-navy">Recent users</h2>
            <Link href="/admin/users" className="shrink-0 text-sm font-semibold text-brand">View all</Link>
          </div>
          <ul className="text-sm divide-y divide-surface-border">
            {recentUsers.map((u: any) => (
              <li key={String(u._id)} className="py-2 flex justify-between">
                <div className="min-w-0">
                  <div className="text-navy truncate">{u.fullName}</div>
                  <div className="text-xs text-text-muted truncate">{u.emailNormalized}</div>
                </div>
                <span className="text-xs text-text-muted">{u.status}</span>
              </li>
            ))}
            {recentUsers.length === 0 && <li className="py-3 text-text-muted">No users yet.</li>}
          </ul>
        </section>

        <section className="rounded-3xl border border-surface-border bg-white p-5 shadow-card sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-navy">Recent orders</h2>
            <Link href="/admin/orders" className="shrink-0 text-sm font-semibold text-brand">View all</Link>
          </div>
          <ul className="text-sm divide-y divide-surface-border">
            {recentOrders.map((o: any) => (
              <li key={String(o._id)} className="py-2 flex justify-between">
                <div className="min-w-0">
                  <div className="text-navy truncate">Order {String(o._id).slice(-6)}</div>
                  <div className="text-xs text-text-muted">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-navy">${o.pricing?.totalUsd?.toFixed(2) || '0.00'}</div>
                  <div className="text-xs text-text-muted">{o.status}</div>
                </div>
              </li>
            ))}
            {recentOrders.length === 0 && <li className="py-3 text-text-muted">No orders yet.</li>}
          </ul>
        </section>
      </div>

      <section className="rounded-3xl border border-surface-border bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-navy">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/kyc" className="px-3 py-2 rounded-lg bg-surface-muted text-sm text-navy hover:bg-brand hover:text-white transition">Review KYC</Link>
          <Link href="/admin/products/new" className="px-3 py-2 rounded-lg bg-surface-muted text-sm text-navy hover:bg-brand hover:text-white transition">Add product</Link>
          <Link href="/admin/fraud/devices" className="px-3 py-2 rounded-lg bg-surface-muted text-sm text-navy hover:bg-brand hover:text-white transition">Devices</Link>
          <Link href="/admin/logs" className="px-3 py-2 rounded-lg bg-surface-muted text-sm text-navy hover:bg-brand hover:text-white transition">Audit logs</Link>
        </div>
      </section>
    </div>
  )
}
