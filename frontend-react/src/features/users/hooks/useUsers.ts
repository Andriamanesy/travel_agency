import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersService } from '../services/users.service'

const usersKey = ['admin', 'users'] as const

export const useUsers = () => useQuery({ queryKey: usersKey, queryFn: usersService.list })

export function useInviteAgent() {
  return useMutation({ mutationFn: usersService.inviteAgent })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: usersService.updateRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usersKey }),
  })
}
