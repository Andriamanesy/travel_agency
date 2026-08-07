import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSessionStore } from '@/features/auth/store/session.store'
import { profileService } from '../services/profile.service'

export const useProfile = () => useQuery({ queryKey: ['profile'], queryFn: profileService.get })

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const updateUser = useSessionStore((state) => state.updateUser)
  return useMutation({
    mutationFn: profileService.update,
    onSuccess: ({ user }) => {
      updateUser(user)
      queryClient.setQueryData(['profile'], user)
    },
  })
}
