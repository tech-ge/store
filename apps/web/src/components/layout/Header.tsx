'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/brand/Logo'
import { SearchBar } from '@/components/search/SearchBar'
import { useCart } from '@/hooks/useCart'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { Icon } from '@/components/ui/Icon'
import { authFetch } from '@/lib/auth-fetch'

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
    authFetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => setMe(null))
      .finally(() => setLoading(false))
  }, [])

  const isSeller = me?.role === 'seller'
  const isAdmin = me?.role === 'admin'

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-white/90 shadow-[0_4px_24px_rgba(11,31,58,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[68px] max-w-7xl items-center gap-3 px-4 sm:gap-5">
        <Logo compact />
        <div className="hidden min-w-0 flex-1 md:block">
          <SearchBar />
        </div>
        <nav aria-label="Main navigation" className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link href="/favorites" aria-label="Favorites" title="Favorites" className="hidden h-10 w-10 items-center justify-center rounded-xl text-navy transition hover:bg-surface-muted hover:text-brand sm:inline-flex">
            <Icon name="heart" />
            <span className="sr-only">Favorites</span>
          </Link>

          <Link href="/cart" aria-label={`Cart${count > 0 ? `, ${count} items` : ''}`} className="relative inline-flex h-10 items-center gap-2 rounded-xl px-2.5 text-sm font-medium text-navy transition hover:bg-surface-muted hover:text-brand sm:px-3">
            <Icon name="cart" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white ring-2 ring-white">{count}</span>
            )}
          </Link>

          {loading ? null : me ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="rounded-xl px-2 py-2 text-sm font-medium text-navy hover:text-brand">Admin</Link>
              )}
              {isSeller ? (
                <Link href="/seller" className="inline-flex h-10 items-center gap-2 rounded-xl bg-navy px-3 text-sm font-semibold text-white transition hover:bg-navy-800">
                  <Icon name="store" size={18} />
                  <span className="hidden lg:inline">Seller studio</span>
                  <span className="sr-only lg:hidden">Seller studio</span>
                </Link>
              ) : (
                <Link href="/profile" aria-label="My account" title={me.fullName} className="inline-flex h-10 items-center gap-2 rounded-xl px-2 text-sm font-medium text-navy transition hover:bg-surface-muted hover:text-brand sm:px-3">
                  <Icon name="user" />
                  <span className="hidden max-w-[110px] truncate sm:inline">{me.fullName}</span>
                  <span className="sr-only sm:hidden">My account</span>
                </Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" aria-label="Log in" className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-navy transition hover:bg-surface-muted hover:text-brand sm:w-auto sm:px-3">
                <Icon name="user" />
                <span className="sr-only sm:not-sr-only sm:ml-2 sm:text-sm sm:font-medium">Log in</span>
              </Link>
              <Link href="/register" className="inline-flex h-10 items-center rounded-xl bg-brand px-3 text-sm font-semibold text-white transition hover:bg-brand-500 sm:px-4">
                <span className="hidden sm:inline">Create account</span>
                <span className="sm:hidden">Join</span>
              </Link>
            </>
          )}
        </nav>
      </div>
      <div className="border-t border-surface-border/70 px-4 py-2.5 md:hidden">
        <SearchBar />
      </div>
    </header>
  )
}
