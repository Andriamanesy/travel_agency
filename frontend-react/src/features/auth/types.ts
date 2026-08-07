export interface User {
  id: string
  name: string
  email: string
  phone?: string | null
  address?: string | null
  avatar_url?: string | null
  is_verified?: boolean
  birthdate?: string | null
  gender?: string | null
  nationality?: string | null
  country?: string | null
  city?: string | null
  postalCode?: string | null
  preferredLang?: string | null
}

export interface LoginResponse { token: string; user: User }
