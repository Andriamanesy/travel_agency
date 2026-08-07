import { useQuery } from '@tanstack/react-query'
import { catalogService } from '../services/catalog.service'
import type { CatalogEntity } from '../types'

export const useCatalog = (entity: CatalogEntity, search: string) => useQuery({ queryKey: ['catalog', entity, search], queryFn: () => catalogService.list(entity, search) })
export const useCatalogItem = (entity: Exclude<CatalogEntity, 'categories'>, id: string) => useQuery({ queryKey: ['catalog', entity, id], queryFn: () => catalogService.getById(entity, id), enabled: Boolean(id) })
