import { SignJWT, jwtVerify, JWTPayload } from 'jose'

const enc = new TextEncoder()
const accessKey = () => enc.encode(process.env.JWT_ACCESS_SECRET || 'change-me-access')
const refreshKey = () => enc.encode(process.env.JWT_REFRESH_SECRET || 'change-me-refresh')

export interface AccessPayload extends JWTPayload {
  sub: string
  email: string
  role: string
  country: string
}

export async function issueAccessToken(payload: { sub: string; email: string; role: string; country: string }) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('global-market')
    .setAudience('web')
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(accessKey())
}

export async function issueRefreshToken(payload: { sub: string; sid: string }) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('global-market')
    .setAudience('web')
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(refreshKey())
}

export async function verifyAccess(token: string): Promise<AccessPayload> {
  const { payload } = await jwtVerify(token, accessKey(), { issuer: 'global-market', audience: 'web' })
  return payload as AccessPayload
}

export async function verifyRefresh(token: string): Promise<{ sub: string; sid: string }> {
  const { payload } = await jwtVerify(token, refreshKey(), { issuer: 'global-market', audience: 'web' })
  return { sub: payload.sub as string, sid: (payload as any).sid as string }
}
