'use client'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { SearchFilters, Filters } from '@/components/search/SearchFilters'
import { ProductCard } from '@/components/product/ProductCard'

interface ApiProduct {
  id: string
  title: string
  image: string
  priceUsd: number
  displayPriceUsd: number
  categorySlug: string
  storeId: string
  sellerId: string | null
  isGlobal: boolean
  createdAt: string
}

export default function SearchPage() {
  const params = useSearchParams()
  const initialQ = params.get('q') || ''
  const [q, setQ] = useState(initialQ)
  const [filters, setFilters] = useState<Filters>({
    category: '',
    scope: 'all',
    minPrice: '',
    maxPrice: '',
    sort: 'newest'
  })
  const [country, setCountry] = useState('')
  const [items, setItems] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [markup, setMarkup] = useState(0)

  useEffect(() => {
    // read country from cookie set by middleware or fallback
    const m = document.cookie.match(/country=([A-Z]{2})/)
    setCountry(m?.[1] || 'US')
  }, [])

  const query = useMemo(() => {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (filters.category) p.set('category', filters.category)
    if (filters.scope) p.set('scope', filters.scope)
    if (filters.minPrice) p.set('minPrice', filters.minPrice)
    if (filters.maxPrice) p.set('maxPrice', filters.maxPrice)
    if (filters.sort) p.set('sort', filters.sort)
    if (country) p.set('country', country)
    p.set('limit', '60')
    return p.toString()
  }, [q, filters, country])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/products?${query}`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return
        setItems(d.products || [])
        setMarkup(d.importMarkupPercent || 0)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [query])

  return (
    <Container className="py-10">
      <h1 className="font-display text-3xl text-navy mb-2">Search</h1>
      <p className="text-sm text-text-muted mb-6">
        Showing {items.length} result{items.length === 1 ? '' : 's'} for{' '}
        <span className="text-navy font-medium">{q || 'everything'}</span>
        {country && <> · country <span className="text-navy font-medium">{country}</span></>}
        {markup > 0 && <> · import markup <span className="text-navy font-medium">{markup}%</span></>}
      </p>

      <SearchFilters
        q={q} setQ={setQ}
        filters={filters} setFilters={setFilters}
        onSubmit={() => setLoading(true)}
      />

      {loading ? (
        <div className="text-text-muted py-10">Searching…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-6">
          {items.map(p => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                title: p.title,
                image: p.image,
                priceUsd: p.displayPriceUsd,
                storeId: p.storeId,
                sellerId: p.sellerId,
                categorySlug: p.categorySlug
              }}
            />
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-text-muted py-16 text-center">No products found.</div>
          )}
        </div>
      )}
    </Container>
  )
}
