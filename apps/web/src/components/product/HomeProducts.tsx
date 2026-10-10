'use client'
import { useEffect, useState } from 'react'
import { ProductCard } from './ProductCard'

interface ApiProduct {
  id: string
  title: string
  image: string
  displayPriceUsd: number
  storeId: string
  sellerId: string | null
  categorySlug: string
}

export function HomeProducts() {
  const [items, setItems] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let country = 'US'
    const m = document.cookie.match(/country=([A-Z]{2})/)
    if (m) country = m[1]

    fetch(`/api/products?country=${country}&limit=20`)
      .then(r => r.json())
      .then(d => setItems(d.products || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-text-muted py-8">Loading products…</div>
  if (!items.length) return <div className="text-text-muted py-8">No products yet.</div>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
    </div>
  )
}
