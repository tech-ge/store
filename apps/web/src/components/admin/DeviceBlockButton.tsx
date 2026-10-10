'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeviceBlockButton({ fingerprint }: { fingerprint: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function block() {
    if (!confirm('Block this device?')) return
    setLoading(true)
    const token = localStorage.getItem('accessToken')
    await fetch('/api/admin/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ deviceFingerprint: fingerprint, reason: 'admin block' })
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={block}
      disabled={loading}
      className="text-xs px-2 py-1 rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
    >
      {loading ? '…' : 'Block'}
    </button>
  )
}
