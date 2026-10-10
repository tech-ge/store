import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { connectMongo, Enquiry, User, Product } from '@dd/db-mongo'
import { verifyAccess } from '@dd/security'

export const dynamic = 'force-dynamic'

export default async function SellerEnquiries() {
  const token = cookies().get('accessToken')?.value
  if (!token) redirect('/login')
  let payload
  try { payload = await verifyAccess(token) } catch { redirect('/login') }

  await connectMongo()
  const enquiries = await Enquiry.find({ sellerId: payload.sub }).sort({ createdAt: -1 }).limit(200).lean()
  const buyers = await User.find({ _id: { $in: enquiries.map(e => e.buyerId) } }).lean()
  const products = await Product.find({ _id: { $in: enquiries.map(e => e.productId) } }).lean()

  const buyerMap = new Map(buyers.map((b: any) => [String(b._id), b]))
  const productMap = new Map(products.map((p: any) => [String(p._id), p]))

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-4">Enquiries ({enquiries.length})</h1>
      <div className="bg-white rounded-xl border border-surface-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">Buyer</th>
              <th className="text-left px-4 py-2">Product</th>
              <th className="text-right px-4 py-2">Qty</th>
              <th className="text-left px-4 py-2">Message</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-right px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((e: any) => {
              const b: any = buyerMap.get(String(e.buyerId))
              const p: any = productMap.get(String(e.productId))
              return (
                <tr key={String(e._id)} className="border-t border-surface-border">
                  <td className="px-4 py-2 text-navy">{b?.fullName || '—'}</td>
                  <td className="px-4 py-2">{p?.title || '—'}</td>
                  <td className="px-4 py-2 text-right">{e.quantity}</td>
                  <td className="px-4 py-2 text-text-muted max-w-[240px] truncate">{e.message}</td>
                  <td className="px-4 py-2"><span className="text-xs px-2 py-0.5 rounded-full bg-surface-muted">{e.status}</span></td>
                  <td className="px-4 py-2 text-right">
                    {e.status === 'open' && (
                      <Link href={`/seller/enquiries/${String(e._id)}`} className="text-brand text-xs">Sell</Link>
                    )}
                  </td>
                </tr>
              )
            })}
            {enquiries.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-text-muted">No enquiries.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
