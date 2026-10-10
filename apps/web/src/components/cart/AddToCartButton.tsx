'use client'
import { useCart } from '@/hooks/useCart'

export function AddToCartButton({ product }: { product: Parameters<ReturnType<typeof useCart>['add']>[0] }) {
  const { add } = useCart()
  return (
    <button
      onClick={() => add(product)}
      className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-medium"
    >
      Add to cart
    </button>
  )
}
