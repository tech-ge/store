'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authJson } from '@/lib/auth-fetch'

export default function SellFromEnquiry() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [price, setPrice] = useState('')
  const [qty, setQty] = useState('1')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setMsg('')
    try {
      const result = await authJson(`/api/seller/enquiries/${id}/sell`, {
        method: 'POST',
        body: JSON.stringify({ priceUsd: Number(price), quantity: Number(qty) })
      })
      setMsg(`Order created ${result.orderId}`)
      setTimeout(() => router.push('/seller/enquiries'), 800)
    } catch (e: any) {
      setMsg(e.message || 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="font-display text-2xl text-navy mb-4">Complete the sale</h1>
      <form onSubmit={submit} className="space-y-3">
        <Input type="number" step="0.01" placeholder="Price per unit (USD)" value={price} onChange={e => setPrice(e.target.value)} required />
        <Input type="number" placeholder="Quantity" value={qty} onChange={e => setQty(e.target.value)} required />
        {msg && <p className="text-sm text-text-muted">{msg}</p>}
        <Button type="submit" disabled={busy} className="w-full">{busy ? 'Working…' : 'Sell now'}</Button>
      </form>
    </div>
  )
}
