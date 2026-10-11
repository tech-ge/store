import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { connectMongo, Seller, Product, SellerFee, Order, Wallet } from '@dd/db-mongo'
import { verifyAccess } from '@dd/security'
import { Icon, type IconName } from '@/components/ui/Icon'

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
      <div className="cinematic-hero relative isolate overflow-hidden rounded-3xl px-6 py-7 text-white shadow-card sm:px-8 sm:py-9">
        <div aria-hidden="true" className="hero-orbit hero-orbit-one" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-400">Your business at a glance</p>
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Welcome to your studio</h1>
            <p className="mt-2 text-sm text-white/65">{seller.businessName}</p>
          </div>
          <Link href="/seller/products/new" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-500">
            <Icon name="plus" size={18} /> Add product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card icon="store" label="Business" value={seller.businessName} />
        <Card icon="shield" label="KYC status" value={seller.kycStatus} />
        <Card icon="wallet" label="Wallet balance" value={`$${balance.toFixed(2)}`} />
        <Card icon="clipboard" label="Sales (all time)" value={String(salesCount)} />
      </div>

      <section className="rounded-3xl border border-surface-border bg-white p-5 shadow-card sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-navy">Recent products</h2>
          <Link href="/seller/products/new" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand"><Icon name="plus" size={16} /> Add product</Link>
        </div>
        <ul className="divide-y divide-surface-border text-sm sm:text-base">
          {products.map((p: any) => (
            <li key={String(p._id)} className="flex items-center justify-between gap-3 py-3">
              <span className="min-w-0 truncate pr-2 text-navy">{p.title}</span>
              <span className="shrink-0 font-semibold text-navy">${p.priceUsd.toFixed(2)}</span>
            </li>
          ))}
          {products.length === 0 && <li className="py-4 text-text-muted">No products yet.</li>}
        </ul>
      </section>

      <section className="rounded-3xl border border-surface-border bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-display text-xl font-semibold text-navy">Recent fees (5%)</h2>
        <ul className="divide-y divide-surface-border text-sm sm:text-base">
          {fees.map((f: any) => (
            <li key={String(f._id)} className="flex flex-wrap justify-between gap-2 py-3">
              <span className="text-text-muted">{new Date(f.chargedAt).toLocaleString()}</span>
              <span className="font-medium text-navy">${f.feeAmount.toFixed(2)} · {f.status}</span>
            </li>
          ))}
          {fees.length === 0 && <li className="py-4 text-text-muted">No fees charged yet.</li>}
        </ul>
      </section>

      <section className="rounded-3xl border border-surface-border bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-display text-xl font-semibold text-navy">Totals</h2>
        <div className="grid grid-cols-1 gap-4 text-base sm:grid-cols-2">
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

function Card({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-white p-4 shadow-card sm:p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand"><Icon name={icon} size={19} /></div>
      <div className="text-sm text-text-muted">{label}</div>
      <div className="mt-1 truncate text-xl font-bold text-navy">{value}</div>
    </div>
  )
}
