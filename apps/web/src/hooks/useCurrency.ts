'use client'
import { useEffect, useState } from 'react'

export interface CurrencyState {
  currency: string
  symbol: string
  rate: number
}

export function useCurrency(): CurrencyState {
  const [info, setInfo] = useState<CurrencyState>({ currency: 'USD', symbol: '$', rate: 1 })

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/currency/rates')
        const data = await res.json()
        if (!cancelled) setInfo({ currency: data.currency, symbol: data.symbol, rate: data.rate })
      } catch { /* ignore */ }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return info
}
