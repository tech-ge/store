'use client'
import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { useCart } from '@/hooks/useCart'

export default function CartPage() {
  const { items, updateQty, remove, subtotal, count } = useCart()

  return (
    <Container className="py-8">
      <h1 className="font-display text-2xl text-navy mb-6">Your cart ({count})</h1>

      {items.length === 0 && (
        <p className="text-text-muted text-sm">Cart is empty. <Link href="/" className="text-brand">Continue shopping</Link>.</p>
      )}

      {items.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            {items.map(i => (
              <div key={i.productId} className="bg-white rounded-xl border border-surface-border p-3 flex gap-3">
                <img src={i.image} alt={i.title} className="w-20 h-20 rounded-lg object-cover bg-surface-muted" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-navy">{i.title}</div>
                  <div className="text-brand text-sm font-semibold mt-1">${i.price.toFixed(2)}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={i.qty}
                      onChange={(e) => updateQty(i.productId, Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg border border-surface-border text-sm"
                    />
                    <button onClick={() => remove(i.productId)} className="text-xs text-red-600">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="bg-white rounded-xl border border-surface-border p-4 h-fit">
            <div className="text-sm text-text-muted">Subtotal (USD)</div>
            <div className="text-2xl font-bold text-navy mt-1">${subtotal.toFixed(2)}</div>
            <Link href="/checkout" className="mt-4 block text-center bg-brand text-white rounded-xl py-2.5 text-sm font-medium">Checkout</Link>
            <p className="text-xs text-text-muted mt-2">Login or create an account to complete your order.</p>
          </aside>
        </div>
      )}
    </Container>
  )
}
