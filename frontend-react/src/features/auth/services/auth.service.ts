import { apiClient } from '@/lib/api-client'
import type { LoginResponse } from '../types'
import type { LoginValues } from '../schemas/login.schema'
import type { ChangePasswordValues, EmailValues, RegisterValues, ResetPasswordValues } from '../schemas/password.schema'

export const authService = {
  login: (credentials: LoginValues) => apiClient.post<LoginResponse>('/login', credentials, { skipRefresh: true }),
  logout: () => apiClient.post<{ message: string }>('/logout'),
  register: ({ name, email, password }: RegisterValues) => apiClient.post<{ message: string }>('/register', { name, email, password }, { skipRefresh: true }),
  verifyEmail: (token: string) => apiClient.get<{ message: string; status?: string }>(`/verify?token=${encodeURIComponent(token)}`, { skipRefresh: true }),
  forgotPassword: (values: EmailValues) => apiClient.post<{ message: string }>('/forgot-password', values, { skipRefresh: true }),
  resetPassword: (token: string, values: ResetPasswordValues) => apiClient.post<{ message: string }>('/reset-password', { token, password: values.password }, { skipRefresh: true }),
  changePassword: ({ currentPassword, newPassword }: ChangePasswordValues) => apiClient.put<{ message: string }>('/change-password', { currentPassword, newPassword }),
}
