'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'

interface Wallet {
  balances?: Record<string, number>
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

async function readJson(res: Response) {
  const t = await res.text()
  try { return JSON.parse(t) } catch { return { error: t.slice(0, 200) } }
}

export default function WalletPage() {
  const router = useRouter()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [txns, setTxns] = useState<Txn[]>([])
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  function token() { return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null }

  async function refresh() {
    const t = token()
    if (!t) { router.push('/login'); return }
    const res = await fetch('/api/payments/wallet', { headers: { Authorization: `Bearer ${t}` } })
    const data = await readJson(res)
    setWallet(data.wallet || null)
    setTxns(data.transactions || [])
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  async function depositCard() {
    setError('')
    const n = Number(amount)
    if (!n || n < 1) return setError('Enter a valid amount')
    const t = token()
    const res = await fetch('/api/payments/deposit/card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ amountUsd: n })
    })
    const data = await readJson(res)
    if (!res.ok) return setError(data.error || 'Failed')
    if (data.url) window.location.href = data.url
  }

  async function depositCrypto() {
    setError('')
    const t = token()
    const res = await fetch('/api/payments/deposit/crypto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }
    })
    const data = await readJson(res)
    if (!res.ok) return setError(data.error || 'Failed')
    alert(`Send USDT (TRC20) to:\n${data.address}`)
  }

  async function depositMobile() {
    setError('')
    const n = Number(amount)
    if (!n || n < 1) return setError('Enter amount in USD to convert')
    const phone = prompt('Enter phone number (with country code, e.g. +254712345678)')
    if (!phone) return
    const t = token()
    const res = await fetch('/api/payments/deposit/mobile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ phone, amountKes: n })
    })
    const data = await readJson(res)
    if (!res.ok) return setError(data.error || 'Failed')
    alert('Check your phone to complete payment.')
  }

  if (loading) return <Container className="py-12 text-text-muted">Loading…</Container>

  const usd = wallet?.balances?.USD || 0

  return (
    <Container className="py-8 space-y-6 max-w-3xl">
      <h1 className="font-display text-2xl text-navy">Wallet</h1>

      <section className="bg-white rounded-xl border border-surface-border p-4">
        <div className="text-text-muted text-sm">Available balance</div>
        <div className="text-3xl font-bold text-navy mt-1">${usd.toFixed(2)}</div>
      </section>

      <section className="bg-white rounded-xl border border-surface-border p-4 space-y-3">
        <h2 className="font-display text-lg text-navy">Deposit</h2>
        <input
          type="number"
          step="0.01"
          placeholder="Amount in USD"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-white outline-none focus:border-brand"
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={depositCard}>Pay with card</Button>
          <Button onClick={depositCrypto} variant="ghost">Crypto (USDT/BTC)</Button>
          <Button onClick={depositMobile} variant="ghost">Mobile money</Button>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </section>

      <section className="bg-white rounded-xl border border-surface-border p-4">
        <h2 className="font-display text-lg text-navy mb-3">Transactions ({txns.length})</h2>
        <table className="w-full text-sm">
          <thead className="text-text-muted">
            <tr>
              <th className="text-left py-2">Time</th>
              <th className="text-left py-2">Type</th>
              <th className="text-left py-2">Provider</th>
              <th className="text-right py-2">USD</th>
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
      </section>
    </Container>
  )
}
