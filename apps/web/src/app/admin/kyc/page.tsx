import { connectMongo, KycRecord } from '@dd/db-mongo'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface KycLean {
  _id: unknown
  userId: unknown
  countryCode: string
  submittedAt: Date
}

export default async function KycQueue() {
  await connectMongo()
  const rows = await KycRecord.find({ status: 'pending' })
    .sort({ submittedAt: -1 }).limit(100).lean<KycLean[]>()

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-4">Pending KYC ({rows.length})</h1>
      <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">User</th>
              <th className="text-left px-4 py-2">Country</th>
              <th className="text-left px-4 py-2">Submitted</th>
              <th className="text-right px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={String(r._id)} className="border-t border-surface-border">
                <td className="px-4 py-2">{String(r.userId)}</td>
                <td className="px-4 py-2">{r.countryCode}</td>
                <td className="px-4 py-2">{new Date(r.submittedAt).toLocaleString()}</td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/admin/kyc/${String(r.userId)}`} className="text-brand">Review</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-text-muted">No pending KYC.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
