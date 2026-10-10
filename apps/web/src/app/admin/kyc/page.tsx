import Link from 'next/link'
import { connectMongo, KycRecord, User } from '@dd/db-mongo'

export const dynamic = 'force-dynamic'

interface KycLean {
  _id: unknown
  userId: unknown
  countryCode: string
  status: string
  submittedAt: Date
}

interface UserLean {
  _id: unknown
  fullName: string
  emailNormalized: string
  status: string
}

export default async function KycQueue({ searchParams }: { searchParams: { status?: string } }) {
  await connectMongo()
  const status = searchParams.status || 'pending'
  const filter: any = {}
  if (status !== 'all') filter.status = status

  const rows = await KycRecord.find(filter).sort({ submittedAt: -1 }).limit(200).lean<KycLean[]>()
  const users = await User.find({ _id: { $in: rows.map(r => r.userId) } }).lean<UserLean[]>()
  const userMap = new Map(users.map(u => [String(u._id), u]))

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-4">KYC queue</h1>

      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        {['pending', 'approved', 'rejected', 'all'].map(s => (
          <Link
            key={s}
            href={`/admin/kyc?status=${s}`}
            className={`px-3 py-1.5 rounded-lg border ${status === s ? 'bg-brand text-white border-brand' : 'bg-white border-surface-border'}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">User</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Country</th>
              <th className="text-left px-4 py-2">Submitted</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-right px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const u = userMap.get(String(r.userId))
              return (
                <tr key={String(r._id)} className="border-t border-surface-border">
                  <td className="px-4 py-2 text-navy">{u?.fullName || '—'}</td>
                  <td className="px-4 py-2 text-text-muted">{u?.emailNormalized || '—'}</td>
                  <td className="px-4 py-2">{r.countryCode}</td>
                  <td className="px-4 py-2 text-text-muted">{new Date(r.submittedAt).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      r.status === 'approved' ? 'bg-emerald-100 text-emerald-700'
                      : r.status === 'rejected' ? 'bg-red-100 text-red-700'
                      : 'bg-surface-muted'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/admin/users/${String(r.userId)}`} className="text-brand text-xs">Review</Link>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-text-muted">No records.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
