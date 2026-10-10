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

  const photoMap = new Map<string, string>()
  kycs.forEach(k => photoMap.set(String(k.userId), k.idPhotoUrl))

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-4">Users ({users.length})</h1>

      <div className="flex flex-wrap gap-2 mb-6 text-sm">
        {['', 'pending_kyc', 'active', 'suspended', 'blocked'].map(s => (
          <Link key={s || 'all'} href={s ? `/admin/users?status=${s}` : '/admin/users'}
            className={`px-3 py-1.5 rounded-lg border ${searchParams.status === s || (!searchParams.status && !s) ? 'bg-brand text-white border-brand' : 'bg-white border-surface-border'}`}>
            {s || 'All statuses'}
          </Link>
        ))}
        <span className="mx-1 text-text-muted">·</span>
        {['', 'user', 'seller', 'admin'].map(r => (
          <Link key={r || 'allroles'} href={r ? `/admin/users?role=${r}` : '/admin/users'}
            className={`px-3 py-1.5 rounded-lg border ${searchParams.role === r || (!searchParams.role && !r) ? 'bg-brand text-white border-brand' : 'bg-white border-surface-border'}`}>
            {r || 'All roles'}
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(u => {
          const photo = photoMap.get(String(u._id))
          return (
            <div key={String(u._id)} className="bg-white rounded-xl border border-surface-border p-4 flex flex-col gap-3">
              <div className="flex gap-3 items-center">
                {photo ? (
                  <Link href={`/admin/users/${String(u._id)}`}>
                    <img src={photo} alt="ID" className="w-16 h-16 rounded-lg object-cover border border-surface-border" />
                  </Link>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-surface-muted flex items-center justify-center text-xs text-text-muted">
                    No ID
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/users/${String(u._id)}`} className="block text-navy font-medium truncate hover:text-brand">
                    {u.fullName}
                  </Link>
                  <div className="text-xs text-text-muted truncate">{u.emailNormalized}</div>
                  <div className="text-xs text-text-muted mt-1">
                    {u.role} · {u.countryCode} · <span className="capitalize">{u.status}</span>
                  </div>
                </div>
              </div>

              <div className="text-sm">
                <span className="text-text-muted">Balance:</span>{' '}
                <span className="text-navy font-semibold">${(balances.get(String(u._id)) || 0).toFixed(2)}</span>
              </div>

              <UserActions userId={String(u._id)} status={u.status} />
            </div>
          )
        })}
        {users.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-surface-border p-8 text-center text-text-muted">
            No users.
          </div>
        )}
      </div>
    </div>
  )
}
