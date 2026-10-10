import crypto from 'crypto'

const HMAC_KEY = Buffer.from(
  process.env.ID_HMAC_KEY || 'change-me-id-hmac',
  'base64'
)

export function normalizeIdNumber(id: string): string {
  return id.trim().toUpperCase().replace(/[\s\-.]/g, '')
}

export function hashIdNumber(id: string, countryCode: string): string {
  return crypto
    .createHmac('sha256', HMAC_KEY)
    .update(`${countryCode}:${normalizeIdNumber(id)}`)
    .digest('hex')
}

export function safeCompareHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
  } catch {
    return false
  }
}
