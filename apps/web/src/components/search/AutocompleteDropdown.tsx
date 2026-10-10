'use client'
import { Suggestion } from '@/hooks/useAutocomplete'

export function AutocompleteDropdown({
  query, results, loading, onPick, onPickProduct
}: {
  query: string
  results: Suggestion[]
  loading: boolean
  onPick: (term: string) => void
  onPickProduct: (id: string) => void
}) {
  return (
    <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lift border border-surface-border overflow-hidden z-50">
      {loading && <div className="p-3 text-sm text-text-muted">Searching…</div>}
      {!loading && results.length === 0 && query && (
        <button onClick={() => onPick(query)} className="w-full text-left px-4 py-3 hover:bg-surface-muted text-navy">
          Search for "<span className="font-semibold">{query}</span>"
        </button>
      )}
      {results.length > 0 && (
        <ul>
          {results.map(r => (
            <li key={r.id}>
              <button
                onClick={() => onPickProduct(r.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-muted text-left"
              >
                <img src={r.image} alt="" className="w-9 h-9 rounded-lg object-cover bg-slate-100" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-navy truncate">{r.title}</div>
                  <div className="text-xs text-text-muted capitalize">{r.categorySlug}</div>
                </div>
                <div className="text-sm font-semibold text-brand">${r.priceUsd.toFixed(2)}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
