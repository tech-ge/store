'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LogoutButton({ className = '' }: { className?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function logout() {
    setLoading(true)
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    localStorage.removeItem('accessToken')
    setLoading(false)
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className={`text-sm text-navy hover:text-brand disabled:opacity-50 ${className}`}
    >
      {loading ? 'Logging out…' : 'Logout'}
    </button>
  )
}
