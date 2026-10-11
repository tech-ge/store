'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { COUNTRIES } from '@/lib/data/countries'
import { authFetch } from '@/lib/auth-fetch'

async function readJson(res: Response) {
  const t = await res.text()
  try { return JSON.parse(t) } catch { return { error: t.slice(0, 200) } }
}

export default function BecomeSellerPage() {
  const router = useRouter()
  const [businessName, setBusinessName] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'crypto' | 'mobile_money'>('bank')
  const [payoutAccount, setPayoutAccount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await authFetch('/api/sellers/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName,
        countryCode,
        payoutMethod,
        payoutDetails: { account: payoutAccount }
      })
    })
    const data = await readJson(res)
    setLoading(false)
    if (!res.ok) return setError(data.error || 'Failed')

    router.push('/profile')
    router.refresh()
  }

  return (
    <Container className="max-w-md py-12">
      <h1 className="font-display text-2xl text-navy mb-2">Become a seller</h1>
      <p className="text-sm text-text-muted mb-6">
        Once approved, you can list products, receive orders, and request withdrawals.
        A 5% fee is charged per product sold.
      </p>

      <form onSubmit={onSubmit} className="space-y-3">
        <Input placeholder="Business name" value={businessName} onChange={e => setBusinessName(e.target.value)} required />

        <select
          value={countryCode}
          onChange={e => setCountryCode(e.target.value)}
          required
          className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-white text-sm"
        >
          <option value="">Business country</option>
          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>

        <select
          value={payoutMethod}
          onChange={e => setPayoutMethod(e.target.value as any)}
          className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-white text-sm"
        >
          <option value="bank">Bank transfer</option>
          <option value="crypto">Crypto (USDT/BTC)</option>
          <option value="mobile_money">Mobile money</option>
        </select>

        <Input
          placeholder="Payout account (IBAN, wallet address, phone)"
          value={payoutAccount}
          onChange={e => setPayoutAccount(e.target.value)}
          required
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Submitting…' : 'Submit application'}
        </Button>
      </form>
    </Container>
  )
}
