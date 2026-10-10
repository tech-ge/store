'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface StoreOpt { _id: string; countryName: string; currency: string }
interface CatOpt { slug: string; name: string }

async function readJson(res: Response) {
  const t = await res.text()
  try { return JSON.parse(t) } catch { return { error: t.slice(0, 200) } }
}

export default function NewProductPage() {
  const router = useRouter()
  const [stores, setStores] = useState<StoreOpt[]>([])
  const [cats, setCats] = useState<CatOpt[]>([])
  const [form, setForm] = useState({
    title: '', description: '', image: '',
    categorySlug: '', storeId: '', priceUsd: 0, stock: 1, isGlobal: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    Promise.all([
      fetch('/api/stores').then(r => r.json()),
      fetch('/api/categories').then(r => r.json())
    ]).then(([s, c]) => {
      const storeList = (s.stores || []).map((x: any) => ({ _id: x.countryCode, countryName: x.countryName, currency: x.currency }))
      setStores(storeList)
      setCats(c.categories || [])
    })
  }, [])

  function upd(k: string, v: any) { setForm(p => ({ ...p, [k]: v })) }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const token = localStorage.getItem('accessToken')

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        images: [form.image],
        categorySlug: form.categorySlug,
        storeCountry: form.storeId,
        priceUsd: Number(form.priceUsd),
        stock: Number(form.stock),
        isGlobal: form.isGlobal
      })
    })
    const data = await readJson(res)
    setLoading(false)
    if (!res.ok) return setError(data.error || 'Failed')
    router.push('/admin/products')
    router.refresh()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-navy mb-6">Add product to a country store</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input placeholder="Title" value={form.title} onChange={e => upd('title', e.target.value)} required />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={e => upd('description', e.target.value)}
          required
          className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-white outline-none focus:border-brand h-32"
        />
        <Input placeholder="Image URL" value={form.image} onChange={e => upd('image', e.target.value)} required />

        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.categorySlug}
            onChange={e => upd('categorySlug', e.target.value)}
            required
            className="px-3 py-2.5 rounded-xl border border-surface-border bg-white text-sm"
          >
            <option value="">Category</option>
            {cats.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>

          <select
            value={form.storeId}
            onChange={e => upd('storeId', e.target.value)}
            required
            className="px-3 py-2.5 rounded-xl border border-surface-border bg-white text-sm"
          >
            <option value="">Country store</option>
            {stores.map(s => <option key={s._id} value={s._id}>{s.countryName}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input type="number" step="0.01" placeholder="Price (USD)" value={form.priceUsd} onChange={e => upd('priceUsd', e.target.value)} required />
          <Input type="number" placeholder="Stock" value={form.stock} onChange={e => upd('stock', e.target.value)} required />
        </div>

        <label className="flex items-center gap-2 text-sm text-navy">
          <input type="checkbox" checked={form.isGlobal} onChange={e => upd('isGlobal', e.target.checked)} />
          Visible in all country stores
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating…' : 'Create product'}
        </Button>
      </form>
    </div>
  )
}
