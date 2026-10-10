import Link from 'next/link'
import { connectMongo, Order, User } from '@dd/db-mongo'

export const dynamic = 'force-dynamic'

interface OrderRow {
  _id: unknown
  userId: unknown
  currencyLocal: string
  status: string
  pricing?: { totalUsd?: number; payNowUsd?: number; payLaterUsd?: number }
  createdAt: Date
}

export default async function AdminOrders({ searchParams }: { searchParams: { status?: string } }) {
  await connectMongo()
  const filter: any = {}
  if (searchParams.status) filter.status = searchParams.status

  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200).lean<OrderRow[]>()
  const userIds = orders.map(o => o.userId)
  const users = await User.find({ _id: { $in: userIds } }).lean()
  const userMap = new Map(users.map((u: any) => [String(u._id), u]))

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-4">Orders ({orders.length})</h1>

      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        {['', 'pending_payment', 'paid_20', 'assigned_driver', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
          <Link
            key={s || 'all'}
            href={s ? `/admin/orders?status=${s}` : '/admin/orders'}
            className="px-3 py-1.5 rounded-lg bg-white border border-surface-border"
          >
            {s || 'All'}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">Order</th>
              <th className="text-left px-4 py-2">Buyer</th>
              <th className="text-right px-4 py-2">Total</th>
              <th className="text-right px-4 py-2">Paid now</th>
              <th className="text-right px-4 py-2">On delivery</th>
              <th className="text-left px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const u: any = userMap.get(String(o.userId))
              return (
                <tr key={String(o._id)} className="border-t border-surface-border">
                  <td className="px-4 py-2 text-navy">
                    <Link href={`/admin/orders/${String(o._id)}`} className="hover:text-brand">
                      {String(o._id).slice(-8)}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-text-muted">{u?.emailNormalized || '—'}</td>
                  <td className="px-4 py-2 text-right">${(o.pricing?.totalUsd || 0).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">${(o.pricing?.payNowUsd || 0).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">${(o.pricing?.payLaterUsd || 0).toFixed(2)}</td>
                  <td className="px-4 py-2"><span className="text-xs px-2 py-0.5 rounded-full bg-surface-muted">{o.status}</span></td>
                </tr>
              )
            })}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-text-muted">No orders.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
