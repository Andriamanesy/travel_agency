import { Navigate, Outlet } from 'react-router-dom'
import { useSessionStore } from '@/features/auth/store/session.store'

export function RoleRoute({ role }: { role: string | number }) {
  // Deux sélecteurs stables : retourner un nouvel objet à chaque rendu fait
  // boucler useSyncExternalStore avec React 19/Zustand et déclenche l'ErrorBoundary.
  const roles = useSessionStore((state) => state.roles)
  const user = useSessionStore((state) => state.user)
  const dynamicRole = typeof user?.role === 'string' ? user.role : user?.role?.code
  const hasRole = roles.includes(String(role)) || dynamicRole === role || (typeof role === 'number' && user?.role_id === role)
  // Les collaborateurs accèdent au Back-Office ; les autorisations fines
  // restent systématiquement contrôlées par les permissions de l’API.
  const isAdminRole = role === 'admin' && ['super_admin', 'agent'].some((candidate) => roles.includes(candidate) || dynamicRole === candidate)
  return hasRole || isAdminRole ? <Outlet /> : <Navigate to="/dashboard" replace />
}
