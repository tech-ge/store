'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authJson } from '@/lib/auth-fetch'

interface Category { slug: string; name: string }
interface StoreOpt { countryCode: string; countryName: string }

export default function SellerNewProduct() {
  const router = useRouter()
  const [cats, setCats] = useState<Category[]>([])
  const [stores, setStores] = useState<StoreOpt[]>([])
  const [form, setForm] = useState({
    title: '', description: '', image: '', categorySlug: '',
    storeCountry: '', priceUsd: 0, stock: 1
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/stores').then(r => r.json())
    ]).then(([c, s]) => {
      setCats(c.categories || [])
      setStores(s.stores || [])
    })
  }, [])

  function upd(k: string, v: any) { setForm(p => ({ ...p, [k]: v })) }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authJson('/api/seller/products', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          images: [form.image],
          categorySlug: form.categorySlug,
          storeCountry: form.storeCountry,
          priceUsd: Number(form.priceUsd),
          stock: Number(form.stock)
        })
      })
      router.push('/seller/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-navy mb-2">Add a product</h1>
      <p className="text-sm text-text-muted mb-6">5% of every sale goes to Door Delivery.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input placeholder="Title" value={form.title} onChange={e => upd('title', e.target.value)} required />
        <textarea placeholder="Description" value={form.description} onChange={e => upd('description', e.target.value)} required
          className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-white outline-none focus:border-brand h-32" />
        <Input placeholder="Image URL" value={form.image} onChange={e => upd('image', e.target.value)} required />

        <div className="grid grid-cols-2 gap-3">
          <select value={form.categorySlug} onChange={e => upd('categorySlug', e.target.value)} required
            className="px-3 py-2.5 rounded-xl border border-surface-border bg-white text-sm">
            <option value="">Category</option>
            {cats.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <select value={form.storeCountry} onChange={e => upd('storeCountry', e.target.value)} required
            className="px-3 py-2.5 rounded-xl border border-surface-border bg-white text-sm">
            <option value="">Country store</option>
            {stores.map(s => <option key={s.countryCode} value={s.countryCode}>{s.countryName}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input type="number" step="0.01" placeholder="Price (USD)" value={form.priceUsd} onChange={e => upd('priceUsd', e.target.value)} required />
          <Input type="number" placeholder="Stock" value={form.stock} onChange={e => upd('stock', e.target.value)} required />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Creating…' : 'Create product'}</Button>
      </form>
    </div>
  )
}
