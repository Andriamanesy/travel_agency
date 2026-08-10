import { useQuery } from '@tanstack/react-query'
import { homeService } from '../services/home.service'

// Réexport des types officiels du service
export type {
  FeaturedDestination,
  FeaturedCircuit,
  HomeFeature,
  HomeSettings,
} from '../services/home.service'

export const useFeaturedDestinations = () =>
  useQuery({
    queryKey: ['public', 'featured-destinations'],
    queryFn: homeService.destinations,
  })

export const useFeaturedCircuits = () =>
  useQuery({
    queryKey: ['public', 'featured-circuits'],
    queryFn: homeService.circuits,
  })

export const useHomeSettings = () =>
  useQuery({
    queryKey: ['public', 'home-settings'],
    queryFn: homeService.settings,
  })