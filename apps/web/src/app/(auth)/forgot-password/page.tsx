'use client'
import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [msg, setMsg] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, idNumber })
    })
    setMsg(res.ok ? 'If details match, a reset link has been sent.' : 'Something went wrong.')
  }

  return (
    <Container className="max-w-md py-12">
      <h1 className="font-display text-2xl text-navy mb-6">Forgot password</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <Input placeholder="ID number" value={idNumber} onChange={e => setIdNumber(e.target.value)} required />
        <Button type="submit" className="w-full">Send reset link</Button>
      </form>
      {msg && <p className="text-sm text-text-muted mt-4">{msg}</p>}
    </Container>
  )
}
