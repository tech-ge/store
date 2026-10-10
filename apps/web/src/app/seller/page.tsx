import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { connectMongo, Seller, Product, SellerFee, Order, Wallet } from '@dd/db-mongo'
import { verifyAccess } from '@dd/security'

export const dynamic = 'force-dynamic'

export default async function SellerHome() {
  const token = cookies().get('accessToken')?.value
  if (!token) redirect('/login')

  let payload
  try { payload = await verifyAccess(token) } catch { redirect('/login') }

  await connectMongo()
  const seller: any = await Seller.findOne({ userId: payload.sub }).lean()
  if (!seller) redirect('/profile/become-seller')

  const [products, fees, wallet] = await Promise.all([
    Product.find({ sellerId: payload.sub }).sort({ createdAt: -1 }).limit(20).lean(),
    SellerFee.find({ sellerId: payload.sub }).sort({ chargedAt: -1 }).limit(10).lean(),
    Wallet.findOne({ userId: payload.sub }).lean<any>()
  ])

  const totalFees = await SellerFee.aggregate([
    { $match: { sellerId: seller.userId } },
    { $group: { _id: null, sum: { $sum: '$feeAmount' } } }
  ])

  const productIds = products.map((p: any) => p._id)
  const salesCount = productIds.length
    ? await Order.countDocuments({ 'items.productId': { $in: productIds } })
    : 0

  const balance = wallet?.balances?.USD || 0

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-navy">Seller overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card label="Business" value={seller.businessName} />
        <Card label="KYC status" value={seller.kycStatus} />
        <Card label="Wallet (USD)" value={`$${balance.toFixed(2)}`} />
        <Card label="Sales (all time)" value={String(salesCount)} />
      </div>

      <section className="bg-white rounded-2xl border border-surface-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-navy">Recent products</h2>
          <Link href="/seller/products/new" className="text-sm text-brand">Add product</Link>
        </div>
        <ul className="text-base divide-y divide-surface-border">
          {products.map((p: any) => (
            <li key={String(p._id)} className="py-3 flex justify-between items-center">
              <span className="truncate pr-4 text-navy">{p.title}</span>
              <span className="font-medium">${p.priceUsd.toFixed(2)}</span>
            </li>
          ))}
          {products.length === 0 && <li className="py-4 text-text-muted">No products yet.</li>}
        </ul>
      </section>

      <section className="bg-white rounded-2xl border border-surface-border p-6">
        <h2 className="font-display text-xl text-navy mb-4">Recent fees (5%)</h2>
        <ul className="text-base divide-y divide-surface-border">
          {fees.map((f: any) => (
            <li key={String(f._id)} className="py-3 flex justify-between">
              <span className="text-text-muted">{new Date(f.chargedAt).toLocaleString()}</span>
              <span>${f.feeAmount.toFixed(2)} · {f.status}</span>
            </li>
          ))}
          {fees.length === 0 && <li className="py-4 text-text-muted">No fees charged yet.</li>}
        </ul>
      </section>

      <section className="bg-white rounded-2xl border border-surface-border p-6">
        <h2 className="font-display text-xl text-navy mb-4">Totals</h2>
        <div className="grid grid-cols-2 gap-4 text-base">
          <div>
            <div className="text-text-muted">Fees paid (USD)</div>
            <div className="text-2xl font-bold text-navy">${(totalFees[0]?.sum || 0).toFixed(2)}</div>
          </div>
          <div>
            <div className="text-text-muted">Products listed</div>
            <div className="text-2xl font-bold text-navy">{products.length}</div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-surface-border p-5">
      <div className="text-sm text-text-muted">{label}</div>
      <div className="text-xl font-bold text-navy mt-1 truncate">{value}</div>
    </div>
  )
}
