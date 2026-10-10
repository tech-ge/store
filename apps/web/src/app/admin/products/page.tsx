import Link from 'next/link'
import { connectMongo, Product, Store } from '@dd/db-mongo'

export const dynamic = 'force-dynamic'

interface ProductRow {
  _id: unknown
  title: string
  images?: string[]
  priceUsd: number
  categorySlug: string
  storeId: unknown
  sellerId?: unknown | null
  addedByAdmin: boolean
  createdAt: Date
}

export default async function AdminProducts() {
  await connectMongo()
  const products = await Product.find({}).sort({ createdAt: -1 }).limit(200).lean<ProductRow[]>()
  const stores = await Store.find({}).lean()
  const storeMap = new Map(stores.map((s: any) => [String(s._id), s.countryName]))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl text-navy">Products ({products.length})</h1>
        <Link href="/admin/products/new" className="px-3 py-2 rounded-lg bg-brand text-white text-sm">Add product</Link>
      </div>

      <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Category</th>
              <th className="text-left px-4 py-2">Store</th>
              <th className="text-left px-4 py-2">Source</th>
              <th className="text-right px-4 py-2">Price USD</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={String(p._id)} className="border-t border-surface-border">
                <td className="px-4 py-2 text-navy truncate max-w-[240px]">{p.title}</td>
                <td className="px-4 py-2 text-text-muted">{p.categorySlug}</td>
                <td className="px-4 py-2">{storeMap.get(String(p.storeId)) || '—'}</td>
                <td className="px-4 py-2 text-text-muted">{p.addedByAdmin ? 'admin' : 'seller'}</td>
                <td className="px-4 py-2 text-right">${p.priceUsd.toFixed(2)}</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-text-muted">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
