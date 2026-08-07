import { Navigate, Outlet } from 'react-router-dom'
import { useSessionStore } from '@/features/auth/store/session.store'

export function RoleRoute({ role }: { role: string }) {
  const roles = useSessionStore((state) => state.roles)
  return roles.includes(role) ? <Outlet /> : <Navigate to="/dashboard" replace />
}
