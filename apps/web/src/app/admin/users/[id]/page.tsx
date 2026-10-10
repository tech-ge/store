import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connectMongo, User, Wallet, Transaction, Seller } from '@dd/db-mongo'
import { UserActions, WithdrawButton } from '@/components/admin/RowActions'

export const dynamic = 'force-dynamic'

interface UserLean {
  _id: unknown
  fullName: string
  emailNormalized: string
  phone: string
  dialCode: string
  countryCode: string
  role: string
  status: string
  createdAt: Date
}

interface WalletLean {
  _id: unknown
  balances?: { USD?: number }
}

interface TransactionLean {
  _id: unknown
  type: string
  method: string
  provider: string
  amount: number
  amountUsd: number
  currency: string
  status: string
  createdAt: Date
}

interface SellerLean {
  _id: unknown
  businessName: string
  kycStatus: string
}

export default async function AdminUserDetail({ params }: { params: { id: string } }) {
  await connectMongo()
  const user = await User.findById(params.id).lean<UserLean | null>().catch(() => null)
  if (!user) notFound()

  const [wallet, txns, seller] = await Promise.all([
    Wallet.findOne({ userId: user._id }).lean<WalletLean | null>(),
    Transaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(100).lean<TransactionLean[]>(),
    Seller.findOne({ userId: user._id }).lean<SellerLean | null>()
  ])

  const balanceUsd = wallet?.balances?.USD || 0

  const inflow = txns
    .filter(t => t.type === 'deposit' && t.status === 'confirmed')
    .reduce((s, t) => s + (t.amountUsd || 0), 0)

  const outflow = txns
    .filter(t => ['order_payment', 'fee', 'payout', 'withdrawal'].includes(t.type))
    .reduce((s, t) => s + (t.amountUsd || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">{user.fullName}</h1>
        <Link href="/admin/users" className="text-sm text-brand">Back to users</Link>
      </div>

      <section className="bg-white rounded-xl border border-surface-border p-4">
        <h2 className="font-display text-lg text-navy mb-3">Account</h2>
        <dl className="text-sm space-y-2">
          <Row label="Email" value={user.emailNormalized} />
          <Row label="Phone" value={`${user.dialCode} ${user.phone}`} />
          <Row label="Country" value={user.countryCode} />
          <Row label="Role" value={user.role} />
          <Row label="Status" value={user.status} />
          <Row label="Created" value={new Date(user.createdAt).toLocaleString()} />
        </dl>
        <div className="mt-4">
          <UserActions userId={String(user._id)} status={user.status} />
        </div>
      </section>

      <section className="bg-white rounded-xl border border-surface-border p-4">
        <h2 className="font-display text-lg text-navy mb-3">Balance</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-text-muted">Current USD</div>
            <div className="text-2xl font-bold text-navy">${balanceUsd.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-text-muted">Total deposited</div>
            <div className="text-2xl font-bold text-emerald-600">${inflow.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-text-muted">Total spent</div>
            <div className="text-2xl font-bold text-red-600">${outflow.toFixed(2)}</div>
          </div>
        </div>

        {seller && (
          <div className="mt-6 border-t border-surface-border pt-4">
            <h3 className="font-display text-navy mb-2">Seller withdrawal</h3>
            <p className="text-sm text-text-muted mb-3">
              Business: {seller.businessName} · KYC: {seller.kycStatus} · Balance: ${balanceUsd.toFixed(2)}
            </p>
            <WithdrawButton userId={String(user._id)} maxUsd={balanceUsd} />
          </div>
        )}

        {!seller && (
          <p className="mt-4 text-xs text-text-muted">
            Users deposit only. Withdrawals are enabled for seller accounts.
          </p>
        )}
      </section>

      <section className="bg-white rounded-xl border border-surface-border p-4">
        <h2 className="font-display text-lg text-navy mb-3">Money flow ({txns.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-text-muted">
              <tr>
                <th className="text-left py-2">Time</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Provider</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-right py-2">USD</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {txns.map(t => (
                <tr key={String(t._id)} className="border-t border-surface-border">
                  <td className="py-2 text-text-muted">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="py-2">{t.type}</td>
                  <td className="py-2 text-text-muted">{t.provider}</td>
                  <td className="py-2 text-right">{t.amount} {t.currency}</td>
                  <td className="py-2 text-right">${(t.amountUsd || 0).toFixed(2)}</td>
                  <td className="py-2"><span className="text-xs px-2 py-0.5 rounded-full bg-surface-muted">{t.status}</span></td>
                </tr>
              ))}
              {txns.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-text-muted">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-text-muted shrink-0">{label}</dt>
      <dd className="text-navy font-medium text-right break-all">{value}</dd>
    </div>
  )
}
