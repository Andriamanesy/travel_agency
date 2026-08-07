import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

export type SessionStatus = 'restoring' | 'anonymous' | 'authenticated'
export type Toast = { title: string; message?: string; tone?: 'success' | 'info' }

interface SessionState {
  status: SessionStatus
  user: User | null
  roles: string[]
  welcome: { title: string; message: string; admin: boolean } | null
  toast: Toast | null
  authenticate: (user: User, roles: string[]) => void
  updateUser: (user: Partial<User>) => void
  clear: () => void
  dismissWelcome: () => void
  showWelcome: (welcome: NonNullable<SessionState['welcome']>) => void
  showToast: (toast: Toast) => void
  dismissToast: () => void
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
    welcome: null,
    toast: null,
    authenticate: (user, roles) => {
      const admin = roles.includes('admin') || roles.includes('super_admin')
      const firstName = user.name?.trim().split(/\s+/)[0] || 'voyageur'
      set({ status: 'authenticated', user, roles, welcome: admin
        ? { title: 'Espace d’administration activé', message: 'Vos indicateurs et alertes sont prêts.', admin: true }
        : { title: `Bienvenue de retour, ${firstName} !`, message: 'Votre prochaine escapade vous attend. 👋', admin: false } })
    },
    updateUser: (user) => set((state) => ({ user: state.user ? { ...state.user, ...user } : state.user })),
    clear: () => set({ status: 'anonymous', user: null, roles: [], welcome: null, toast: null }),
    dismissWelcome: () => set({ welcome: null }),
    showWelcome: (welcome) => set({ welcome }),
    showToast: (toast) => set({ toast }),
    dismissToast: () => set({ toast: null }),
  }),
  {
    name: 'travelms-session-ui',
    partialize: ({ user, roles }) => ({ user, roles }),
    merge: (persisted, current) => ({ ...current, ...(persisted as Partial<SessionState>), status: 'restoring' }),
  },
))
