export function convertUsdToLocal(usd: number, rate: number): number {
  if (!rate || rate === 1) return usd
  return +(usd * rate).toFixed(2)
}

export function usdFromLocal(local: number, rate: number): number {
  if (!rate) return local
  return +(local / rate).toFixed(2)
}
