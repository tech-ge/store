'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'

async function readJson(res: Response) {
  const text = await res.text()
  try { return JSON.parse(text) } catch { return { error: text.slice(0, 200) || res.statusText } }
}

function ResetForm() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: pw })
    })
    const data = await readJson(res)
    setMsg(res.ok ? 'Password reset. You can now log in.' : (data.error || 'Reset failed.'))
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <PasswordInput
        placeholder="New password"
        value={pw}
        onChange={e => setPw(e.target.value)}
        minLength={8}
        required
      />
      <Button type="submit" className="w-full">Reset</Button>
      {msg && <p className="text-sm text-text-muted mt-2">{msg}</p>}
    </form>
  )
}

export default function ResetPage() {
  return (
    <Container className="max-w-md py-12">
      <h1 className="font-display text-2xl text-navy mb-6">Reset password</h1>
      <Suspense fallback={<p className="text-sm text-text-muted">Loading…</p>}>
        <ResetForm />
      </Suspense>
    </Container>
  )
}
