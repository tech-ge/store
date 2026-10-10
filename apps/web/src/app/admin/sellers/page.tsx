import { connectMongo, Seller, Product, SellerFee } from '@dd/db-mongo'

export const dynamic = 'force-dynamic'

interface SellerRow {
  _id: unknown
  userId: unknown
  businessName: string
  countryCode: string
  kycStatus: string
  commissionRate: number
  createdAt: Date
}

export default async function AdminSellers() {
  await connectMongo()
  const sellers = await Seller.find({}).sort({ createdAt: -1 }).limit(200).lean<SellerRow[]>()

  const sellerIds = sellers.map(s => s._id)

  const productCounts = await Product.aggregate([
    { $match: { sellerId: { $in: sellers.map(s => s.userId) } } },
    { $group: { _id: '$sellerId', count: { $sum: 1 } } }
  ])
  const productMap = new Map(productCounts.map(p => [String(p._id), p.count]))

  const feeTotals = await SellerFee.aggregate([
    { $match: { sellerId: { $in: sellers.map(s => s.userId) } } },
    { $group: { _id: '$sellerId', total: { $sum: '$feeAmount' } } }
  ])
  const feeMap = new Map(feeTotals.map(f => [String(f._id), f.total]))

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-4">Sellers ({sellers.length})</h1>
      <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">Business</th>
              <th className="text-left px-4 py-2">Country</th>
              <th className="text-left px-4 py-2">KYC</th>
              <th className="text-right px-4 py-2">Products</th>
              <th className="text-right px-4 py-2">Fee (USD)</th>
              <th className="text-right px-4 py-2">Commission</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map(s => (
              <tr key={String(s._id)} className="border-t border-surface-border">
                <td className="px-4 py-2 text-navy">{s.businessName}</td>
                <td className="px-4 py-2">{s.countryCode}</td>
                <td className="px-4 py-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-muted">{s.kycStatus}</span>
                </td>
                <td className="px-4 py-2 text-right">{productMap.get(String(s.userId)) || 0}</td>
                <td className="px-4 py-2 text-right">${(feeMap.get(String(s.userId)) || 0).toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{(s.commissionRate * 100).toFixed(1)}%</td>
              </tr>
            ))}
            {sellers.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-text-muted">No sellers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
