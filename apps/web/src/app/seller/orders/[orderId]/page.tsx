import { redirect, notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { connectMongo, Order, User } from '@dd/db-mongo'
import { verifyAccess } from '@dd/security'
import { SellerCompleteButton } from '@/components/seller/SellerCompleteButton'

export const dynamic = 'force-dynamic'

export default async function SellerOrderDetail({ params }: { params: { orderId: string } }) {
  const token = cookies().get('accessToken')?.value
  if (!token) redirect('/login')
  let payload
  try { payload = await verifyAccess(token) } catch { redirect('/login') }

  await connectMongo()
  const order: any = await Order.findById(params.orderId).lean()
  if (!order) notFound()

  const mine = order.items.filter((it: any) => String(it.sellerId) === payload.sub)
  if (!mine.length) notFound()

  const buyer: any = await User.findById(order.userId).lean()

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-2xl text-navy">Order {String(order._id).slice(-8)}</h1>

      <section className="bg-white rounded-xl border border-surface-border p-4">
        <h2 className="font-display text-lg text-navy mb-3">Buyer</h2>
        <div className="text-sm text-text-muted">{buyer?.fullName} · {buyer?.emailNormalized} · {buyer?.phone}</div>
      </section>

      <section className="bg-white rounded-xl border border-surface-border p-4">
        <h2 className="font-display text-lg text-navy mb-3">My items</h2>
        <ul className="text-sm divide-y divide-surface-border">
          {mine.map((it: any, i: number) => (
            <li key={i} className="py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {it.imageSnapshot && <img src={it.imageSnapshot} alt="" className="w-12 h-12 rounded object-cover bg-surface-muted" />}
                <div>
                  <div className="text-navy">{it.titleSnapshot} × {it.qty}</div>
                  <div className="text-xs text-text-muted">${(it.priceUsd * it.qty).toFixed(2)}</div>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-muted">{it.sellerStatus}</span>
            </li>
          ))}
        </ul>
      </section>

      <SellerCompleteButton
        orderId={String(order._id)}
        allCompleted={mine.every((it: any) => it.sellerStatus === 'completed')}
      />
    </div>
  )
}
