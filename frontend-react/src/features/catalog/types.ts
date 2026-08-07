export const catalogEntities = ['circuits', 'hotels', 'guides', 'categories'] as const
export type CatalogEntity = typeof catalogEntities[number]

export interface CatalogItem {
  id: string
  title?: string
  name?: string
  email?: string | null
  description?: string | null
  address?: string | null
  bio?: string | null
  cover_image?: string | null
  avatar_url?: string | null
  price?: number | null
  price_per_night?: number | null
  location?: string | null
}

export type CatalogListResponse = Partial<Record<CatalogEntity, CatalogItem[]>>
