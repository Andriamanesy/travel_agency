import { useQuery } from '@tanstack/react-query'
import { profileService } from '../services/profile.service'

export const useProfile = () => useQuery({ queryKey: ['profile'], queryFn: profileService.get })
