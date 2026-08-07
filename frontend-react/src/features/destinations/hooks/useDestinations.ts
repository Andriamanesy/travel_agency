import { useQuery } from '@tanstack/react-query'
import { destinationsService } from '../services/destinations.service'

export function useDestinations(search = '') {
  return useQuery({ queryKey: ['destinations', { search }], queryFn: () => destinationsService.list({ limit: 12, q: search || undefined }) })
}

export function useDestination(id: string) {
  return useQuery({ queryKey: ['destinations', id], queryFn: () => destinationsService.getById(id), enabled: Boolean(id) })
}
