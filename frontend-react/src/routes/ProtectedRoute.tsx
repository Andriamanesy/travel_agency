import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSessionStore } from '@/features/auth/store/session.store'

export function ProtectedRoute() {
  const location = useLocation()
  const status = useSessionStore((state) => state.status)
  if (status === 'restoring') return null
  return status === 'authenticated'
    ? <Outlet />
    : <Navigate to="/?auth=login" replace state={{ from: `${location.pathname}${location.search}`, authMessage: 'Veuillez vous connecter pour accéder à cette page.' }} />
}
