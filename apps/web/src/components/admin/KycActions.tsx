'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function KycActions({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function act(action: 'approve' | 'reject') {
    setLoading(true)
    await fetch('/api/kyc/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action })
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex gap-3 mt-4">
      <Button disabled={loading} onClick={() => act('approve')}>Activate</Button>
      <Button variant="danger" disabled={loading} onClick={() => act('reject')}>Reject</Button>
    </div>
  )
}
