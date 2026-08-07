import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/auth.service'
import { saveSession } from '@/lib/session'

export function useLogin() {
  return useMutation({
    mutationFn: authService.login,
    onSuccess: ({ token, user }) => saveSession(token, user),
  })
}
