import { notFound } from 'next/navigation'
import { connectMongo, Order, User } from '@dd/db-mongo'

export const dynamic = 'force-dynamic'

export default async function AdminOrderDetail({ params }: { params: { id: string } }) {
  await connectMongo()
  const order: any = await Order.findById(params.id).lean().catch(() => null)
  if (!order) notFound()

  const user: any = await User.findById(order.userId).lean()

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-navy">Order {String(order._id).slice(-8)}</h1>

      <section className="bg-white rounded-xl border border-surface-border p-4">
        <h2 className="font-display text-lg text-navy mb-2">Buyer</h2>
        <div className="text-sm text-text-muted">
          {user?.fullName} · {user?.emailNormalized} · {user?.phone}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-surface-border p-4">
        <h2 className="font-display text-lg text-navy mb-2">Items</h2>
        <ul className="text-sm divide-y divide-surface-border">
          {order.items?.map((it: any, i: number) => (
            <li key={i} className="py-2 flex justify-between">
              <div>{it.titleSnapshot} × {it.qty}</div>
              <div>${(it.priceUsd * it.qty).toFixed(2)}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white rounded-xl border border-surface-border p-4 text-sm">
        <h2 className="font-display text-lg text-navy mb-2">Pricing</h2>
        <div className="grid grid-cols-2 gap-2">
          <div>Subtotal</div><div className="text-right">${order.pricing?.subtotalUsd?.toFixed(2)}</div>
          <div>Insurance</div><div className="text-right">${order.pricing?.insuranceUsd?.toFixed(2)}</div>
          <div>Shipping</div><div className="text-right">${order.pricing?.shippingUsd?.toFixed(2)}</div>
          <div className="font-semibold">Total</div><div className="text-right font-semibold">${order.pricing?.totalUsd?.toFixed(2)}</div>
          <div>Pay now</div><div className="text-right">${order.pricing?.payNowUsd?.toFixed(2)}</div>
          <div>Pay on delivery</div><div className="text-right">${order.pricing?.payLaterUsd?.toFixed(2)}</div>
        </div>
        <div className="mt-3 text-xs text-text-muted">Status: {order.status}</div>
      </section>
    </div>
  )
}
