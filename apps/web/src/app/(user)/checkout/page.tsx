'use client'
import { useCart } from '@/hooks/useCart'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'

export default function CheckoutPage() {
  const { items, subtotal } = useCart()
  const insurance = +(subtotal * 0.02).toFixed(2)
  const shipping = 5
  const total = +(subtotal + insurance + shipping).toFixed(2)
  const payNow = +(subtotal * 0.2 + insurance + shipping).toFixed(2)
  const payLater = +(subtotal * 0.8).toFixed(2)

  return (
    <Container className="py-8 max-w-xl">
      <h1 className="font-display text-2xl text-navy mb-6">Checkout</h1>
      <div className="bg-white rounded-xl border border-surface-border p-4 space-y-2 text-sm">
        <Row label="Subtotal" value={subtotal} />
        <Row label="Insurance (2%)" value={insurance} />
        <Row label="Shipping" value={shipping} />
        <div className="border-t border-surface-border pt-2 mt-2">
          <Row label="Total" value={total} bold />
        </div>
        <div className="border-t border-surface-border pt-2 mt-2">
          <Row label="Pay now (20% + fees)" value={payNow} bold />
          <Row label="Pay on delivery (80%)" value={payLater} />
        </div>
      </div>
      <Button className="mt-6 w-full" disabled={!items.length}>Place order</Button>
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
