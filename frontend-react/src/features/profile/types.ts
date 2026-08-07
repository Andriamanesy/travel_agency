import type { User } from '@/features/auth/types'

export type Profile = User

export interface ProfileUpdateResponse {
  success: boolean
  message: string
  user: Profile
}
