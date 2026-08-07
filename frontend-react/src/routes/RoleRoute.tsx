import { Navigate, Outlet } from 'react-router-dom'
import { useSessionStore } from '@/features/auth/store/session.store'

export function RoleRoute({ role }: { role: string | number }) {
  const { roles, user } = useSessionStore((state) => ({ roles: state.roles, user: state.user }))
  const dynamicRole = typeof user?.role === 'string' ? user.role : user?.role?.code
  const hasRole = roles.includes(String(role)) || dynamicRole === role || (typeof role === 'number' && user?.role_id === role)
  // super_admin est le rôle système équivalent à admin depuis la migration RBAC.
  const isAdminRole = role === 'admin' && (roles.includes('super_admin') || dynamicRole === 'super_admin')
  return hasRole || isAdminRole ? <Outlet /> : <Navigate to="/dashboard" replace />
}
