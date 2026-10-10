'use client'
import { CATEGORY_TREE } from '@/lib/data/categories'

export interface Filters {
  category: string
  scope: 'all' | 'local' | 'global'
  minPrice: string
  maxPrice: string
  sort: 'newest' | 'oldest' | 'priceAsc' | 'priceDesc'
}

export function SearchFilters({
  q, setQ, filters, setFilters, onSubmit
}: {
  q: string
  setQ: (v: string) => void
  filters: Filters
  setFilters: (f: Filters) => void
  onSubmit: () => void
}) {
  function upd<K extends keyof Filters>(k: K, v: Filters[K]) {
    setFilters({ ...filters, [k]: v })
  }

  return (
    <form
      onSubmit={e => { e.preventDefault(); onSubmit() }}
      className="bg-white rounded-2xl border border-surface-border p-4 space-y-3"
    >
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search by product name"
        className="w-full px-4 py-3 rounded-xl border border-surface-border outline-none focus:border-brand text-base"
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
        <select
          value={filters.category}
          onChange={e => upd('category', e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-surface-border bg-white"
        >
          <option value="">All categories</option>
          {CATEGORY_TREE.map(c => (
            <optgroup key={c.slug} label={c.name}>
              <option value={c.slug}>{c.name} (all)</option>
              {c.children?.map(ch => (
                <option key={ch.slug} value={ch.slug}>{ch.name}</option>
              ))}
            </optgroup>
          ))}
        </select>

        <select
          value={filters.scope}
          onChange={e => upd('scope', e.target.value as Filters['scope'])}
          className="px-3 py-2.5 rounded-xl border border-surface-border bg-white"
        >
          <option value="all">All products</option>
          <option value="local">Local (my country)</option>
          <option value="global">Global (imported)</option>
        </select>

        <input
          type="number"
          placeholder="Min price USD"
          value={filters.minPrice}
          onChange={e => upd('minPrice', e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-surface-border"
        />

        <input
          type="number"
          placeholder="Max price USD"
          value={filters.maxPrice}
          onChange={e => upd('maxPrice', e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-surface-border"
        />

        <select
          value={filters.sort}
          onChange={e => upd('sort', e.target.value as Filters['sort'])}
          className="px-3 py-2.5 rounded-xl border border-surface-border bg-white"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="priceAsc">Price: low to high</option>
          <option value="priceDesc">Price: high to low</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold">
          Apply filters
        </button>
      </div>
    </form>
  )
}
