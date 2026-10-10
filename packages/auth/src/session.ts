import { SignJWT, jwtVerify } from 'jose'

const enc = new TextEncoder()
const key = () => enc.encode(process.env.JWT_ACCESS_SECRET || 'change-me-session')

export async function signSession(payload: Record<string, unknown>, ttl: string = '30d') {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(key())
}

export async function verifySession<T = any>(token: string): Promise<T> {
  const { payload } = await jwtVerify(token, key())
  return payload as T
}
