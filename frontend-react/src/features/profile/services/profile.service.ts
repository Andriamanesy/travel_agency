import { apiClient } from '@/lib/api-client'
import type { User } from '@/features/auth/types'

export const profileService = { get: () => apiClient.get<User>('/profile') }
