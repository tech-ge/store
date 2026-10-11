'use client'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { FavoriteButton } from './FavoriteButton'
import { Price } from '@/components/price/Price'
import { Icon } from '@/components/ui/Icon'

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
      className="group block bg-white rounded-2xl border border-surface-border hover:shadow-lift transition overflow-hidden"
    >
      <div className="relative aspect-square bg-surface-muted">
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-300"
          loading="lazy"
        />
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

      <div className="p-4">
        <h3 className="text-base font-medium text-navy line-clamp-2 min-h-[3rem]">{product.title}</h3>
        <div className="mt-3 flex items-center justify-between gap-3">
          <Price usd={product.priceUsd} className="text-lg" />
          <button
            onClick={addToCart}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 sm:px-4"
          >
            <Icon name="cart" size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </Link>
  )
}
