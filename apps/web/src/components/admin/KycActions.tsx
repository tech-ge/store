'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { authFetch } from '@/lib/auth-fetch'

export function KycActions({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function act(action: 'approve' | 'reject') {
    setLoading(true)
    setError('')
    const res = await authFetch('/api/kyc/admin/approve', {
      method: 'POST',
      body: JSON.stringify({ userId, action })
    })
    setLoading(false)
    if (!res.ok) {
      const text = await res.text()
      let data: any
      try { data = JSON.parse(text) } catch { data = { error: text.slice(0, 200) } }
      setError(data.error || 'Failed')
      alert(data.error || 'Failed')
      return
    }
    router.refresh()
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex gap-3">
        <Button disabled={loading} onClick={() => act('approve')}>Activate</Button>
        <Button variant="danger" disabled={loading} onClick={() => act('reject')}>Reject</Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
