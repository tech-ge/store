'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'

interface Me {
  id: string
  fullName: string
  email: string
  role: string
  countryCode: string
  status: string
}

interface Wallet { balances?: { USD?: number } }

interface Txn {
  _id: string
  type: string
  method: string
  provider: string
  amount: number
  amountUsd: number
  currency: string
  status: string
  createdAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [me, setMe] = useState<Me | null>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [txns, setTxns] = useState<Txn[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { router.push('/login'); return }

    Promise.all([
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
      fetch('/api/payments/wallet', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null)
    ]).then(([meData, walletData]) => {
      setMe(meData)
      setWallet(walletData?.wallet || null)
      setTxns(walletData?.transactions || [])
    }).finally(() => setLoading(false))
  }, [router])

  if (loading) return <Container className="py-12 text-text-muted">Loading…</Container>
  if (!me) return <Container className="py-12 text-text-muted">Please log in.</Container>

  const balance = wallet?.balances?.USD || 0
  const isSeller = me.role === 'seller'

  return (
    <Container className="py-10 space-y-8 max-w-4xl">
      <h1 className="font-display text-3xl text-navy">My profile</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-surface-border p-6">
          <h2 className="font-display text-xl text-navy mb-4">Account</h2>
          <div className="text-base space-y-3">
            <Row label="Name" value={me.fullName} />
            <Row label="Email" value={me.email} />
            <Row label="Country" value={me.countryCode} />
            <Row label="Role" value={me.role} />
            <Row label="Status" value={me.status} />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-surface-border p-6">
          <h2 className="font-display text-xl text-navy mb-4">Balance</h2>
          <div className="text-4xl font-bold text-navy">${balance.toFixed(2)}</div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/wallet" className="px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-medium">Deposit</Link>
            {!isSeller && me.status === 'active' && (
              <Link href="/profile/become-seller" className="px-4 py-2.5 rounded-xl bg-surface-muted text-navy text-sm font-medium">
                Become a seller
              </Link>
            )}
            {isSeller && (
              <Link href="/seller" className="px-4 py-2.5 rounded-xl bg-navy text-white text-sm font-medium">
                Seller dashboard
              </Link>
            )}
          </div>
        </section>
      </div>

      <section className="bg-white rounded-2xl border border-surface-border p-6">
        <h2 className="font-display text-xl text-navy mb-4">Recent transactions ({txns.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead className="text-text-muted">
              <tr>
                <th className="text-left py-2">Time</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Provider</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {txns.map(t => (
                <tr key={t._id} className="border-t border-surface-border">
                  <td className="py-3 text-text-muted">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="py-3">{t.type}</td>
                  <td className="py-3 text-text-muted">{t.provider}</td>
                  <td className="py-3 text-right">${(t.amountUsd || 0).toFixed(2)}</td>
                  <td className="py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-surface-muted">{t.status}</span></td>
                </tr>
              ))}
              {txns.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-text-muted">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Container>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-text-muted">{label}</span>
      <span className="text-navy font-medium text-right">{value}</span>
    </div>
  )
}
