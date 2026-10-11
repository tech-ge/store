'use client'
import { useEffect, useState } from 'react'
import { useFavorites } from '@/hooks/useFavorites'

export function FavoriteButton({
  product
}: {
  product: { productId: string; title: string; image: string; price: number; currency: string }
}) {
  const { isFavorite, toggle } = useFavorites()
  const [on, setOn] = useState(false)

  useEffect(() => { setOn(isFavorite(product.productId)) }, [isFavorite, product.productId])

  async function handle(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    const next = await toggle({
      id: product.productId,
      productId: product.productId,
      title: product.title,
      image: product.image,
      price: product.price,
      currency: product.currency
    })
    setOn(next)
  }

  return (
    <button
      onClick={handle}
      aria-label={on ? 'Remove from favorites' : 'Save to favorites'}
      className="rounded-full bg-white/95 p-2.5 shadow-card backdrop-blur transition hover:scale-105"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5"
        fill={on ? '#E66A1A' : 'none'}
        stroke={on ? '#E66A1A' : '#0A1B33'}
        strokeWidth="2">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
    </button>
  )
}
