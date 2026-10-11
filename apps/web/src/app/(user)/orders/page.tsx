'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { authFetch } from '@/lib/auth-fetch'

interface Order {
  _id: string
  status: string
  currencyLocal: string
  pricing?: { totalUsd?: number; payNowUsd?: number; payLaterUsd?: number }
  items?: any[]
  createdAt: string
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { router.push('/login'); return }

    // custom endpoint: list my orders
    authFetch('/api/orders/mine')
      .then(r => r.ok ? r.json() : { orders: [] })
      .then(d => setOrders(d.orders || []))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <Container className="py-16 text-text-muted">Loading orders…</Container>

  if (!orders.length) {
    return (
      <Container className="space-y-4 py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Your account</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-navy">My orders</h1>
        <p className="text-text-muted">You have no orders yet.</p>
        <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600">Start shopping</Link>
      </Container>
    )
  }

  return (
    <Container className="py-10 max-w-4xl">
      <div className="mb-6">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-brand">Your account</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-navy">My orders</h1>
      </div>
      <div className="space-y-4">
        {orders.map(o => (
          <Link key={o._id} href={`/orders/${o._id}`}
            className="block rounded-2xl border border-surface-border bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-card sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-semibold text-navy">Order {o._id.slice(-8)}</div>
                <div className="text-xs text-text-muted">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-navy">${(o.pricing?.totalUsd || 0).toFixed(2)}</div>
                <div className="text-xs text-text-muted">{o.status}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  )
}
