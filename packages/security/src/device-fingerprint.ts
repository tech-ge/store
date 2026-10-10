import crypto from 'crypto'

export function fingerprintFromHeaders(headers: Record<string, string | undefined>) {
  const parts = [
    headers['user-agent'] || '',
    headers['accept-language'] || '',
    headers['sec-ch-ua'] || '',
    headers['sec-ch-ua-platform'] || ''
  ].join('|')
  return crypto.createHash('sha256').update(parts).digest('hex')
}
