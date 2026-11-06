export type UserRole = 'ROLE_CUSTOMER' | 'ROLE_STAFF' | 'ROLE_ADMIN'

export interface User {
  id: number
  email: string
  fullName: string
  phone?: string
  avatarUrl?: string
  roles: UserRole[]
  loyaltyPoints?: number
  tier?: string
}

export interface AuthTokens {
  accessToken: string
}

export interface LoginResponse {
  user: User
  accessToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
}
