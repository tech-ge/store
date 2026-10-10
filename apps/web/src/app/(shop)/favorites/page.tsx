'use client'
import { Container } from '@/components/layout/Container'
import { useFavorites } from '@/hooks/useFavorites'
import Link from 'next/link'

export default function FavoritesPage() {
  const { items } = useFavorites()
  return (
    <Container className="py-8">
      <h1 className="font-display text-2xl text-navy mb-6">Favorites</h1>
      {items.length === 0 && <p className="text-text-muted text-sm">No favorites saved yet.</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {items.map(i => (
          <Link key={i.productId} href={`/products/${i.productId}`} className="bg-white rounded-xl border border-surface-border overflow-hidden">
            <img src={i.image} alt={i.title} className="aspect-square w-full object-cover bg-surface-muted" />
            <div className="p-3">
              <div className="text-sm text-navy line-clamp-2">{i.title}</div>
              <div className="text-brand text-sm font-semibold mt-1">${i.price.toFixed(2)}</div>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  )
}
