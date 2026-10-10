'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAutocomplete } from '@/hooks/useAutocomplete'
import { AutocompleteDropdown } from './AutocompleteDropdown'
import { RecentStore } from '@/lib/db/recent.store'

export function SearchBar() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { results, loading } = useAutocomplete(q)
  const router = useRouter()

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function submit(term: string) {
    if (!term.trim()) return
    await RecentStore.push(term)
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(term)}`)
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      <form onSubmit={(e) => { e.preventDefault(); submit(q) }}>
        <div className="flex items-center bg-surface-muted rounded-xl border border-surface-border focus-within:border-brand">
          <svg className="w-5 h-5 ml-3 text-text-muted" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder="Search products, brands, categories"
            className="flex-1 px-3 py-2.5 outline-none bg-transparent text-navy placeholder:text-text-muted"
          />
          <button type="submit" className="mr-1.5 px-3 py-1.5 rounded-lg bg-brand text-white text-sm font-medium">Search</button>
        </div>
      </form>

      {open && (q || results.length > 0) && (
        <AutocompleteDropdown
          query={q}
          results={results}
          loading={loading}
          onPick={(t) => submit(t)}
          onPickProduct={(id) => { setOpen(false); router.push(`/products/${id}`) }}
        />
      )}
    </div>
  )
}
