'use client'
import { useCurrency } from '@/hooks/useCurrency'

export function Price({ usd, className = '' }: { usd: number; className?: string }) {
  const { currency, symbol, rate } = useCurrency()
  const local = (usd * rate).toLocaleString(undefined, { maximumFractionDigits: 2 })

  if (currency === 'USD') {
    return <span className={className}>${usd.toFixed(2)}</span>
  }

  return (
    <span className={className}>
      <span className="font-bold">${usd.toFixed(2)}</span>
      <span className="text-text-muted text-xs ml-1">≈ {symbol} {local}</span>
    </span>
  )
}
