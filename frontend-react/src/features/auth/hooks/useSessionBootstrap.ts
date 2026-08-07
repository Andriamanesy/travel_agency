import { useEffect } from 'react'
import { clearSession, saveSession } from '@/lib/session'
import { authService } from '../services/auth.service'

let restoreRequest: Promise<void> | null = null

function restoreOnce() {
  restoreRequest ??= authService.restore()
    .then(({ token, user }) => saveSession(token, user))
    .catch(() => clearSession())
    .finally(() => { restoreRequest = null })
  return restoreRequest
}

/** Reconstitue une session après un rechargement grâce au refresh cookie HttpOnly. */
export function useSessionBootstrap() {
  useEffect(() => { void restoreOnce() }, [])
}
