import { apiClient } from '@/lib/api-client'

export type FeaturedDestination = {
  id: string
  title: string
  description: string
  location: string
  price: number
  cover_image: string
  circuit_count: number
}

export type FeaturedCircuit = {
  id: string
  title: string
  description: string
  price: number
  original_price?: number | string | null // <-- Ajouté ici
  duration_days: number
  cover_image: string
  destination_id: string
  destination_title: string
  location: string
  next_departure: string | null
}

export type HomeFeature = {
  icon: string
  title: string
  description: string
  isActive?: boolean
}

export type HomeSettings = {
  hero: {
    title: string
    subtitle: string
    ctaText: string
    ctaLink: string
    bgImageUrl: string | null
  }
  features: HomeFeature[]
}

export const homeService = {
  destinations: () => apiClient.get<{ destinations: FeaturedDestination[] }>('/v1/public/destinations/featured'),
  circuits: () => apiClient.get<{ circuits: FeaturedCircuit[] }>('/v1/public/circuits/featured'),
  settings: () => apiClient.get<HomeSettings>('/v1/public/home-settings'),
}