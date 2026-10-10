'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'

interface Me {
  id: string
  fullName: string
  email: string
  role: string
  countryCode: string
  status: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { router.push('/login'); return }

    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then((data: Me | null) => {
        if (!data) { router.push('/login'); return }
        if (data.role === 'seller') { router.replace('/seller'); return }
        if (data.role === 'admin') { router.replace('/admin'); return }
        setMe(data)
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <Container className="py-16 text-text-muted">Loading…</Container>
  if (!me) return null

  return (
    <Container className="py-10 max-w-3xl space-y-6">
      <h1 className="font-display text-3xl text-navy">My profile</h1>

      <section className="bg-white rounded-2xl border border-surface-border p-6">
        <h2 className="font-display text-xl text-navy mb-4">Account</h2>
        <dl className="text-base space-y-3">
          <Row label="Name" value={me.fullName} />
          <Row label="Email" value={me.email} />
          <Row label="Country" value={me.countryCode} />
          <Row label="Role" value={me.role} />
          <Row label="Status" value={me.status} />
        </dl>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/wallet" className="px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-medium">Wallet</Link>
          <Link href="/orders" className="px-4 py-2.5 rounded-xl bg-surface-muted text-navy text-sm font-medium">My orders</Link>
          {me.status === 'active' && (
            <Link href="/profile/become-seller" className="px-4 py-2.5 rounded-xl bg-navy text-white text-sm font-medium">
              Become a seller
            </Link>
          )}
        </div>
      </section>
    </Container>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-navy font-medium">{value}</dd>
    </div>
  )
}
