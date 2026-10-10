import { connectMongo, Device } from '@dd/db-mongo'
import { DeviceActions } from '@/components/admin/RowActions'

export const dynamic = 'force-dynamic'

interface DeviceRow {
  _id: unknown
  fingerprint: string
  ip?: string
  userAgent?: string
  isBlocked: boolean
  lastSeen?: Date
}

export default async function AdminDevices() {
  await connectMongo()
  const devices = await Device.find({}).sort({ lastSeen: -1 }).limit(300).lean<DeviceRow[]>()

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-4">Devices ({devices.length})</h1>
      <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">Fingerprint</th>
              <th className="text-left px-4 py-2">IP</th>
              <th className="text-left px-4 py-2">UA</th>
              <th className="text-left px-4 py-2">Last seen</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-right px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {devices.map(d => (
              <tr key={String(d._id)} className="border-t border-surface-border">
                <td className="px-4 py-2 font-mono text-xs text-navy">{d.fingerprint.slice(0, 12)}…</td>
                <td className="px-4 py-2 text-text-muted">{d.ip || '—'}</td>
                <td className="px-4 py-2 text-text-muted truncate max-w-[240px]">{d.userAgent || '—'}</td>
                <td className="px-4 py-2 text-text-muted">{d.lastSeen ? new Date(d.lastSeen).toLocaleString() : '—'}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${d.isBlocked ? 'bg-red-100 text-red-700' : 'bg-surface-muted'}`}>
                    {d.isBlocked ? 'blocked' : 'ok'}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <DeviceActions fingerprint={d.fingerprint} isBlocked={d.isBlocked} />
                </td>
              </tr>
            ))}
            {devices.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-text-muted">No devices recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
