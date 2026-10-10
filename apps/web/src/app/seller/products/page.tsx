import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { connectMongo, Product } from '@dd/db-mongo'
import { verifyAccess } from '@dd/security'
import { SellerProductRow } from '@/components/seller/SellerProductRow'

export const dynamic = 'force-dynamic'

export default async function SellerProducts() {
  const token = cookies().get('accessToken')?.value
  if (!token) redirect('/login')
  let payload
  try { payload = await verifyAccess(token) } catch { redirect('/login') }

  await connectMongo()
  const products = await Product.find({ sellerId: payload.sub }).sort({ createdAt: -1 }).lean()

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl text-navy">My products ({products.length})</h1>
        <Link href="/seller/products/new" className="px-4 py-2 rounded-xl bg-brand text-white text-sm font-medium">Add product</Link>
      </div>

      <div className="bg-white rounded-xl border border-surface-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Category</th>
              <th className="text-right px-4 py-2">Price USD</th>
              <th className="text-right px-4 py-2">Stock</th>
              <th className="text-right px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <SellerProductRow
                key={String(p._id)}
                id={String(p._id)}
                title={p.title}
                categorySlug={p.categorySlug}
                priceUsd={p.priceUsd}
                stock={p.stock}
              />
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                No products yet. <Link href="/seller/products/new" className="text-brand">Add your first product</Link>.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
