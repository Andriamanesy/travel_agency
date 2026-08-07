export const userRoles = ['client', 'agent', 'admin'] as const

export type UserRole = (typeof userRoles)[number]

export interface ManagedUser {
  id: string
  name: string
  email: string
  is_verified: boolean
  is_active: boolean
  roles: UserRole[]
}
