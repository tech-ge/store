'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'

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

    if (!res.ok) {
      setError(data.error || 'Login failed')
      return
    }

    localStorage.setItem('accessToken', data.accessToken)
    router.push(data.user?.role === 'admin' ? '/admin' : '/')
    router.refresh()
  }

  return (
    <Container className="max-w-md py-12">
      <h1 className="font-display text-2xl text-navy mb-6">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          type="text"
          placeholder="ID Number"
          value={idNumber}
          onChange={e => setIdNumber(e.target.value)}
          required
          autoComplete="off"
        />
        <PasswordInput
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
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
