import { useLocation } from 'react-router-dom'
import { ApiError } from '@/lib/api-client'
import { CustomerBookingCard } from '../components/CustomerBookingCard'
import { useCancelCustomerBooking, useCustomerBookings } from '../hooks/useCustomerBookings'
import { Skeleton } from '@/components/feedback/Skeleton'

export function DashboardPage() {
  const location = useLocation()
  const bookings = useCustomerBookings()
  const cancellation = useCancelCustomerBooking()
  const now = new Date()
  const list = bookings.data?.bookings ?? []
  const upcoming = list.filter((booking) => new Date(`${booking.start_date}T00:00:00`) >= now && booking.status !== 'cancelled')
  const past = list.filter((booking) => !upcoming.includes(booking))
  const error = bookings.error instanceof ApiError ? bookings.error.message : cancellation.error instanceof ApiError ? cancellation.error.message : bookings.isError ? 'Impossible de charger vos réservations.' : null
  const message = (location.state as { bookingCreated?: string } | null)?.bookingCreated
  return <div className="space-y-8"><div><p className="text-sm font-semibold uppercase tracking-[.3em] text-emerald-600">Espace client</p><h1 className="mt-2 text-3xl font-black">Mes voyages</h1><p className="mt-2 text-slate-600">Suivez vos demandes et retrouvez le détail de vos réservations.</p></div>{message && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800">Votre demande {message} a bien été enregistrée.</p>}{error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}{bookings.isPending ? <div className="grid gap-4 xl:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div> : <><BookingSection title="Voyages à venir" bookings={upcoming} onCancel={(id) => cancellation.mutate(id)} cancelling={cancellation.isPending} empty="Aucun voyage à venir." /><BookingSection title="Historique" bookings={past} onCancel={(id) => cancellation.mutate(id)} cancelling={cancellation.isPending} empty="Votre historique est vide." /></>}</div>
}

function BookingSection({ title, bookings, onCancel, cancelling, empty }: { title: string; bookings: import('@/features/bookings/types').Booking[]; onCancel: (id: string) => void; cancelling: boolean; empty: string }) { return <section><h2 className="text-xl font-black">{title}</h2>{bookings.length === 0 ? <p className="mt-4 text-slate-600">{empty}</p> : <div className="mt-4 grid gap-4 xl:grid-cols-2">{bookings.map((booking) => <CustomerBookingCard key={booking.id} booking={booking} onCancel={onCancel} cancelling={cancelling} />)}</div>}</section> }
