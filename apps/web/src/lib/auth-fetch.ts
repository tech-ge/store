'use client'

let refreshing: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshing) {
    refreshing = fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
      .then(async r => {
        if (!r.ok) return null
        const data = await r.json().catch(() => ({}))
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken)
          return data.accessToken as string
        }
        return null
      })
      .catch(() => null)
      .finally(() => { refreshing = null })
  }
  return refreshing
}

export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  const headers = new Headers(init.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  let res = await fetch(input, { ...init, headers, credentials: 'include' })

  if (res.status === 401) {
    const fresh = await refreshAccessToken()
    if (fresh) {
      headers.set('Authorization', `Bearer ${fresh}`)
      res = await fetch(input, { ...init, headers, credentials: 'include' })
    } else {
      localStorage.removeItem('accessToken')
    }
  }

  return res
}

export async function authJson<T = any>(input: string, init: RequestInit = {}): Promise<T> {
  const res = await authFetch(input, init)
  const text = await res.text()
  let data: any
  try { data = JSON.parse(text) } catch { data = { error: text.slice(0, 200) || res.statusText } }
  if (!res.ok) throw Object.assign(new Error(data.error || res.statusText), { status: res.status })
  return data
}
