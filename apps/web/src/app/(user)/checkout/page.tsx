'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { useCart } from '@/hooks/useCart'
import { authJson, authFetch } from '@/lib/auth-fetch'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clear } = useCart()
  const [me, setMe] = useState<any>(null)
  const [wallet, setWallet] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!token) { router.push('/login'); return }

    Promise.all([
      authFetch('/api/auth/me').then(r => r.ok ? r.json() : null),
      authFetch('/api/payments/wallet').then(r => r.ok ? r.json() : null)
    ]).then(([meData, walletData]) => {
      if (!meData) { router.push('/login'); return }
      setMe(meData)
      setWallet(walletData?.wallet?.balances?.USD || 0)
    }).finally(() => setLoading(false))
  }, [router])

  const insurance = +(subtotal * 0.02).toFixed(2)
  const shipping = items.length ? 5 : 0
  const total = +(subtotal + insurance + shipping).toFixed(2)
  const payNow = +(subtotal * 0.2 + insurance + shipping).toFixed(2)
  const payLater = +(subtotal * 0.8).toFixed(2)

  async function placeOrder() {
    setError('')
    if (!items.length) return setError('Your cart is empty')
    if (wallet < payNow) return setError(`Wallet balance insufficient. Need $${payNow.toFixed(2)}. Deposit first.`)
    setPlacing(true)

    try {
      // merge local cart into server cart
      await authJson('/api/cart/merge', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map(i => ({
            productId: i.productId,
            sellerId: i.sellerId || null,
            qty: i.qty,
            priceUsd: i.price,
            storeId: i.storeId
          }))
        })
      })

      // place order
      const res = await authJson<{ orderId: string; payNowUsd: number }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, qty: i.qty })),
          destination: { lat: 0, lng: 0 }
        })
      })

      await clear()
      router.push(`/orders/${res.orderId}`)
    } catch (e: any) {
      setError(e.message || 'Order failed')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return <Container className="py-16 text-text-muted">Loading…</Container>
  if (!items.length) return (
    <Container className="py-16 text-center">
      <p className="text-text-muted">Your cart is empty.</p>
      <a href="/" className="text-brand mt-4 inline-block">Back to shop</a>
    </Container>
  )

  return (
    <Container className="py-10 max-w-3xl">
      <h1 className="font-display text-3xl text-navy mb-6">Checkout</h1>

      <div className="bg-white rounded-2xl border border-surface-border p-6 space-y-3 text-sm">
        <h2 className="font-display text-lg text-navy mb-2">Order summary</h2>
        {items.map(i => (
          <div key={i.productId} className="flex justify-between">
            <span className="text-navy">{i.title} × {i.qty}</span>
            <span>${(i.price * i.qty).toFixed(2)}</span>
          </div>
        ))}

        <div className="border-t border-surface-border pt-3 space-y-2">
          <Row label="Subtotal" value={subtotal} />
          <Row label="Insurance (2%)" value={insurance} />
          <Row label="Shipping" value={shipping} />
          <div className="border-t border-surface-border pt-2">
            <Row label="Total" value={total} bold />
          </div>
          <div className="border-t border-surface-border pt-2">
            <Row label="Pay now (20% + fees)" value={payNow} bold />
            <Row label="Pay on delivery (80%)" value={payLater} />
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-surface-border p-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-text-muted">Wallet balance</div>
            <div className="text-2xl font-bold text-navy">${wallet.toFixed(2)}</div>
          </div>
          <a href="/wallet" className="text-sm text-brand">Deposit</a>
        </div>

        {wallet < payNow && (
          <p className="text-sm text-amber-600 mt-3">
            You need at least ${payNow.toFixed(2)} to place this order.
          </p>
        )}

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <button
          onClick={placeOrder}
          disabled={placing || wallet < payNow}
          className="mt-4 w-full py-3 rounded-xl bg-brand text-white text-sm font-semibold disabled:opacity-50"
        >
          {placing ? 'Placing order…' : `Pay $${payNow.toFixed(2)} now`}
        </button>

        <p className="text-xs text-text-muted text-center mt-3">
          The remaining ${payLater.toFixed(2)} is paid on delivery.
        </p>
      </div>
    </Container>
  )
}

function Row({ label, value, bold = false }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-semibold text-navy' : 'text-text-muted'}`}>
      <span>{label}</span>
      <span>${value.toFixed(2)}</span>
    </div>
  )
}
