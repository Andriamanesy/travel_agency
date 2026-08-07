import { AlertTriangle, BookOpenCheck, CalendarDays, MapPinned } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAdminBookings } from '../hooks/useAdminBookings'
import { useAdminCatalog } from '../hooks/useAdmin'

export function AdminDashboardPage() {
  const bookings = useAdminBookings()
  const circuits = useAdminCatalog('circuits')
  const today = new Date().toISOString().slice(0, 10)
  const list = bookings.data?.bookings ?? []
  const todayBookings = list.filter((booking) => booking.start_date === today)
  const pending = list.filter((booking) => booking.status === 'pending')
  const activeCircuits = circuits.data?.circuits?.length ?? 0
  const cards = [
    { label: 'Réservations du jour', value: todayBookings.length, icon: CalendarDays, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Circuits actifs', value: activeCircuits, icon: MapPinned, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Demandes à traiter', value: pending.length, icon: AlertTriangle, tone: 'bg-amber-50 text-amber-700' },
  ]
  return <section className="space-y-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[.3em] text-emerald-600">Back-office</p><h1 className="mt-2 text-3xl font-black">Vue d’ensemble</h1><p className="mt-2 text-slate-600">Pilotez l’activité TravelMS depuis un seul espace.</p></div><Link to="/admin/bookings" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"><BookOpenCheck size={17} />Gérer les réservations</Link></div><div className="grid gap-4 md:grid-cols-3">{cards.map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><span className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}><Icon size={21} /></span><p className="mt-5 text-3xl font-black text-slate-950">{bookings.isPending || circuits.isPending ? '—' : value}</p><p className="mt-1 text-sm font-semibold text-slate-500">{label}</p></article>)}</div><section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 p-6"><div><h2 className="font-black text-slate-950">Alertes opérationnelles</h2><p className="mt-1 text-sm text-slate-500">Les dernières demandes qui attendent une action.</p></div><Link to="/admin/bookings" className="text-sm font-bold text-emerald-700">Tout afficher</Link></div>{pending.length ? <div>{pending.slice(0, 4).map((booking) => <div key={booking.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 px-6 py-4 last:border-0"><div><p className="font-bold text-slate-800">{booking.customer_name}</p><p className="text-sm text-slate-500">{booking.offer_title} · départ le {new Date(`${booking.start_date}T00:00:00`).toLocaleDateString('fr-FR')}</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">À confirmer</span></div>)}</div> : <p className="p-6 text-sm text-slate-500">Aucune alerte en attente. Tout est à jour.</p>}</section></section>
}
