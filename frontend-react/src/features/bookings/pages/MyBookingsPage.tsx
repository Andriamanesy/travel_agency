import { Link } from 'react-router-dom'
import { useMyBookings } from '../hooks/useBookings'

const statusLabels = { pending: 'En attente', confirmed: 'Confirmée', cancelled: 'Annulée' }
const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

export function MyBookingsPage() {
  const { data, isPending, isError } = useMyBookings()
  return <section className="mx-auto max-w-5xl"><Link to="/dashboard" className="font-semibold text-emerald-700">← Mon espace</Link><h1 className="mt-5 text-4xl font-black">Mes réservations</h1>{isPending && <p className="mt-8">Chargement des réservations…</p>}{isError && <p role="alert" className="mt-5 text-red-700">Impossible de charger vos réservations.</p>}<div className="mt-8 space-y-4">{data?.bookings.length === 0 && <p>Vous n’avez encore aucune réservation.</p>}{data?.bookings.map((booking) => <article key={booking.id} className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-bold">{booking.offer_title}</h2><p className="mt-1 text-slate-500">{booking.start_date} → {booking.end_date} · {booking.participants_count} participant(s)</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">{statusLabels[booking.status]}</span></div><p className="mt-4 font-bold text-emerald-700">{money.format(booking.total_price)}</p></article>)}</div></section>
}
