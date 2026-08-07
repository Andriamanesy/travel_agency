import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { backofficeService, type BackofficeResource } from '../services/backoffice.service'

export const useAnalytics = () => useQuery({ queryKey: ['backoffice', 'analytics'], queryFn: backofficeService.analytics })
export const useAdvancedCircuits = () => useQuery({ queryKey: ['backoffice', 'circuits'], queryFn: backofficeService.circuits })
export const useBackofficeBookings = (params = '') => useQuery({ queryKey: ['backoffice', 'bookings', params], queryFn: () => backofficeService.bookings(params) })
export const useBackofficeResource = (resource: BackofficeResource) => useQuery({ queryKey: ['backoffice', resource], queryFn: () => backofficeService.list(resource) })
export const useSettings = () => useQuery({ queryKey: ['backoffice', 'settings'], queryFn: backofficeService.settings })
export function useBackofficeActions() {
  const query = useQueryClient(); const invalidate = (key: string) => query.invalidateQueries({ queryKey: ['backoffice', key] })
  return {
    saveResource: useMutation({ mutationFn: ({ resource, id, values }: { resource: BackofficeResource; id?: string; values: Record<string, unknown> }) => id ? backofficeService.update(resource, id, values) : backofficeService.create(resource, values), onSuccess: (_, { resource }) => invalidate(resource) }),
    deleteResource: useMutation({ mutationFn: ({ resource, id }: { resource: BackofficeResource; id: string }) => backofficeService.remove(resource, id), onSuccess: (_, { resource }) => invalidate(resource) }),
    updateBooking: useMutation({ mutationFn: ({ id, values }: { id: string; values: Parameters<typeof backofficeService.updateBooking>[1] }) => backofficeService.updateBooking(id, values), onSuccess: () => { invalidate('bookings'); invalidate('analytics') } }),
    saveSetting: useMutation({ mutationFn: ({ key, value }: { key: string; value: Record<string, unknown> }) => backofficeService.saveSetting(key, value), onSuccess: () => invalidate('settings') }),
    saveCircuit: useMutation({ mutationFn: ({ id, values }: { id: string | null; values: Record<string, unknown> }) => backofficeService.saveCircuit(id, values), onSuccess: () => invalidate('circuits') }),
  }
}
