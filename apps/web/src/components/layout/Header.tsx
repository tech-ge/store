'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/brand/Logo'
import { SearchBar } from '@/components/search/SearchBar'
import { useCart } from '@/hooks/useCart'
import { LogoutButton } from '@/components/auth/LogoutButton'

interface Me {
  id: string
  fullName: string
  role: string
  status: string
}

export function Header() {
  const { count } = useCart()
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!token) { setLoading(false); return }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include'
    })
      .then(r => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => setMe(null))
      .finally(() => setLoading(false))
  }, [])

  const isSeller = me?.role === 'seller'
  const isAdmin = me?.role === 'admin'

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
              <span className="absolute -top-2 -right-3 bg-brand text-white text-xs rounded-full px-1.5 py-0.5">{count}</span>
            )}
          </Link>

          {loading ? null : me ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="text-sm text-navy hover:text-brand">Admin</Link>
              )}
              {isSeller ? (
                <Link href="/seller" className="text-sm px-3 py-1.5 rounded-lg bg-navy text-white">
                  Seller dashboard
                </Link>
              ) : (
                <Link href="/profile" className="text-sm text-navy hover:text-brand max-w-[140px] truncate">
                  {me.fullName}
                </Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-navy hover:text-brand">Login</Link>
              <Link href="/register" className="text-sm bg-brand text-white px-3 py-1.5 rounded-lg hover:bg-brand-500">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
      <div className="md:hidden px-4 pb-3">
        <SearchBar />
      </div>
    </header>
  )
}
