import { CURRENCY_SYMBOLS } from '@dd/money/src/codes'

export function formatMoney(amount: number, currency: string) {
  const symbol = CURRENCY_SYMBOLS[currency] || currency
  return `${symbol} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatUsd(amount: number) {
  return `$${amount.toFixed(2)}`
}
