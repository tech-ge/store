'use client'
import { useEffect, useState } from 'react'
import { useDebounce } from './useDebounce'

export interface Suggestion {
  id: string
  title: string
  image: string
  priceUsd: number
  categorySlug: string
}

export function useAutocomplete(query: string) {
  const q = useDebounce(query, 200)
  const [results, setResults] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!q) { setResults([]); return }
    setLoading(true)
    fetch(`/api/products/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setResults(d.results || []) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [q])

  return { results, loading }
}
