'use client'
import { Logo } from '@/components/brand/Logo'
import { SearchBar } from '@/components/search/SearchBar'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'

export function Header() {
  const { count } = useCart()
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Logo />
        <div className="flex-1 hidden md:block">
          <SearchBar />
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/favorites" className="text-sm text-navy hover:text-brand">Favorites</Link>
          <Link href="/cart" className="relative text-sm text-navy hover:text-brand">
            Cart
            {count > 0 && (
              <span className="absolute -top-2 -right-3 bg-brand text-white text-xs rounded-full px-1.5 py-0.5">
                {count}
              </span>
            )}
          </Link>
          <Link href="/login" className="text-sm text-navy hover:text-brand">Login</Link>
        </nav>
      </div>
      <div className="md:hidden px-4 pb-3">
        <SearchBar />
      </div>
    </header>
  )
}
