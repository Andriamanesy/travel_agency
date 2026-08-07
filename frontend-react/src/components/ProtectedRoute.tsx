import { Navigate, Outlet } from 'react-router-dom'

export function ProtectedRoute() {
  const token = localStorage.getItem('travelms_token')

  if (!token) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
