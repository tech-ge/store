'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authJson } from '@/lib/auth-fetch'

export function StoreRow(props: {
  countryCode: string
  countryName: string
  currency: string
  currencySymbol: string
  productsCount: number
  shippingBaseRateUsd: number
  isActive: boolean
}) {
  const router = useRouter()
  const [shipping, setShipping] = useState(props.shippingBaseRateUsd)
  const [active, setActive] = useState(props.isActive)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function save() {
    setBusy(true); setMsg('')
    try {
      await authJson(`/api/admin/stores/${props.countryCode}`, {
        method: 'PATCH',
        body: JSON.stringify({ shippingBaseRateUsd: Number(shipping), isActive: active })
      })
      setMsg('Saved')
      router.refresh()
    } catch (e: any) {
      setMsg(e.message || 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <tr className="border-t border-surface-border">
      <td className="px-4 py-2 text-navy">{props.countryName} <span className="text-text-muted">({props.countryCode})</span></td>
      <td className="px-4 py-2">{props.currency} {props.currencySymbol}</td>
      <td className="px-4 py-2 text-right">{props.productsCount}</td>
      <td className="px-4 py-2 text-right">
        <input type="number" step="0.01" value={shipping} onChange={e => setShipping(Number(e.target.value))}
          className="w-24 px-2 py-1 rounded-lg border border-surface-border text-sm text-right" />
      </td>
      <td className="px-4 py-2">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
          {active ? 'active' : 'inactive'}
        </label>
      </td>
      <td className="px-4 py-2 text-right">
        <button onClick={save} disabled={busy} className="text-xs px-2 py-1 rounded-lg bg-brand text-white disabled:opacity-40">
          {busy ? '…' : 'Save'}
        </button>
        {msg && <div className="text-xs text-text-muted mt-1">{msg}</div>}
      </td>
    </tr>
  )
}
