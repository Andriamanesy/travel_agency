import { ApiError } from '@/lib/api-client'
import { useAdminBookings, useUpdateBookingStatus } from '../hooks/useAdminBookings'
import type { AdminBooking } from '../types'

const labels = { pending: 'En attente', confirmed: 'Confirmée', cancelled: 'Annulée' }
const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

export function AdminBookingsPage() {
  const { data, isPending, isError, error } = useAdminBookings()
  const update = useUpdateBookingStatus()
  const message = error instanceof ApiError ? error.message : isError ? 'Impossible de charger les réservations.' : null
  return <section><p className="text-sm font-semibold uppercase tracking-[.3em] text-emerald-600">Administration</p><h1 className="mt-2 text-3xl font-black">Réservations</h1><p className="mt-2 text-slate-600">Confirmez ou annulez les demandes client.</p>{message && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{message}</p>}{isPending && <p className="mt-8">Chargement…</p>}<div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">{data?.bookings.length === 0 && <p className="p-6">Aucune réservation.</p>}{data?.bookings.map((booking) => <BookingRow key={booking.id} booking={booking} pending={update.isPending} onChange={(status) => update.mutate({ id: booking.id, status })} />)}</div>{update.isError && <p role="alert" className="mt-4 text-sm text-red-700">La mise à jour a échoué. Réessayez.</p>}</section>
}

function BookingRow({ booking, pending, onChange }: { booking: AdminBooking; pending: boolean; onChange: (status: AdminBooking['status']) => void }) {
  return <article className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 last:border-0"><div><h2 className="font-bold">{booking.offer_title} — {booking.customer_name}</h2><p className="mt-1 text-sm text-slate-500">{booking.customer_email} · {booking.start_date} → {booking.end_date} · {booking.participants_count} participant(s) · {money.format(booking.total_price)}</p></div><label className="sr-only" htmlFor={`status-${booking.id}`}>Statut</label><select id={`status-${booking.id}`} value={booking.status} disabled={pending} onChange={(event) => onChange(event.target.value as AdminBooking['status'])} className="rounded-lg border border-slate-300 bg-white p-2 text-sm font-semibold">{(Object.keys(labels) as AdminBooking['status'][]).map((status) => <option key={status} value={status}>{labels[status]}</option>)}</select></article>
}
