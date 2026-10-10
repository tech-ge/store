import { CURRENCY_SYMBOLS } from './codes'

export function formatMoney(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency
  const n = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return `${symbol} ${n}`
}

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`
}
