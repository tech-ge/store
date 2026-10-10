'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { useCart } from '@/hooks/useCart'
import { Price } from '@/components/price/Price'

export default function CartPage() {
  const { items, updateQty, remove, clear, subtotal, count, loading } = useCart()
  const [removing, setRemoving] = useState<string | null>(null)

  async function handleRemove(id: string) {
    setRemoving(id)
    await remove(id)
    setRemoving(null)
  }

  const insurance = +(subtotal * 0.02).toFixed(2)
  const shipping = items.length ? 5 : 0
  const total = +(subtotal + insurance + shipping).toFixed(2)
  const payNow = +(subtotal * 0.2 + insurance + shipping).toFixed(2)
  const payLater = +(subtotal * 0.8).toFixed(2)

  if (loading) {
    return <Container className="py-16 text-text-muted">Loading cart…</Container>
  }

  if (!items.length) {
    return (
      <Container className="py-16 text-center space-y-4">
        <h1 className="font-display text-3xl text-navy">Your cart is empty</h1>
        <p className="text-text-muted">Browse our stores and add items to begin.</p>
        <Link href="/" className="inline-block px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-medium">
          Start shopping
        </Link>
      </Container>
    )
  }

  return (
    <Container className="py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-navy">Your cart ({count})</h1>
        <button onClick={clear} className="text-sm text-text-muted hover:text-red-600">Clear cart</button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.productId} className="bg-white rounded-2xl border border-surface-border p-4 flex gap-4">
              <Link href={`/products/${item.productId}`} className="shrink-0">
                <img src={item.image || '/placeholder.svg'} alt={item.title}
                  className="w-28 h-28 rounded-xl object-cover bg-surface-muted" />
              </Link>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/products/${item.productId}`} className="text-base font-medium text-navy hover:text-brand line-clamp-2">
                    {item.title}
                  </Link>
                  <div className="mt-1">
                    <Price usd={item.price} className="text-base" />
                  </div>
                  {item.price !== item.priceAtAdd && (
                    <p className="text-xs text-amber-600 mt-1">Price changed since you added this item.</p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.productId, Math.max(1, item.qty - 1))}
                      className="w-8 h-8 rounded-lg border border-surface-border text-navy hover:bg-surface-muted"
                    >−</button>
                    <span className="w-10 text-center text-navy font-medium">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                      className="w-8 h-8 rounded-lg border border-surface-border text-navy hover:bg-surface-muted"
                    >+</button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-base font-semibold text-navy">
                      ${(item.price * item.qty).toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRemove(item.productId)}
                      disabled={removing === item.productId}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      {removing === item.productId ? 'Removing…' : 'Remove'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-white rounded-2xl border border-surface-border p-6 h-fit space-y-4">
          <h2 className="font-display text-xl text-navy">Order summary</h2>

          <div className="text-sm space-y-2">
            <Row label="Subtotal" value={subtotal} />
            <Row label="Insurance (2%)" value={insurance} />
            <Row label="Shipping estimate" value={shipping} />
            <div className="border-t border-surface-border pt-2">
              <Row label="Total" value={total} bold />
            </div>
            <div className="border-t border-surface-border pt-2">
              <Row label="Pay now (20% + fees)" value={payNow} bold />
              <Row label="Pay on delivery (80%)" value={payLater} />
            </div>
          </div>

          <Link
            href="/checkout"
            className="block w-full text-center py-3 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-500"
          >
            Proceed to checkout
          </Link>

          <p className="text-xs text-text-muted text-center">
            You'll be asked to log in or create an account to complete your order.
          </p>
        </aside>
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
