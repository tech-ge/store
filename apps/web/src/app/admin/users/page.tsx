import Link from 'next/link'
import { connectMongo, User, Wallet, KycRecord } from '@dd/db-mongo'
import { UserActions } from '@/components/admin/RowActions'

export const dynamic = 'force-dynamic'

interface UserRow {
  _id: unknown
  fullName: string
  emailNormalized: string
  countryCode: string
  role: string
  status: string
  createdAt: Date
}

interface KycRow {
  userId: unknown
  idPhotoUrl: string
  status: string
}

export default async function AdminUsers({ searchParams }: { searchParams: { status?: string; role?: string } }) {
  await connectMongo()
  const filter: any = {}
  if (searchParams.status) filter.status = searchParams.status
  if (searchParams.role) filter.role = searchParams.role

  const users = await User.find(filter).sort({ createdAt: -1 }).limit(300).lean<UserRow[]>()
  const userIds = users.map(u => u._id)

  const [wallets, kycs] = await Promise.all([
    Wallet.find({ userId: { $in: userIds } }).lean(),
    KycRecord.find({ userId: { $in: userIds } }).lean<KycRow[]>()
  ])

  const balances = new Map<string, number>()
  wallets.forEach((w: any) => balances.set(String(w.userId), w.balances?.USD || 0))

  const kycMap = new Map<string, KycRow>()
  kycs.forEach(k => kycMap.set(String(k.userId), k))

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-4">Users ({users.length})</h1>

      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        {['', 'pending_kyc', 'active', 'suspended', 'blocked'].map(s => (
          <Link key={s || 'all'} href={s ? `/admin/users?status=${s}` : '/admin/users'}
            className="px-3 py-1.5 rounded-lg bg-white border border-surface-border">{s || 'All statuses'}</Link>
        ))}
        <span className="mx-2 text-text-muted">·</span>
        {['', 'user', 'seller', 'admin'].map(r => (
          <Link key={r || 'allroles'} href={r ? `/admin/users?role=${r}` : '/admin/users'}
            className="px-3 py-1.5 rounded-lg bg-white border border-surface-border">{r || 'All roles'}</Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-surface-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">ID photo</th>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Country</th>
              <th className="text-left px-4 py-2">Role</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-right px-4 py-2">Balance</th>
              <th className="text-right px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const kyc = kycMap.get(String(u._id))
              return (
                <tr key={String(u._id)} className="border-t border-surface-border">
                  <td className="px-4 py-2">
                    {kyc?.idPhotoUrl ? (
                      <Link href={`/admin/users/${String(u._id)}`}>
                        <img src={kyc.idPhotoUrl} alt="ID" className="w-12 h-12 rounded object-cover border border-surface-border" />
                      </Link>
                    ) : (
                      <span className="text-xs text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Link href={`/admin/users/${String(u._id)}`} className="text-navy hover:text-brand">{u.fullName}</Link>
                  </td>
                  <td className="px-4 py-2 text-text-muted">{u.emailNormalized}</td>
                  <td className="px-4 py-2">{u.countryCode}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface-muted">{u.status}</span>
                  </td>
                  <td className="px-4 py-2 text-right">${(balances.get(String(u._id)) || 0).toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <UserActions userId={String(u._id)} status={u.status} />
                  </td>
                </tr>
              )
            })}
            {users.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-text-muted">No users.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
