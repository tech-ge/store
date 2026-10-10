import { connectMongo, LoginAttempt } from '@dd/db-mongo'

export const dynamic = 'force-dynamic'

export default async function AdminIps() {
  await connectMongo()

  const rows = await LoginAttempt.aggregate([
    { $match: { success: false } },
    { $group: {
      _id: '$ip',
      count: { $sum: 1 },
      lastAt: { $max: '$at' },
      lastEmail: { $last: '$email' },
      reasons: { $addToSet: '$reason' }
    }},
    { $sort: { count: -1 } },
    { $limit: 200 }
  ])

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-4">Failed logins by IP ({rows.length})</h1>
      <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">IP</th>
              <th className="text-right px-4 py-2">Failures</th>
              <th className="text-left px-4 py-2">Last email</th>
              <th className="text-left px-4 py-2">Reasons</th>
              <th className="text-left px-4 py-2">Last attempt</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r._id} className="border-t border-surface-border">
                <td className="px-4 py-2 font-mono text-xs text-navy">{r._id}</td>
                <td className="px-4 py-2 text-right">{r.count}</td>
                <td className="px-4 py-2 text-text-muted">{r.lastEmail || '—'}</td>
                <td className="px-4 py-2 text-text-muted">{(r.reasons || []).join(', ')}</td>
                <td className="px-4 py-2 text-text-muted">{r.lastAt ? new Date(r.lastAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-text-muted">No failed logins.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
