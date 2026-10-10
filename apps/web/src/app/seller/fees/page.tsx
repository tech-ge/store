import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { connectMongo, SellerFee } from '@dd/db-mongo'
import { verifyAccess } from '@dd/security'

export const dynamic = 'force-dynamic'

export default async function SellerFees() {
  const token = cookies().get('accessToken')?.value
  if (!token) redirect('/login')
  let payload
  try { payload = await verifyAccess(token) } catch { redirect('/login') }

  await connectMongo()
  const fees = await SellerFee.find({ sellerId: payload.sub }).sort({ chargedAt: -1 }).lean()
  const total = fees.reduce((s, f: any) => s + (f.feeAmount || 0), 0)

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-4">Fee history</h1>
      <div className="text-sm text-text-muted mb-4">Total fees charged: <span className="text-navy font-semibold">${total.toFixed(2)}</span></div>
      <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">Date</th>
              <th className="text-right px-4 py-2">Fee (USD)</th>
              <th className="text-left px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f: any) => (
              <tr key={String(f._id)} className="border-t border-surface-border">
                <td className="px-4 py-2 text-text-muted">{new Date(f.chargedAt).toLocaleString()}</td>
                <td className="px-4 py-2 text-right">${f.feeAmount.toFixed(2)}</td>
                <td className="px-4 py-2">{f.status}</td>
              </tr>
            ))}
            {fees.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-text-muted">No fees yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
