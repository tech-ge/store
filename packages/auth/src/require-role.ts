import { AccessPayload } from '@dd/security'

export function requireRole(user: AccessPayload, ...roles: string[]) {
  if (!roles.includes(user.role)) {
    throw Object.assign(new Error('Forbidden'), { status: 403 })
  }
}
