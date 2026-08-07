import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getAccessToken } from '@/lib/session'

export function ProtectedRoute() {
  const location = useLocation()
  return getAccessToken()
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: location.pathname }} />
}
