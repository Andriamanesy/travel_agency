import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../services/admin.service'
import type { CatalogEntity } from '@/features/catalog/types'

export const useAdminDestinations = () => useQuery({ queryKey: ['admin', 'destinations'], queryFn: adminService.destinations })
export const useAdminUsers = () => useQuery({ queryKey: ['admin', 'users'], queryFn: adminService.users })
export const useAdminCatalog = (entity: CatalogEntity) => useQuery({ queryKey: ['admin', entity], queryFn: () => adminService.catalog(entity) })

export function useAdminActions() {
  const client = useQueryClient()
  const refresh = (key: string[]) => client.invalidateQueries({ queryKey: key })
  return {
    saveDestination: useMutation({ mutationFn: ({ id, values }: { id: string | null; values: Record<string, unknown> }) => adminService.saveDestination(id, values), onSuccess: () => refresh(['admin', 'destinations']) }),
    deleteDestination: useMutation({ mutationFn: adminService.deleteDestination, onSuccess: () => refresh(['admin', 'destinations']) }),
    saveCatalog: useMutation({ mutationFn: ({ entity, id, values }: { entity: CatalogEntity; id: string | null; values: Record<string, unknown> }) => adminService.saveCatalog(entity, id, values), onSuccess: (_, { entity }) => refresh(['admin', entity]) }),
    deleteCatalog: useMutation({ mutationFn: ({ entity, id }: { entity: CatalogEntity; id: string }) => adminService.deleteCatalog(entity, id), onSuccess: (_, { entity }) => refresh(['admin', entity]) }),
    updateRoles: useMutation({ mutationFn: ({ id, roles }: { id: string; roles: string[] }) => adminService.updateRoles(id, roles), onSuccess: () => refresh(['admin', 'users']) }),
    invite: useMutation({ mutationFn: ({ email }: { email: string }) => adminService.invite(email, 'agent') }),
  }
}
