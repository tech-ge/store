'use client'

let timer: ReturnType<typeof setInterval> | null = null

export function startSessionKeepalive() {
  if (typeof window === 'undefined') return
  if (timer) return

  const refresh = async () => {
    if (!localStorage.getItem('accessToken')) return
    const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
    if (!res.ok) return
    const data = await res.json().catch(() => null)
    if (data?.accessToken) localStorage.setItem('accessToken', data.accessToken)
  }

  // refresh now, then every 10 min
  refresh()
  timer = setInterval(refresh, 10 * 60 * 1000)
}

export function stopSessionKeepalive() {
  if (timer) { clearInterval(timer); timer = null }
}
