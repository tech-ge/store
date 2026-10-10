import { connectMongo, AuditLog } from '@dd/db-mongo'

export const dynamic = 'force-dynamic'

interface LogRow {
  _id: unknown
  actorRole?: string
  action: string
  resource: string
  resourceId?: string
  ip?: string
  createdAt: Date
}

export default async function AdminLogs() {
  await connectMongo()
  const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(300).lean<LogRow[]>()

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-4">Audit logs ({logs.length})</h1>
      <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">Time</th>
              <th className="text-left px-4 py-2">Actor</th>
              <th className="text-left px-4 py-2">Action</th>
              <th className="text-left px-4 py-2">Resource</th>
              <th className="text-left px-4 py-2">ID</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={String(l._id)} className="border-t border-surface-border">
                <td className="px-4 py-2 text-text-muted">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2">{l.actorRole || '—'}</td>
                <td className="px-4 py-2 text-navy">{l.action}</td>
                <td className="px-4 py-2">{l.resource}</td>
                <td className="px-4 py-2 text-text-muted font-mono text-xs">{l.resourceId ? l.resourceId.slice(-12) : '—'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-text-muted">No logs yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
