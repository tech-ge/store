import { connectMongo, Store, Product } from '@dd/db-mongo'
import { StoreRow } from '@/components/admin/StoreRow'

export const dynamic = 'force-dynamic'

interface StoreLean {
  _id: unknown
  countryCode: string
  countryName: string
  currency: string
  currencySymbol: string
  shippingBaseRateUsd: number
  isActive: boolean
}

export default async function AdminStores() {
  await connectMongo()
  const stores = await Store.find({}).sort({ countryName: 1 }).lean<StoreLean[]>()
  const counts = await Product.aggregate([{ $group: { _id: '$storeId', count: { $sum: 1 } } }])
  const countMap = new Map(counts.map(c => [String(c._id), c.count]))

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-1">Stores</h1>
      <p className="text-sm text-text-muted mb-4">One store per country. Edit base shipping and toggle active.</p>
      <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">Country</th>
              <th className="text-left px-4 py-2">Currency</th>
              <th className="text-right px-4 py-2">Products</th>
              <th className="text-right px-4 py-2">Base shipping (USD)</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-right px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.map(s => (
              <StoreRow
                key={String(s._id)}
                countryCode={s.countryCode}
                countryName={s.countryName}
                currency={s.currency}
                currencySymbol={s.currencySymbol}
                productsCount={countMap.get(String(s._id)) || 0}
                shippingBaseRateUsd={s.shippingBaseRateUsd}
                isActive={s.isActive}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
