'use client'
import { useCart } from '@/hooks/useCart'

export function AddToCartButton({ product }: { product: Parameters<ReturnType<typeof useCart>['add']>[0] }) {
  const { add } = useCart()
  return (
    <button
      onClick={() => add(product)}
      className="px-8 py-3.5 rounded-xl bg-brand text-white text-base font-semibold hover:bg-brand-500 transition"
    >
      Add to cart
    </button>
  )
}
