import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { connectMongo, Seller, Product, SellerFee, Order, User } from '@dd/db-mongo'
import { verifyAccess } from '@dd/security'

export const dynamic = 'force-dynamic'

export default async function SellerHome() {
  const token = cookies().get('accessToken')?.value
  if (!token) redirect('/login')

  let payload
  try { payload = await verifyAccess(token) } catch { redirect('/login') }

  await connectMongo()
  const seller = await Seller.findOne({ userId: payload.sub }).lean()
  if (!seller) redirect('/profile/become-seller')

  const [products, fees] = await Promise.all([
    Product.find({ sellerId: payload.sub }).sort({ createdAt: -1 }).limit(20).lean(),
    SellerFee.find({ sellerId: payload.sub }).sort({ chargedAt: -1 }).limit(10).lean()
  ])

  const totalFees = await SellerFee.aggregate([
    { $match: { sellerId: (seller as any).userId } },
    { $group: { _id: null, sum: { $sum: '$feeAmount' } } }
  ])

  const productIds = products.map((p: any) => p._id)
  const salesCount = await Order.countDocuments({ 'items.productId': { $in: productIds } })

  const user = await User.findById(payload.sub).lean()

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-navy">Seller overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card label="Business" value={(seller as any).businessName} />
        <Card label="KYC status" value={(seller as any).kycStatus} />
        <Card label="Products" value={String(products.length)} />
        <Card label="Fees paid (USD)" value={`$${(totalFees[0]?.sum || 0).toFixed(2)}`} />
      </div>

      <section className="bg-white rounded-xl border border-surface-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg text-navy">Recent products</h2>
          <Link href="/seller/products/new" className="text-sm text-brand">Add product</Link>
        </div>
        <ul className="text-sm divide-y divide-surface-border">
          {products.map((p: any) => (
            <li key={String(p._id)} className="py-2 flex justify-between">
              <div className="truncate">{p.title}</div>
              <div className="text-right">${p.priceUsd.toFixed(2)}</div>
            </li>
          ))}
          {products.length === 0 && <li className="py-3 text-text-muted">No products yet.</li>}
        </ul>
      </section>

      <section className="bg-white rounded-xl border border-surface-border p-4">
        <h2 className="font-display text-lg text-navy mb-3">Recent fees (5%)</h2>
        <ul className="text-sm divide-y divide-surface-border">
          {fees.map((f: any) => (
            <li key={String(f._id)} className="py-2 flex justify-between">
              <div className="text-text-muted">{new Date(f.chargedAt).toLocaleString()}</div>
              <div>${f.feeAmount.toFixed(2)} · {f.status}</div>
            </li>
          ))}
          {fees.length === 0 && <li className="py-3 text-text-muted">No fees charged yet.</li>}
        </ul>
      </section>
    </div>
  )
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-surface-border p-4">
      <div className="text-xs text-text-muted">{label}</div>
      <div className="text-lg font-bold text-navy mt-1 truncate">{value}</div>
    </div>
  )
}
