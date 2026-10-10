'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { authFetch, authJson } from '@/lib/auth-fetch'

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

export default function WalletPage() {
  const router = useRouter()
  const [balance, setBalance] = useState(0)
  const [txns, setTxns] = useState<Txn[]>([])
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  async function refresh() {
    const token = localStorage.getItem('accessToken')
    if (!token) { router.push('/login'); return }
    const r = await authFetch('/api/payments/wallet')
    const d = r.ok ? await r.json() : { wallet: null, transactions: [] }
    setBalance(d?.wallet?.balances?.USD || 0)
    setTxns(d?.transactions || [])
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  async function depositCard() {
    const n = Number(amount)
    if (!n || n < 1) return setMsg('Enter a valid amount')
    setBusy('card'); setMsg('')
    try {
      const d = await authJson<{ url: string }>('/api/payments/deposit/card', {
        method: 'POST',
        body: JSON.stringify({ amountUsd: n })
      })
      if (d.url) window.location.href = d.url
    } catch (e: any) { setMsg(e.message) } finally { setBusy(null) }
  }

  async function depositCrypto() {
    setBusy('crypto'); setMsg('')
    try {
      const d = await authJson<{ address: string; network: string; asset: string }>('/api/payments/deposit/crypto', { method: 'POST' })
      setMsg(`Send ${d.asset} on ${d.network} to: ${d.address}`)
    } catch (e: any) { setMsg(e.message) } finally { setBusy(null) }
  }

  async function depositMobile() {
    const n = Number(amount)
    if (!n || n < 1) return setMsg('Enter amount')
    const phone = prompt('Phone number with country code (e.g. +254712345678)')
    if (!phone) return
    setBusy('mobile'); setMsg('')
    try {
      await authJson('/api/payments/deposit/mobile', {
        method: 'POST',
        body: JSON.stringify({ phone, amountKes: n })
      })
      setMsg('Check your phone to authorize the payment.')
    } catch (e: any) { setMsg(e.message) } finally { setBusy(null) }
  }

  if (loading) return <Container className="py-16 text-text-muted">Loading wallet…</Container>

  return (
    <Container className="py-10 max-w-3xl space-y-6">
      <h1 className="font-display text-3xl text-navy">Wallet</h1>

      <div className="bg-white rounded-2xl border border-surface-border p-6">
        <div className="text-sm text-text-muted">Available balance</div>
        <div className="text-4xl font-bold text-navy mt-1">${balance.toFixed(2)}</div>
      </div>

      <div className="bg-white rounded-2xl border border-surface-border p-6 space-y-3">
        <h2 className="font-display text-lg text-navy">Deposit funds</h2>
        <input
          type="number"
          step="0.01"
          placeholder="Amount in USD"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-surface-border outline-none focus:border-brand"
        />
        <div className="flex flex-wrap gap-2">
          <button onClick={depositCard} disabled={busy !== null}
            className="px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-medium disabled:opacity-50">
            {busy === 'card' ? '…' : 'Pay with card'}
          </button>
          <button onClick={depositCrypto} disabled={busy !== null}
            className="px-4 py-2.5 rounded-xl bg-surface-muted text-navy text-sm font-medium disabled:opacity-50">
            {busy === 'crypto' ? '…' : 'Crypto (USDT)'}
          </button>
          <button onClick={depositMobile} disabled={busy !== null}
            className="px-4 py-2.5 rounded-xl bg-surface-muted text-navy text-sm font-medium disabled:opacity-50">
            {busy === 'mobile' ? '…' : 'Mobile money'}
          </button>
        </div>
        {msg && <p className="text-sm text-text-muted break-all">{msg}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-surface-border p-6">
        <h2 className="font-display text-lg text-navy mb-4">Transactions ({txns.length})</h2>
        <div className="overflow-x-auto">
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
      </div>
    </Container>
  )
}
