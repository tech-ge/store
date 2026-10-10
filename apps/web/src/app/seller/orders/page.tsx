import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { connectMongo, Order, User } from '@dd/db-mongo'
import { verifyAccess } from '@dd/security'

export const dynamic = 'force-dynamic'

export default async function SellerOrders() {
  const token = cookies().get('accessToken')?.value
  if (!token) redirect('/login')
  let payload
  try { payload = await verifyAccess(token) } catch { redirect('/login') }

  await connectMongo()
  const orders = await Order.find({ 'items.sellerId': payload.sub })
    .sort({ createdAt: -1 }).limit(200).lean()

  const buyers = await User.find({ _id: { $in: orders.map((o: any) => o.userId) } }).lean()
  const buyerMap = new Map(buyers.map((b: any) => [String(b._id), b]))

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-4">Orders ({orders.length})</h1>
      <div className="bg-white rounded-xl border border-surface-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">Order</th>
              <th className="text-left px-4 py-2">Buyer</th>
              <th className="text-right px-4 py-2">My items</th>
              <th className="text-left px-4 py-2">My status</th>
              <th className="text-right px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => {
              const mine = o.items.filter((it: any) => String(it.sellerId) === payload.sub)
              const statuses = mine.map((it: any) => it.sellerStatus)
              const overall = statuses.every((s: string) => s === 'completed')
                ? 'completed'
                : statuses.some((s: string) => s === 'confirmed')
                  ? 'in progress'
                  : 'pending'
              const buyer: any = buyerMap.get(String(o.userId))
              return (
                <tr key={String(o._id)} className="border-t border-surface-border">
                  <td className="px-4 py-2 font-mono text-xs text-navy">{String(o._id).slice(-8)}</td>
                  <td className="px-4 py-2 text-text-muted">{buyer?.emailNormalized || '—'}</td>
                  <td className="px-4 py-2 text-right">{mine.length}</td>
                  <td className="px-4 py-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface-muted">{overall}</span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/seller/orders/${String(o._id)}`} className="text-brand text-xs">Open</Link>
                  </td>
                </tr>
              )
            })}
            {orders.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-text-muted">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
