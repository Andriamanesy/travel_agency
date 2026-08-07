export interface User {
  id: string
  name: string
  email: string
  phone?: string | null
  address?: string | null
  avatar_url?: string | null
}

export interface LoginResponse { token: string; user: User }
