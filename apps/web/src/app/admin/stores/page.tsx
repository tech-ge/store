import { connectMongo, Store, Product } from '@dd/db-mongo'

export const dynamic = 'force-dynamic'

interface StoreRow {
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
  const stores = await Store.find({}).sort({ countryName: 1 }).lean<StoreRow[]>()

  const productCounts = await Product.aggregate([
    { $group: { _id: '$storeId', count: { $sum: 1 } } }
  ])
  const countMap = new Map(productCounts.map(p => [String(p._id), p.count]))

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-4">Stores ({stores.length})</h1>
      <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">Country</th>
              <th className="text-left px-4 py-2">Currency</th>
              <th className="text-right px-4 py-2">Base shipping (USD)</th>
              <th className="text-right px-4 py-2">Products</th>
              <th className="text-left px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {stores.map(s => (
              <tr key={String(s._id)} className="border-t border-surface-border">
                <td className="px-4 py-2 text-navy">{s.countryName} <span className="text-text-muted">({s.countryCode})</span></td>
                <td className="px-4 py-2">{s.currency} {s.currencySymbol}</td>
                <td className="px-4 py-2 text-right">${s.shippingBaseRateUsd.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{countMap.get(String(s._id)) || 0}</td>
                <td className="px-4 py-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-muted">
                    {s.isActive ? 'active' : 'inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
