import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useSessionStore } from '@/features/auth/store/session.store'
import { BookingConfirmation } from '../components/BookingConfirmation'
import { CircuitBookingForm } from '../components/CircuitBookingForm'
import { useCircuit } from '../hooks/useBooking'
import type { CreatedBooking } from '../types'

export function CircuitBookingPage() {
  const { tourId = '' } = useParams()
  const user = useSessionStore((state) => state.user)
  const circuit = useCircuit(tourId)
  const [createdBooking, setCreatedBooking] = useState<CreatedBooking | null>(null)
  if (!tourId || !user) return <Navigate to="/catalog/circuits" replace />
  if (circuit.isPending) return <p>Chargement du circuit…</p>
  if (circuit.isError || !circuit.data?.circuit) return <section><p role="alert">Ce circuit est introuvable ou indisponible.</p><Link to="/catalog/circuits" className="mt-5 inline-block font-semibold text-emerald-700">Voir les circuits</Link></section>
  if (createdBooking) return <BookingConfirmation booking={createdBooking} />
  return <CircuitBookingForm circuit={circuit.data.circuit} user={user} onSuccess={setCreatedBooking} />
}
