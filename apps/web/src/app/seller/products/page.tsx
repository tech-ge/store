import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { connectMongo, Product } from '@dd/db-mongo'
import { verifyAccess } from '@dd/security'

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
      <h1 className="font-display text-2xl text-navy mb-4">My products ({products.length})</h1>
      <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Category</th>
              <th className="text-right px-4 py-2">Price USD</th>
              <th className="text-right px-4 py-2">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={String(p._id)} className="border-t border-surface-border">
                <td className="px-4 py-2 text-navy">{p.title}</td>
                <td className="px-4 py-2 text-text-muted">{p.categorySlug}</td>
                <td className="px-4 py-2 text-right">${p.priceUsd.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{p.stock}</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-text-muted">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
