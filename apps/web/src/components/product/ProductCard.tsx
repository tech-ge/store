'use client'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { FavoriteButton } from './FavoriteButton'
import { Price } from '@/components/price/Price'

export interface ProductCardData {
  id: string
  title: string
  image: string
  priceUsd: number
  storeId: string
  sellerId?: string | null
  categorySlug?: string
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const { add } = useCart()

  async function addToCart(e: React.MouseEvent) {
    e.preventDefault()
    await add({
      id: product.id,
      productId: product.id,
      title: product.title,
      image: product.image,
      price: product.priceUsd,
      currency: 'USD',
      qty: 1,
      storeId: product.storeId,
      sellerId: product.sellerId || undefined
    })
  }

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-white rounded-xl border border-surface-border hover:shadow-lift transition overflow-hidden"
    >
      <div className="relative aspect-square bg-surface-muted">
        <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition" loading="lazy" />
        <div className="absolute top-3 right-3">
          <FavoriteButton product={{
            productId: product.id,
            title: product.title,
            image: product.image,
            price: product.priceUsd,
            currency: 'USD'
          }} />
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-navy line-clamp-2 min-h-[2.5rem]">{product.title}</h3>
        <div className="mt-2 flex items-center justify-between">
          <Price usd={product.priceUsd} className="text-sm" />
          <button onClick={addToCart} className="px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-medium">Add</button>
        </div>
      </div>
    </Link>
  )
}
