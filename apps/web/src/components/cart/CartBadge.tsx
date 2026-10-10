'use client'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'

export function CartBadge() {
  const { count } = useCart()
  return (
    <Link href="/cart" className="relative text-sm text-navy hover:text-brand">
      Cart
      {count > 0 && (
        <span className="absolute -top-2 -right-3 bg-brand text-white text-xs rounded-full px-1.5 py-0.5">
          {count}
        </span>
      )}
    </Link>
  )
}
