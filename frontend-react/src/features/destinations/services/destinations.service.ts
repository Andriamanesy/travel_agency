import { apiClient } from '@/lib/api-client'
import type { DestinationDetails, DestinationsResponse } from '../types'

export const destinationsService = {
  list: (params: { page?: number; limit?: number; q?: string } = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    if (params.q) query.set('q', params.q)
    return apiClient.get<DestinationsResponse>(`/destinations${query.size ? `?${query}` : ''}`)
  },
  getById: (id: string) => apiClient.get<{ destination: DestinationDetails }>(`/destinations/${id}`),
}
