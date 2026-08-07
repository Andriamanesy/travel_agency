import { apiClient } from '@/lib/api-client'
import type { ManagedUser, UserRole } from '../types'

export const usersService = {
  list: () => apiClient.get<{ users: ManagedUser[] }>('/admin/users'),
  inviteAgent: ({ email }: { email: string }) =>
    apiClient.post<{ message: string }>('/admin/invitations', { email, role: 'agent' }),
  updateRole: ({ id, role }: { id: string; role: UserRole }) =>
    apiClient.put<{ message: string }>(`/admin/users/${id}/roles`, { roles: [role] }),
}
