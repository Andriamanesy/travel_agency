import { apiClient } from '@/lib/api-client'
import type { CatalogEntity, CatalogItem, CatalogListResponse } from '../types'

export const catalogService = {
  list: (entity: CatalogEntity, search = '') => apiClient.get<CatalogListResponse>(`/${entity}${search ? `?q=${encodeURIComponent(search)}` : ''}`),
  getById: (entity: Exclude<CatalogEntity, 'categories'>, id: string) => apiClient.get<Record<string, CatalogItem>>(`/${entity}/${id}`),
}
