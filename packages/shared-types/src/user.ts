export type UserRole = 'user' | 'seller' | 'admin' | 'driver'
export type UserStatus = 'pending_kyc' | 'active' | 'rejected' | 'suspended' | 'blocked'

export interface PublicUser {
  id: string
  fullName: string
  email: string
  role: UserRole
  countryCode: string
  status: UserStatus
}
