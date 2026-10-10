import { verifyAccess, AccessPayload } from '@dd/security'

export function getBearer(req: Request): string | null {
  const h = req.headers.get('authorization') || req.headers.get('Authorization')
  if (!h || !h.startsWith('Bearer ')) return null
  return h.slice(7)
}

export async function requireAuth(req: Request): Promise<AccessPayload> {
  const token = getBearer(req)
  if (!token) throw Object.assign(new Error('Unauthorized'), { status: 401 })
  try {
    return await verifyAccess(token)
  } catch {
    throw Object.assign(new Error('Unauthorized'), { status: 401 })
  }
}

export async function optionalAuth(req: Request): Promise<AccessPayload | null> {
  const token = getBearer(req)
  if (!token) return null
  try {
    return await verifyAccess(token)
  } catch {
    return null
  }
}
