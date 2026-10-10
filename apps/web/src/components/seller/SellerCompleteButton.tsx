'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authJson } from '@/lib/auth-fetch'

export function SellerCompleteButton({ orderId, allCompleted }: { orderId: string; allCompleted: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function complete() {
    if (!confirm('Mark your items on this order as completed?')) return
    setBusy(true); setMsg('')
    try {
      await authJson(`/api/seller/orders/${orderId}/complete`, { method: 'POST' })
      setMsg('Marked completed')
      router.refresh()
    } catch (e: any) { setMsg(e.message) } finally { setBusy(false) }
  }

  if (allCompleted) {
    return <p className="text-sm text-emerald-600">All your items on this order are completed.</p>
  }

  return (
    <div className="space-y-2">
      <button onClick={complete} disabled={busy}
        className="w-full py-3 rounded-xl bg-brand text-white text-sm font-semibold disabled:opacity-50">
        {busy ? 'Completing…' : 'Complete my items'}
      </button>
      {msg && <p className="text-sm text-text-muted">{msg}</p>}
    </div>
  )
}
