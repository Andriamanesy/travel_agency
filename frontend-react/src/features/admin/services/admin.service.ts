import { apiClient } from '@/lib/api-client'
import type { CatalogEntity, CatalogItem } from '@/features/catalog/types'

export interface AdminDestination extends CatalogItem { title: string; description: string; location: string; price: number; is_active: boolean; is_featured: boolean; circuit_count?: number; category_id?: string | null }
export interface AdminUser { id: string; email: string; is_verified: boolean; is_active: boolean; roles: string[] }

export const adminService = {
  destinations: () => apiClient.get<{ destinations: AdminDestination[] }>('/v1/admin/destinations'),
  saveDestination: (id: string | null, values: Record<string, unknown>) => id ? apiClient.put(`/v1/admin/destinations/${id}`, values) : apiClient.post('/v1/admin/destinations', values),
  deleteDestination: (id: string) => apiClient.delete<{ message: string }>(`/v1/admin/destinations/${id}`),
  catalog: (entity: CatalogEntity) => apiClient.get<Record<string, CatalogItem[]>>(`/admin/${entity}`),
  saveCatalog: (entity: CatalogEntity, id: string | null, values: Record<string, unknown>) => id ? apiClient.put(`/admin/${entity}/${id}`, values) : apiClient.post(`/admin/${entity}`, values),
  deleteCatalog: (entity: CatalogEntity, id: string) => apiClient.delete(`/admin/${entity}/${id}`),
  users: () => apiClient.get<{ users: AdminUser[] }>('/admin/users'),
  updateRoles: (id: string, roles: string[]) => apiClient.put<{ message: string }>(`/admin/users/${id}/roles`, { roles }),
  invite: (email: string, role: 'agent') => apiClient.post<{ message: string }>('/admin/invitations', { email, role }),
}
