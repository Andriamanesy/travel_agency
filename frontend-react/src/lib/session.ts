const TOKEN_KEY = 'token'
const USER_KEY = 'travelms_user'
let accessToken: string | null = null

import { useSessionStore } from '@/features/auth/store/session.store'
import type { User } from '@/features/auth/types'

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token: string) {
  accessToken = token
}

function rolesFromAccessToken(token: string): string[] {
  try {
    const payload = token.split('.')[1]
    if (!payload) return []
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { roles?: unknown }
    return Array.isArray(decoded.roles) ? decoded.roles.filter((role): role is string => typeof role === 'string') : []
  } catch {
    return []
  }
}

function rolesFromUser(user: User): string[] {
  const roles = Array.isArray(user.roles) ? user.roles.filter((role): role is string => typeof role === 'string') : []
  if (typeof user.role === 'string') roles.push(user.role)
  if (user.role && typeof user.role === 'object' && typeof user.role.code === 'string') roles.push(user.role.code)
  return [...new Set(roles)]
}

export function saveSession(token: string, user: User) {
  setAccessToken(token)
  useSessionStore.getState().authenticate(user, [...new Set([...rolesFromAccessToken(token), ...rolesFromUser(user)])])
}

export function clearSession() {
  accessToken = null
  useSessionStore.getState().clear()
  // Purge les clés du client legacy pendant la coexistence des deux frontends.
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem('travelms_token')
}
