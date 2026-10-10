'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', countryCode: 'US',
    password: '', idNumber: '', idPhotoUrl: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function upd(k: string, v: string) { setForm(prev => ({ ...prev, [k]: v })) }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error || 'Registration failed')
    router.push('/login')
  }

  return (
    <Container className="max-w-md py-12">
      <h1 className="font-display text-2xl text-navy mb-6">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input placeholder="Full name" value={form.fullName} onChange={e => upd('fullName', e.target.value)} required />
        <Input type="email" placeholder="Email" value={form.email} onChange={e => upd('email', e.target.value)} required />
        <Input placeholder="Phone" value={form.phone} onChange={e => upd('phone', e.target.value)} required />
        <Input placeholder="Country code (e.g. KE)" value={form.countryCode} onChange={e => upd('countryCode', e.target.value.toUpperCase())} required />
        <Input type="password" placeholder="Password" value={form.password} onChange={e => upd('password', e.target.value)} required />
        <Input placeholder="ID number" value={form.idNumber} onChange={e => upd('idNumber', e.target.value)} required />
        <Input placeholder="ID photo URL" value={form.idPhotoUrl} onChange={e => upd('idPhotoUrl', e.target.value)} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating…' : 'Create account'}
        </Button>
      </form>
    </Container>
  )
}
