'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Target = 'user' | 'device' | 'ip'
type Action = 'suspend' | 'reactivate' | 'block' | 'delete' | 'approve_withdrawal'

async function callAction(body: any) {
  const token = localStorage.getItem('accessToken')
  const res = await fetch('/api/admin/actions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  })
  const text = await res.text()
  try { return JSON.parse(text) } catch { return { error: text.slice(0, 200) } }
}

export function UserActions({ userId, status }: { userId: string; status: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  async function run(action: Action, confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return
    setBusy(action)
    await callAction({ target: 'user', action, userId })
    setBusy(null)
    router.refresh()
  }

  return (
    <div className="flex gap-1 justify-end flex-wrap">
      <button
        onClick={() => run('suspend', 'Suspend this user?')}
        disabled={busy !== null || status === 'suspended'}
        className="text-xs px-2 py-1 rounded-lg bg-amber-500 text-white disabled:opacity-40"
      >
        Suspend
      </button>
      <button
        onClick={() => run('block', 'Block this user?')}
        disabled={busy !== null || status === 'blocked'}
        className="text-xs px-2 py-1 rounded-lg bg-red-600 text-white disabled:opacity-40"
      >
        Block
      </button>
      <button
        onClick={() => run('reactivate')}
        disabled={busy !== null || status === 'active'}
        className="text-xs px-2 py-1 rounded-lg bg-emerald-600 text-white disabled:opacity-40"
      >
        Activate
      </button>
      <button
        onClick={() => run('delete', 'Delete this user permanently?')}
        disabled={busy !== null}
        className="text-xs px-2 py-1 rounded-lg bg-gray-800 text-white disabled:opacity-40"
      >
        Delete
      </button>
    </div>
  )
}

export function DeviceActions({ fingerprint, isBlocked }: { fingerprint: string; isBlocked: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function run(action: 'block' | 'reactivate' | 'delete') {
    if (action === 'delete' && !confirm('Delete this device record?')) return
    if (action === 'block' && !confirm('Block this device?')) return
    setBusy(true)
    await callAction({ target: 'device', action, fingerprint })
    setBusy(false)
    router.refresh()
  }

  return (
    <div className="flex gap-1 justify-end">
      {!isBlocked ? (
        <button onClick={() => run('block')} disabled={busy} className="text-xs px-2 py-1 rounded-lg bg-red-600 text-white disabled:opacity-40">Block</button>
      ) : (
        <button onClick={() => run('reactivate')} disabled={busy} className="text-xs px-2 py-1 rounded-lg bg-emerald-600 text-white disabled:opacity-40">Unblock</button>
      )}
      <button onClick={() => run('delete')} disabled={busy} className="text-xs px-2 py-1 rounded-lg bg-gray-800 text-white disabled:opacity-40">Delete</button>
    </div>
  )
}

export function IpActions({ ip }: { ip: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function run(action: 'block' | 'reactivate') {
    if (action === 'block' && !confirm(`Block all devices on ${ip}?`)) return
    setBusy(true)
    await callAction({ target: 'ip', action, ip })
    setBusy(false)
    router.refresh()
  }

  return (
    <div className="flex gap-1 justify-end">
      <button onClick={() => run('block')} disabled={busy} className="text-xs px-2 py-1 rounded-lg bg-red-600 text-white disabled:opacity-40">Block IP</button>
      <button onClick={() => run('reactivate')} disabled={busy} className="text-xs px-2 py-1 rounded-lg bg-emerald-600 text-white disabled:opacity-40">Unblock</button>
    </div>
  )
}

export function WithdrawButton({ userId, maxUsd }: { userId: string; maxUsd: number }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [amount, setAmount] = useState('')

  async function submit() {
    const n = Number(amount)
    if (!n || n <= 0) return alert('Enter a positive amount')
    if (n > maxUsd) return alert('Amount exceeds balance')
    if (!confirm(`Approve withdrawal of $${n.toFixed(2)}?`)) return
    setBusy(true)
    await callAction({ target: 'user', action: 'approve_withdrawal', userId, amountUsd: n })
    setBusy(false)
    setAmount('')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        step="0.01"
        placeholder="USD"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="w-24 px-2 py-1 rounded-lg border border-surface-border text-sm"
      />
      <button
        onClick={submit}
        disabled={busy}
        className="text-xs px-2 py-1 rounded-lg bg-brand text-white disabled:opacity-40"
      >
        {busy ? '…' : 'Approve withdrawal'}
      </button>
    </div>
  )
}
