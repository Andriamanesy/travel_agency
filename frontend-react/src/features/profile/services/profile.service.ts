import { apiClient } from '@/lib/api-client'
import type { User } from '@/features/auth/types'
import type { ProfileUpdateResponse } from '../types'

export const profileService = {
  get: () => apiClient.get<User>('/profile'),
  update: (form: FormData) => apiClient.form<ProfileUpdateResponse>('/profile/update', 'POST', form),
}
