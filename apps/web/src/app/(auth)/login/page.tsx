'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

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
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error || 'Login failed')
    localStorage.setItem('accessToken', data.accessToken)
    router.push('/')
  }

  return (
    <Container className="max-w-md py-12">
      <h1 className="font-display text-2xl text-navy mb-6">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <Input type="text" placeholder="ID Number" value={idNumber} onChange={e => setIdNumber(e.target.value)} required />
        <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Logging in…' : 'Login'}
        </Button>
      </form>
      <div className="mt-4 text-sm text-text-muted">
        <a href="/forgot-password" className="text-brand">Forgot password?</a>
        <span className="mx-2">·</span>
        <a href="/register" className="text-brand">Create account</a>
      </div>
    </Container>
  )
}
