export const SUPPORTED_CURRENCIES = [
  'USD','KES','NGN','ZAR','EGP','GHS','UGX','TZS','GBP','EUR','INR','BRL'
] as const

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number]

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', KES: 'KSh', NGN: 'NGN', ZAR: 'R', EGP: 'E',
  GHS: 'GHS', UGX: 'USh', TZS: 'TSh', GBP: 'GBP', EUR: 'EUR',
  INR: 'INR', BRL: 'R$'
}
