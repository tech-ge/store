'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Icon } from '@/components/ui/Icon'

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

  if (loading) return <Container className="py-16 text-text-muted">Loading your account…</Container>
  if (!me) return null

  return (
    <Container className="max-w-4xl space-y-6 py-8 sm:py-12">
      <section className="cinematic-hero relative isolate overflow-hidden rounded-3xl px-6 py-8 text-white shadow-card sm:px-9 sm:py-10">
        <div aria-hidden="true" className="hero-orbit hero-orbit-one" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white backdrop-blur"><Icon name="user" size={27} /></div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-400">Your personal space</p>
            <h1 className="mt-1 truncate font-display text-2xl font-semibold tracking-tight sm:text-3xl">Hello, {me.fullName.split(' ')[0]}</h1>
            <p className="mt-1 text-sm text-white/65">Manage your account, orders and wallet.</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-surface-border bg-white p-5 shadow-card sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand"><Icon name="user" /></span>
          <div>
            <h2 className="font-display text-xl font-semibold text-navy">Account details</h2>
            <p className="text-sm text-text-muted">Your personal information and account status.</p>
          </div>
        </div>
        <dl className="divide-y divide-surface-border/80 text-sm sm:text-base">
          <Row label="Name" value={me.fullName} />
          <Row label="Email" value={me.email} />
          <Row label="Country" value={me.countryCode} />
          <Row label="Role" value={me.role} />
          <Row label="Status" value={me.status} />
        </dl>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link href="/orders" className="group flex min-h-16 items-center gap-3 rounded-2xl border border-surface-border bg-white p-4 transition hover:border-brand/40 hover:shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-navy group-hover:bg-brand/10 group-hover:text-brand"><Icon name="package" /></span>
            <span className="flex-1"><span className="block text-sm font-semibold text-navy">My orders</span><span className="text-xs text-text-muted">Track your purchases</span></span>
            <Icon name="arrow" size={17} className="text-text-muted group-hover:text-brand" />
          </Link>
          <Link href="/wallet" className="group flex min-h-16 items-center gap-3 rounded-2xl border border-surface-border bg-white p-4 transition hover:border-brand/40 hover:shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-navy group-hover:bg-brand/10 group-hover:text-brand"><Icon name="wallet" /></span>
            <span className="flex-1"><span className="block text-sm font-semibold text-navy">My wallet</span><span className="text-xs text-text-muted">Manage your balance</span></span>
            <Icon name="arrow" size={17} className="text-text-muted group-hover:text-brand" />
          </Link>
          {me.status === 'active' && (
            <Link href="/profile/become-seller" className="group flex min-h-16 items-center gap-3 rounded-2xl border border-surface-border bg-white p-4 transition hover:border-brand/40 hover:shadow-card">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-navy group-hover:bg-brand/10 group-hover:text-brand"><Icon name="store" /></span>
              <span className="flex-1"><span className="block text-sm font-semibold text-navy">Become a seller</span><span className="text-xs text-text-muted">Start your own store</span></span>
              <Icon name="arrow" size={17} className="text-text-muted group-hover:text-brand" />
            </Link>
          )}
        </div>
      </section>
    </Container>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-text-muted">{label}</dt>
      <dd className="break-all font-medium text-navy sm:text-right">{value}</dd>
    </div>
  )
}
