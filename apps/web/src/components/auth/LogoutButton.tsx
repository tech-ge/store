'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { startSessionKeepalive, stopSessionKeepalive } from '@/lib/session-keepalive'

export function LogoutButton({ className = '' }: { className?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    startSessionKeepalive()
    return stopSessionKeepalive
  }, [])

  async function logout() {
    setLoading(true)
    stopSessionKeepalive()
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } finally {
      localStorage.removeItem('accessToken')
      setLoading(false)
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      aria-label={loading ? 'Logging out' : 'Log out'}
      className={`inline-flex h-10 items-center gap-2 rounded-xl px-2 text-sm text-navy transition hover:bg-surface-muted hover:text-brand disabled:opacity-50 sm:px-3 ${className}`}
    >
      <Icon name="logout" size={17} />
      <span className="hidden sm:inline">{loading ? 'Logging out…' : 'Log out'}</span>
    </button>
  )
}
