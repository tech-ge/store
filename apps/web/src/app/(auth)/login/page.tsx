'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/brand/Logo'
import { Icon } from '@/components/ui/Icon'

async function readJson(res: Response) {
  const text = await res.text()
  try { return JSON.parse(text) } catch { return { error: text.slice(0, 200) || res.statusText } }
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, idNumber, password })
    })
    const data = await readJson(res)
    setLoading(false)

    if (!res.ok) { setError(data.error || 'Login failed'); return }

    localStorage.setItem('accessToken', data.accessToken)

    const role = data.user?.role
    if (role === 'admin') router.push('/admin')
    else if (role === 'seller') router.push('/seller')
    else router.push('/')
    router.refresh()
  }

  return (
    <main className="account-scene flex min-h-screen items-center justify-center px-4 py-10 sm:py-16">
      <section className="w-full max-w-md rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(11,31,58,0.10)] backdrop-blur-xl sm:p-9">
        <Logo size={38} />
        <div className="mb-7 mt-8">
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand"><Icon name="user" size={22} /></div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand">Welcome back</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-navy">Sign in to your account</h1>
          <p className="mt-2 text-sm leading-6 text-text-muted">Your favorite finds and orders are right where you left them.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          <Input type="text" placeholder="ID Number" value={idNumber} onChange={e => setIdNumber(e.target.value)} required autoComplete="off" />
          <PasswordInput placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="mt-2 min-h-12 w-full !rounded-xl !font-semibold">{loading ? 'Logging in…' : 'Sign in'}</Button>
        </form>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm">
          <a href="/forgot-password" className="font-medium text-text-muted transition hover:text-brand">Forgot password?</a>
          <a href="/register" className="font-semibold text-brand">Create an account <span aria-hidden="true">→</span></a>
        </div>
      </section>
    </main>
  )
}
