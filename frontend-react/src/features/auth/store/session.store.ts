import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

export type SessionStatus = 'restoring' | 'anonymous' | 'authenticated'

interface SessionState {
  status: SessionStatus
  user: User | null
  roles: string[]
  authenticate: (user: User, roles: string[]) => void
  updateUser: (user: Partial<User>) => void
  clear: () => void
}

/**
 * Seules les informations d'affichage sont persistées. Le JWT d'accès reste
 * exclusivement en mémoire et est récupéré de nouveau via le cookie HttpOnly.
 */
export const useSessionStore = create<SessionState>()(persist(
  (set) => ({
    status: 'restoring',
    user: null,
    roles: [],
    authenticate: (user, roles) => set({ status: 'authenticated', user, roles }),
    updateUser: (user) => set((state) => ({ user: state.user ? { ...state.user, ...user } : state.user })),
    clear: () => set({ status: 'anonymous', user: null, roles: [] }),
  }),
  {
    name: 'travelms-session-ui',
    partialize: ({ user, roles }) => ({ user, roles }),
    merge: (persisted, current) => ({ ...current, ...(persisted as Partial<SessionState>), status: 'restoring' }),
  },
))
