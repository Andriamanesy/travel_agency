import { apiClient } from '@/lib/api-client'

export type Permission = { id: number; code: string; label: string; category: string }
export type Role = { id: number; code: string; name: string; description: string | null; is_system: boolean; permissions: Permission[] }
export type AdminManagedUser = { id: string; name: string; email: string; avatar_url: string | null; is_verified: boolean; is_active: boolean; role_id: number; role_code?: string; role_name?: string; created_at: string }
export type UserForm = { name: string; email: string; password?: string; role_id: number }

export const adminRbacService = {
  permissions: () => apiClient.get<{ permissions: Permission[] }>('/v1/admin/roles/permissions'),
  roles: () => apiClient.get<{ roles: Role[] }>('/v1/admin/roles'),
  saveRole: (id: number | null, values: { name: string; description?: string; permissions: string[] }) => id ? apiClient.put<{ role: Role }>(`/v1/admin/roles/${id}`, values) : apiClient.post<{ role: Role }>('/v1/admin/roles', values),
  deleteRole: (id: number) => apiClient.delete(`/v1/admin/roles/${id}`),
  users: (params = '') => apiClient.get<{ users: AdminManagedUser[]; pagination: { page: number; limit: number; total: number; pages: number } }>(`/v1/admin/users${params}`),
  createUser: (values: UserForm) => apiClient.post<{ user: AdminManagedUser }>('/v1/admin/users', values),
  updateUser: (id: string, values: UserForm) => apiClient.put<{ user: AdminManagedUser }>(`/v1/admin/users/${id}`, values),
  setStatus: (id: string, is_active: boolean) => apiClient.patch<{ user: AdminManagedUser }>(`/v1/admin/users/${id}/status`, { is_active }),
  deleteUser: (id: string) => apiClient.delete(`/v1/admin/users/${id}`),
}
