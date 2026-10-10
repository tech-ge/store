import Link from 'next/link'
import { connectMongo, Transaction, User } from '@dd/db-mongo'

export const dynamic = 'force-dynamic'

interface TxnLean {
  _id: unknown
  userId: unknown
  type: string
  method: string
  provider: string
  amount: number
  amountUsd: number
  currency: string
  status: string
  createdAt: Date
}

export default async function AdminTransactions({ searchParams }: { searchParams: { type?: string } }) {
  await connectMongo()
  const filter: any = {}
  if (searchParams.type) filter.type = searchParams.type

  const txns = await Transaction.find(filter).sort({ createdAt: -1 }).limit(500).lean<TxnLean[]>()
  const users = await User.find({ _id: { $in: txns.map(t => t.userId) } }).lean()
  const userMap = new Map(users.map((u: any) => [String(u._id), u]))

  const totals = {
    deposits: txns.filter(t => t.type === 'deposit' && t.status === 'confirmed').reduce((s, t) => s + t.amountUsd, 0),
    withdrawals: txns.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amountUsd, 0),
    orderPayments: txns.filter(t => t.type === 'order_payment').reduce((s, t) => s + t.amountUsd, 0),
    fees: txns.filter(t => t.type === 'fee').reduce((s, t) => s + t.amountUsd, 0)
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-4">Transactions ({txns.length})</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Total deposits" value={totals.deposits} tone="emerald" />
        <Stat label="Total withdrawals" value={totals.withdrawals} tone="red" />
        <Stat label="Order payments" value={totals.orderPayments} tone="navy" />
        <Stat label="Fees collected" value={totals.fees} tone="brand" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        {['', 'deposit', 'order_payment', 'withdrawal', 'fee', 'refund', 'payout'].map(t => (
          <Link key={t || 'all'} href={t ? `/admin/transactions?type=${t}` : '/admin/transactions'}
            className={`px-3 py-1.5 rounded-lg border ${searchParams.type === t || (!searchParams.type && !t) ? 'bg-brand text-white border-brand' : 'bg-white border-surface-border'}`}>
            {t || 'All'}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-surface-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">Time</th>
              <th className="text-left px-4 py-2">User</th>
              <th className="text-left px-4 py-2">Type</th>
              <th className="text-left px-4 py-2">Method</th>
              <th className="text-left px-4 py-2">Provider</th>
              <th className="text-right px-4 py-2">Amount</th>
              <th className="text-right px-4 py-2">USD</th>
              <th className="text-left px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {txns.map(t => {
              const u: any = userMap.get(String(t.userId))
              return (
                <tr key={String(t._id)} className="border-t border-surface-border">
                  <td className="px-4 py-2 text-text-muted whitespace-nowrap">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <Link href={`/admin/users/${String(t.userId)}`} className="text-navy hover:text-brand">
                      {u?.emailNormalized || '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{t.type}</td>
                  <td className="px-4 py-2 text-text-muted">{t.method}</td>
                  <td className="px-4 py-2 text-text-muted">{t.provider}</td>
                  <td className="px-4 py-2 text-right">{t.amount} {t.currency}</td>
                  <td className="px-4 py-2 text-right">${(t.amountUsd || 0).toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface-muted">{t.status}</span>
                  </td>
                </tr>
              )
            })}
            {txns.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-text-muted">No transactions.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  const color = tone === 'emerald' ? 'text-emerald-600'
    : tone === 'red' ? 'text-red-600'
    : tone === 'brand' ? 'text-brand'
    : 'text-navy'
  return (
    <div className="bg-white rounded-xl border border-surface-border p-4">
      <div className="text-xs text-text-muted">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>${value.toFixed(2)}</div>
    </div>
  )
}
