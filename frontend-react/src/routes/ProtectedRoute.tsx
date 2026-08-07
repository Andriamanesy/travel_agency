import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSessionStore } from '@/features/auth/store/session.store'

export function ProtectedRoute() {
  const location = useLocation()
  const status = useSessionStore((state) => state.status)
  return status === 'authenticated'
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: location.pathname }} />
}
