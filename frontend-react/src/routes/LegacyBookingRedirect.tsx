import { Navigate, useLocation } from 'react-router-dom'

/** Compatibilité Vite/dev et liens qui atteignent directement la SPA sans Nginx. */
export function LegacyBookingRedirect() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const circuitId = params.get('tour_id') ?? params.get('circuit_id')
  const destinationId = params.get('destination_id')

  if (circuitId) return <Navigate to={`/booking/${encodeURIComponent(circuitId)}${location.search}`} replace />
  if (destinationId) return <Navigate to={`/bookings/new?destinationId=${encodeURIComponent(destinationId)}`} replace />
  return <Navigate to="/catalog/circuits" replace />
}
