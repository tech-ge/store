'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authFetch, authJson } from '@/lib/auth-fetch'
import { CATEGORY_TREE } from '@/lib/data/categories'

interface StoreOpt { countryCode: string; countryName: string; currency: string }

export default function NewProductPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [stores, setStores] = useState<StoreOpt[]>([])
  const [form, setForm] = useState({
    title: '', description: '',
    categoryMain: '', categorySub: '',
    storeId: '', priceUsd: '', stock: '',
    imageUrl: '', isGlobal: false
  })
  const [imagePreview, setImagePreview] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/stores').then(r => r.json()).then(s => setStores(s.stores || []))
  }, [])

  function upd(k: string, v: any) { setForm(p => ({ ...p, [k]: v })) }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 4 * 1024 * 1024) { setError('Image must be under 4MB'); return }
    const reader = new FileReader()
    reader.onload = () => {
      const url = String(reader.result || '')
      setImagePreview(url)
      setImageDataUrl(url)
      setError('')
    }
    reader.readAsDataURL(f)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.categoryMain) return setError('Pick a category')
    const categorySlug = form.categorySub || form.categoryMain

    let finalImage = ''
    if (mode === 'url') {
      if (!form.imageUrl) return setError('Paste an image URL or switch to upload')
      finalImage = form.imageUrl
    } else {
      if (!imageDataUrl) return setError('Upload an image')
      finalImage = imageDataUrl
    }

    setLoading(true)
    try {
      await authJson('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          images: [finalImage],
          categorySlug,
          storeCountry: form.storeId,
          priceUsd: Number(form.priceUsd),
          stock: Number(form.stock) || 0,
          isGlobal: form.isGlobal
        })
      })
      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const subOptions = CATEGORY_TREE.find(c => c.slug === form.categoryMain)?.children || []

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="font-display text-2xl text-navy">Add product to a country store</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <Input placeholder="Title" value={form.title} onChange={e => upd('title', e.target.value)} required />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={e => upd('description', e.target.value)}
          required
          className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-white outline-none focus:border-brand h-32"
        />

        <div className="bg-white rounded-xl border border-surface-border p-4 space-y-3">
          <div className="flex gap-2 text-sm">
            <button type="button" onClick={() => setMode('upload')}
              className={`px-3 py-1.5 rounded-lg ${mode === 'upload' ? 'bg-brand text-white' : 'bg-surface-muted text-navy'}`}>
              Upload image
            </button>
            <button type="button" onClick={() => setMode('url')}
              className={`px-3 py-1.5 rounded-lg ${mode === 'url' ? 'bg-brand text-white' : 'bg-surface-muted text-navy'}`}>
              Use image URL
            </button>
          </div>

          {mode === 'upload' ? (
            <>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="block w-full text-sm" />
              {imagePreview && (
                <img src={imagePreview} alt="preview" className="w-full max-h-64 object-contain rounded-lg border border-surface-border" />
              )}
            </>
          ) : (
            <>
              <Input placeholder="https://..." value={form.imageUrl} onChange={e => upd('imageUrl', e.target.value)} />
              {form.imageUrl && (
                <img src={form.imageUrl} alt="preview" className="w-full max-h-64 object-contain rounded-lg border border-surface-border" />
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select value={form.categoryMain} onChange={e => { upd('categoryMain', e.target.value); upd('categorySub', '') }} required
            className="px-3 py-2.5 rounded-xl border border-surface-border bg-white text-sm">
            <option value="">Main category</option>
            {CATEGORY_TREE.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>

          <select value={form.categorySub} onChange={e => upd('categorySub', e.target.value)}
            disabled={!form.categoryMain}
            className="px-3 py-2.5 rounded-xl border border-surface-border bg-white text-sm disabled:opacity-50">
            <option value="">Subcategory (optional)</option>
            {subOptions.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select value={form.storeId} onChange={e => upd('storeId', e.target.value)} required
            className="px-3 py-2.5 rounded-xl border border-surface-border bg-white text-sm">
            <option value="">Country store</option>
            {stores.map(s => <option key={s.countryCode} value={s.countryCode}>{s.countryName} ({s.currency})</option>)}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <Input type="number" step="0.01" placeholder="Price USD" value={form.priceUsd} onChange={e => upd('priceUsd', e.target.value)} required />
            <Input type="number" placeholder="Stock" value={form.stock} onChange={e => upd('stock', e.target.value)} required />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-navy">
          <input type="checkbox" checked={form.isGlobal} onChange={e => upd('isGlobal', e.target.checked)} />
          Show in all country stores
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating…' : 'Create product'}
        </Button>
      </form>
    </div>
  )
}
