'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authJson } from '@/lib/auth-fetch'

export function SellerProductRow(props: {
  id: string
  title: string
  categorySlug: string
  priceUsd: number
  stock: number
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [price, setPrice] = useState(props.priceUsd)
  const [stock, setStock] = useState(props.stock)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function save() {
    setBusy(true); setMsg('')
    try {
      await authJson(`/api/seller/products/${props.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ priceUsd: Number(price), stock: Number(stock) })
      })
      setEditing(false)
      setMsg('Saved')
      router.refresh()
    } catch (e: any) { setMsg(e.message) } finally { setBusy(false) }
  }

  async function del() {
    if (!confirm('Delete this product?')) return
    setBusy(true); setMsg('')
    try {
      await authJson(`/api/seller/products/${props.id}`, { method: 'DELETE' })
      router.refresh()
    } catch (e: any) { setMsg(e.message) } finally { setBusy(false) }
  }

  return (
    <tr className="border-t border-surface-border">
      <td className="px-4 py-2 text-navy">{props.title}</td>
      <td className="px-4 py-2 text-text-muted">{props.categorySlug}</td>
      <td className="px-4 py-2 text-right">
        {editing ? (
          <input type="number" step="0.01" value={price} onChange={e => setPrice(Number(e.target.value))}
            className="w-24 px-2 py-1 rounded-lg border border-surface-border text-sm text-right" />
        ) : `$${props.priceUsd.toFixed(2)}`}
      </td>
      <td className="px-4 py-2 text-right">
        {editing ? (
          <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))}
            className="w-20 px-2 py-1 rounded-lg border border-surface-border text-sm text-right" />
        ) : props.stock}
      </td>
      <td className="px-4 py-2 text-right">
        {editing ? (
          <div className="flex gap-1 justify-end">
            <button onClick={save} disabled={busy} className="text-xs px-2 py-1 rounded-lg bg-brand text-white disabled:opacity-50">Save</button>
            <button onClick={() => setEditing(false)} className="text-xs px-2 py-1 rounded-lg bg-surface-muted text-navy">Cancel</button>
          </div>
        ) : (
          <div className="flex gap-1 justify-end">
            <button onClick={() => setEditing(true)} className="text-xs px-2 py-1 rounded-lg bg-surface-muted text-navy">Edit</button>
            <button onClick={del} disabled={busy} className="text-xs px-2 py-1 rounded-lg bg-red-600 text-white disabled:opacity-50">Delete</button>
          </div>
        )}
        {msg && <div className="text-xs text-text-muted mt-1">{msg}</div>}
      </td>
    </tr>
  )
}
