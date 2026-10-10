'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authFetch } from '@/lib/auth-fetch'

type Result = { ok: boolean; error?: string; effect?: string }

async function callAction(body: any): Promise<Result> {
  const res = await authFetch('/api/admin/actions', {
    method: 'POST',
    body: JSON.stringify(body)
  })
  const text = await res.text()
  let data: any
  try { data = JSON.parse(text) } catch { data = { ok: false, error: text.slice(0, 200) || 'Unexpected response' } }
  return data
}

export function UserActions({ userId, status }: { userId: string; status: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  async function run(action: string, confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return
    setBusy(action); setMsg('')
    const r = await callAction({ target: 'user', action, userId })
    setBusy(null)
    if (!r.ok) { setMsg(r.error || 'Failed'); return }
    setMsg(r.effect || 'Done')
    router.refresh()
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-1 flex-wrap justify-end">
        <button onClick={() => run('suspend', 'Suspend this user?')} disabled={busy !== null || status === 'suspended'}
          className="text-xs px-2 py-1 rounded-lg bg-amber-500 text-white disabled:opacity-40">
          {busy === 'suspend' ? '…' : 'Suspend'}
        </button>
        <button onClick={() => run('block', 'Block this user?')} disabled={busy !== null || status === 'blocked'}
          className="text-xs px-2 py-1 rounded-lg bg-red-600 text-white disabled:opacity-40">
          {busy === 'block' ? '…' : 'Block'}
        </button>
        <button onClick={() => run('reactivate')} disabled={busy !== null || status === 'active'}
          className="text-xs px-2 py-1 rounded-lg bg-emerald-600 text-white disabled:opacity-40">
          {busy === 'reactivate' ? '…' : 'Activate'}
        </button>
        <button onClick={() => run('delete', 'Delete this user permanently?')} disabled={busy !== null}
          className="text-xs px-2 py-1 rounded-lg bg-gray-800 text-white disabled:opacity-40">
          {busy === 'delete' ? '…' : 'Delete'}
        </button>
      </div>
      {msg && <p className="text-xs text-text-muted">{msg}</p>}
    </div>
  )
}

export function DeviceActions({ fingerprint, isBlocked }: { fingerprint: string; isBlocked: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function run(action: 'block' | 'reactivate' | 'delete') {
    if (action === 'delete' && !confirm('Delete this device record?')) return
    if (action === 'block' && !confirm('Block this device?')) return
    setBusy(true); setMsg('')
    const r = await callAction({ target: 'device', action, fingerprint })
    setBusy(false)
    if (!r.ok) { setMsg(r.error || 'Failed'); return }
    setMsg(r.effect || 'Done')
    router.refresh()
  }

  return (
    <div className="space-y-1 text-right">
      <div className="flex gap-1 justify-end">
        {!isBlocked ? (
          <button onClick={() => run('block')} disabled={busy} className="text-xs px-2 py-1 rounded-lg bg-red-600 text-white disabled:opacity-40">Block</button>
        ) : (
          <button onClick={() => run('reactivate')} disabled={busy} className="text-xs px-2 py-1 rounded-lg bg-emerald-600 text-white disabled:opacity-40">Unblock</button>
        )}
        <button onClick={() => run('delete')} disabled={busy} className="text-xs px-2 py-1 rounded-lg bg-gray-800 text-white disabled:opacity-40">Delete</button>
      </div>
      {msg && <p className="text-xs text-text-muted">{msg}</p>}
    </div>
  )
}

export function IpActions({ ip }: { ip: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function run(action: 'block' | 'reactivate') {
    if (action === 'block' && !confirm(`Block all devices on ${ip}?`)) return
    setBusy(true); setMsg('')
    const r = await callAction({ target: 'ip', action, ip })
    setBusy(false)
    if (!r.ok) { setMsg(r.error || 'Failed'); return }
    setMsg(r.effect || 'Done')
    router.refresh()
  }

  return (
    <div className="space-y-1 text-right">
      <div className="flex gap-1 justify-end">
        <button onClick={() => run('block')} disabled={busy} className="text-xs px-2 py-1 rounded-lg bg-red-600 text-white disabled:opacity-40">Block IP</button>
        <button onClick={() => run('reactivate')} disabled={busy} className="text-xs px-2 py-1 rounded-lg bg-emerald-600 text-white disabled:opacity-40">Unblock</button>
      </div>
      {msg && <p className="text-xs text-text-muted">{msg}</p>}
    </div>
  )
}

export function WithdrawButton({ userId, maxUsd }: { userId: string; maxUsd: number }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [amount, setAmount] = useState('')
  const [msg, setMsg] = useState('')

  async function submit() {
    const n = Number(amount)
    if (!n || n <= 0) return setMsg('Enter a positive amount')
    if (n > maxUsd) return setMsg('Amount exceeds balance')
    if (!confirm(`Approve withdrawal of $${n.toFixed(2)}?`)) return
    setBusy(true); setMsg('')
    const r = await callAction({ target: 'user', action: 'approve_withdrawal', userId, amountUsd: n })
    setBusy(false)
    if (!r.ok) { setMsg(r.error || 'Failed'); return }
    setMsg(r.effect || 'Done')
    setAmount('')
    router.refresh()
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <input type="number" step="0.01" placeholder="USD" value={amount} onChange={e => setAmount(e.target.value)}
          className="w-24 px-2 py-1 rounded-lg border border-surface-border text-sm" />
        <button onClick={submit} disabled={busy}
          className="text-xs px-2 py-1 rounded-lg bg-brand text-white disabled:opacity-40">
          {busy ? '…' : 'Approve withdrawal'}
        </button>
      </div>
      {msg && <p className="text-xs text-text-muted">{msg}</p>}
    </div>
  )
}
