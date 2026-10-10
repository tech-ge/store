'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { authFetch } from '@/lib/auth-fetch'

interface ReceiptView {
  receiptNumber: string
  parcelPassword: string
  issuedAt: string
  buyerName: string
  items: any[]
  pricing: any
  status: string
}

export default function OrderPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [receipt, setReceipt] = useState<ReceiptView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      const res = await authFetch(`/api/orders/${id}/receipt`)
      const text = await res.text()
      let data: any
      try { data = JSON.parse(text) } catch { data = { error: text.slice(0, 200) } }
      if (!res.ok) { setError(data.error || 'Failed'); setLoading(false); return }
      setReceipt(data.receipt)
      setLoading(false)
    })()
  }, [id])

  if (loading) return <Container className="py-12 text-text-muted">Loading…</Container>
  if (error) return <Container className="py-12 text-red-600">{error}</Container>
  if (!receipt) return null

  return (
    <Container className="py-10 max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-surface-border p-6">
        <h1 className="font-display text-2xl text-navy mb-1">Order confirmed</h1>
        <p className="text-sm text-text-muted">Keep this receipt. Your parcel password is required for hand-over.</p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-surface-muted rounded-xl p-4">
            <div className="text-xs text-text-muted">Receipt number</div>
            <div className="text-lg font-mono font-bold text-navy mt-1">{receipt.receiptNumber}</div>
          </div>
          <div className="bg-surface-muted rounded-xl p-4">
            <div className="text-xs text-text-muted">Parcel password</div>
            <div className="text-lg font-mono font-bold text-navy mt-1">{receipt.parcelPassword}</div>
          </div>
        </div>

        <div className="mt-6 text-sm">
          <div className="font-medium text-navy mb-2">Summary</div>
          <ul className="divide-y divide-surface-border">
            {receipt.items?.map((it: any, i: number) => (
              <li key={i} className="py-2 flex justify-between">
                <span>{it.titleSnapshot} × {it.qty}</span>
                <span>${(it.priceUsd * it.qty).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>Subtotal</div><div className="text-right">${receipt.pricing?.subtotalUsd?.toFixed(2)}</div>
            <div>Insurance</div><div className="text-right">${receipt.pricing?.insuranceUsd?.toFixed(2)}</div>
            <div>Shipping</div><div className="text-right">${receipt.pricing?.shippingUsd?.toFixed(2)}</div>
            <div className="font-semibold">Total</div><div className="text-right font-semibold">${receipt.pricing?.totalUsd?.toFixed(2)}</div>
            <div>Paid now</div><div className="text-right">${receipt.pricing?.payNowUsd?.toFixed(2)}</div>
            <div>On delivery</div><div className="text-right">${receipt.pricing?.payLaterUsd?.toFixed(2)}</div>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="mt-6 w-full py-2.5 rounded-xl bg-brand text-white text-sm font-medium"
        >
          Download receipt
        </button>
      </div>

      <p className="text-xs text-text-muted text-center">
        Delivery is handled on our logistics partner platform. Use your parcel password to receive the package.
      </p>
    </Container>
  )
}
