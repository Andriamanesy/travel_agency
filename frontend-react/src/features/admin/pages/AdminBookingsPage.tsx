import { ApiError } from '@/lib/api-client'
import { useMemo, useState } from 'react'
import { useAdminBookings, useUpdateBookingStatus } from '../hooks/useAdminBookings'
import type { AdminBooking } from '../types'

const labels = { pending: 'En attente', confirmed: 'Confirmée', cancelled: 'Annulée' }
const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

export function AdminBookingsPage() {
  const { data, isPending, isError, error } = useAdminBookings()
  const update = useUpdateBookingStatus()
  const [status, setStatus] = useState<'all' | AdminBooking['status']>('all')
  const [date, setDate] = useState('')
  const [customer, setCustomer] = useState('')
  const message = error instanceof ApiError ? error.message : isError ? 'Impossible de charger les réservations.' : null
  const bookings = useMemo(() => (data?.bookings ?? []).filter((booking) => (status === 'all' || booking.status === status) && (!date || booking.start_date <= date && booking.end_date >= date) && (!customer || `${booking.customer_name} ${booking.customer_email}`.toLocaleLowerCase().includes(customer.toLocaleLowerCase()))), [data?.bookings, status, date, customer])
  return <section><p className="text-sm font-semibold uppercase tracking-[.3em] text-emerald-600">Administration</p><h1 className="mt-2 text-3xl font-black">Réservations</h1><p className="mt-2 text-slate-600">Vue globale : validez, annulez ou remettez une demande en attente.</p><div className="mt-6 grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-3"><label className="text-sm font-semibold">Statut<select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="field"><option value="all">Tous les statuts</option>{(Object.keys(labels) as AdminBooking['status'][]).map((value) => <option key={value} value={value}>{labels[value]}</option>)}</select></label><label className="text-sm font-semibold">Date de séjour<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="field" /></label><label className="text-sm font-semibold">Client<input value={customer} onChange={(event) => setCustomer(event.target.value)} placeholder="Nom ou e-mail" className="field" /></label></div>{message && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{message}</p>}{isPending && <p className="mt-8">Chargement…</p>}<div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">{!isPending && bookings.length === 0 && <p className="p-6">Aucune réservation ne correspond aux filtres.</p>}{bookings.map((booking) => <BookingRow key={booking.id} booking={booking} pending={update.isPending} onChange={(nextStatus) => update.mutate({ id: booking.id, status: nextStatus })} />)}</div>{update.isError && <p role="alert" className="mt-4 text-sm text-red-700">La mise à jour a échoué. Réessayez.</p>}</section>
}

function BookingRow({ booking, pending, onChange }: { booking: AdminBooking; pending: boolean; onChange: (status: AdminBooking['status']) => void }) {
  return <article className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 last:border-0"><div><h2 className="font-bold">{booking.offer_title} — {booking.customer_name}</h2><p className="mt-1 text-sm text-slate-500">{booking.customer_email} · {booking.start_date} → {booking.end_date} · {booking.participants_count} participant(s) · {money.format(booking.total_price)}</p></div><label className="sr-only" htmlFor={`status-${booking.id}`}>Statut</label><select id={`status-${booking.id}`} value={booking.status} disabled={pending} onChange={(event) => onChange(event.target.value as AdminBooking['status'])} className="rounded-lg border border-slate-300 bg-white p-2 text-sm font-semibold">{(Object.keys(labels) as AdminBooking['status'][]).map((status) => <option key={status} value={status}>{labels[status]}</option>)}</select></article>
}
