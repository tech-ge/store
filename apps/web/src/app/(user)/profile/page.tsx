'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'

interface Me {
  id: string
  fullName: string
  email: string
  role: string
  countryCode: string
  status: string
}

interface Wallet {
  balances?: { USD?: number }
}

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

interface KycInfo {
  idNumberNormalized: string
  idPhotoUrl: string
  status: string
}

async function readJson(res: Response) {
  const t = await res.text()
  try { return JSON.parse(t) } catch { return { error: t.slice(0, 200) } }
}

export default function ProfilePage() {
  const router = useRouter()
  const [me, setMe] = useState<Me | null>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [txns, setTxns] = useState<Txn[]>([])
  const [kyc, setKyc] = useState<KycInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { router.push('/login'); return }

    Promise.all([
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
      fetch('/api/payments/wallet', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
      fetch('/api/kyc/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null)
    ]).then(([meData, walletData, kycData]) => {
      setMe(meData)
      setWallet(walletData?.wallet || null)
      setTxns(walletData?.transactions || [])
      setKyc(kycData?.kyc || null)
    }).finally(() => setLoading(false))
  }, [router])

  if (loading) return <Container className="py-12 text-text-muted">Loading…</Container>
  if (!me) return <Container className="py-12 text-text-muted">Please log in.</Container>

  const balance = wallet?.balances?.USD || 0

  return (
    <Container className="py-8 space-y-6 max-w-4xl">
      <h1 className="font-display text-2xl text-navy">My profile</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-surface-border p-4">
          <h2 className="font-display text-lg text-navy mb-3">Account</h2>
          <div className="text-sm space-y-2">
            <Row label="Name" value={me.fullName} />
            <Row label="Email" value={me.email} />
            <Row label="Country" value={me.countryCode} />
            <Row label="Role" value={me.role} />
            <Row label="Status" value={me.status} />
          </div>
        </section>

        <section className="bg-white rounded-xl border border-surface-border p-4">
          <h2 className="font-display text-lg text-navy mb-3">Balance</h2>
          <div className="text-3xl font-bold text-navy">${balance.toFixed(2)}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/wallet" className="px-3 py-2 rounded-lg bg-brand text-white text-sm">Deposit</Link>
            {me.role !== 'seller' && me.status === 'active' && (
              <Link href="/profile/become-seller" className="px-3 py-2 rounded-lg bg-surface-muted text-navy text-sm">
                Become a seller
              </Link>
            )}
            {me.role === 'seller' && (
              <Link href="/seller" className="px-3 py-2 rounded-lg bg-navy text-white text-sm">
                Seller dashboard
              </Link>
            )}
          </div>
        </section>
      </div>

      <section className="bg-white rounded-xl border border-surface-border p-4">
        <h2 className="font-display text-lg text-navy mb-3">ID verification</h2>
        {kyc ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="text-sm space-y-2">
              <Row label="ID number" value={kyc.idNumberNormalized} />
              <Row label="Status" value={kyc.status} />
            </div>
            <img src={kyc.idPhotoUrl} alt="ID" className="w-full rounded-lg border border-surface-border max-h-64 object-contain" />
          </div>
        ) : (
          <p className="text-sm text-text-muted">No KYC record.</p>
        )}
      </section>

      <section className="bg-white rounded-xl border border-surface-border p-4">
        <h2 className="font-display text-lg text-navy mb-3">Recent transactions ({txns.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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
                  <td className="py-2 text-text-muted">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="py-2">{t.type}</td>
                  <td className="py-2 text-text-muted">{t.provider}</td>
                  <td className="py-2 text-right">${(t.amountUsd || 0).toFixed(2)}</td>
                  <td className="py-2"><span className="text-xs px-2 py-0.5 rounded-full bg-surface-muted">{t.status}</span></td>
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
