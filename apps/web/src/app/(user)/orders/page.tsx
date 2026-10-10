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
      <Container className="py-16 text-center space-y-4">
        <h1 className="font-display text-3xl text-navy">My orders</h1>
        <p className="text-text-muted">You have no orders yet.</p>
        <Link href="/" className="inline-block px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-medium">Start shopping</Link>
      </Container>
    )
  }

  return (
    <Container className="py-10 max-w-4xl">
      <h1 className="font-display text-3xl text-navy mb-6">My orders</h1>
      <div className="space-y-4">
        {orders.map(o => (
          <Link key={o._id} href={`/orders/${o._id}`}
            className="block bg-white rounded-2xl border border-surface-border p-5 hover:border-brand transition">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-navy font-medium">Order {o._id.slice(-8)}</div>
                <div className="text-xs text-text-muted">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-navy font-semibold">${(o.pricing?.totalUsd || 0).toFixed(2)}</div>
                <div className="text-xs text-text-muted">{o.status}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  )
}
