import { AlertTriangle, Banknote, CalendarDays, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useAnalytics, useBackofficeBookings } from '../hooks/useBackoffice'
import type { AdminBookingDetail, Analytics } from '../services/backoffice.service'

const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

function asFiniteNumber(value: unknown, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function queryErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Les données sont temporairement indisponibles.'
}

export function AdminDashboardPage() {
  const analytics = useAnalytics()
  const bookings = useBackofficeBookings('?status=pending&limit=5')
  const rawKpis = analytics.data?.kpis
  const kpis: Analytics['kpis'] | undefined = rawKpis && typeof rawKpis === 'object' ? rawKpis : undefined
  const popular = Array.isArray(kpis?.popular_circuits)
    ? kpis.popular_circuits.filter((item): item is { title: string; bookings: number } => Boolean(item && typeof item === 'object'))
    : []
  const pendingBookings: AdminBookingDetail[] = Array.isArray(bookings.data?.bookings)
    ? bookings.data.bookings.filter((booking): booking is AdminBookingDetail => Boolean(booking && typeof booking === 'object'))
    : []
  const maxBookings = Math.max(1, ...popular.map((item) => asFiniteNumber(item.bookings)))
  const cancellationRate = Math.max(0, asFiniteNumber(kpis?.cancellation_rate))
  
  const cards = [
    { label: 'Chiffre d’affaires confirmé', value: kpis ? money.format(asFiniteNumber(kpis.revenue)) : '—', icon: Banknote, tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
    { label: 'Réservations ce mois', value: kpis ? asFiniteNumber(kpis.bookings_month) : '—', icon: CalendarDays, tone: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
    { label: 'Taux d’annulation', value: kpis ? `${(cancellationRate * 100).toFixed(1)} %` : '—', icon: AlertTriangle, tone: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
    { label: 'Nouveaux clients', value: kpis ? asFiniteNumber(kpis.new_customers) : '—', icon: UsersRound, tone: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' },
  ]

  return (
    <section className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.22em] text-emerald-600 dark:text-emerald-500">Pilotage</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Vue d’ensemble</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Suivez l’activité commerciale et les actions à traiter.</p>
        </div>
        <Link to="/admin/bookings" className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors">
          Traiter les réservations
        </Link>
      </div>

      {analytics.isError && (
        <p role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
          Indicateurs indisponibles : {queryErrorMessage(analytics.error)}
        </p>
      )}

      {/* Cartes KPI */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="rounded-2xl bg-white dark:bg-[#121214] p-5 shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-colors">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
              <Icon size={20} />
            </span>
            <p className="mt-5 text-2xl font-black text-slate-900 dark:text-white">
              {analytics.isPending ? <Skeleton className="h-8 w-20" /> : value}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Circuits populaires */}
        <section className="rounded-2xl bg-white dark:bg-[#121214] p-6 shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-colors">
          <h2 className="font-black text-slate-900 dark:text-white">Circuits populaires</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Réservations cumulées par circuit.</p>
          <div className="mt-6 space-y-4">
            {analytics.isPending ? (
              <>
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
              </>
            ) : popular.length ? (
              popular.map((item, index) => {
                const count = asFiniteNumber(item.bookings)
                return (
                  <div key={`${item.title || 'offre'}-${index}`}>
                    <div className="mb-1 flex justify-between text-sm font-bold text-slate-800 dark:text-slate-200">
                      <span>{item.title || 'Offre supprimée'}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded bg-emerald-500" style={{ width: `${Math.min(100, (count / maxBookings) * 100)}%` }} />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Pas encore de données.</p>
            )}
          </div>
        </section>

        {/* Alertes opérationnelles */}
        <section className="overflow-hidden rounded-2xl bg-white dark:bg-[#121214] shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-6">
            <div>
              <h2 className="font-black text-slate-900 dark:text-white">Alertes opérationnelles</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Demandes en attente de validation.</p>
            </div>
            <Link className="text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline" to="/admin/bookings">
              Tout voir
            </Link>
          </div>
          {bookings.isPending ? (
            <div className="space-y-3 p-6">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : bookings.isError ? (
            <p role="alert" className="p-6 text-sm text-red-700 dark:text-red-400">
              Réservations indisponibles : {queryErrorMessage(bookings.error)}
            </p>
          ) : pendingBookings.length ? (
            pendingBookings.map((booking) => (
              <div className="border-b border-slate-100 dark:border-slate-800/80 p-5 last:border-0" key={booking.id}>
                <b className="text-slate-900 dark:text-slate-200">{booking.customer_name || booking.customer_email || 'Client'}</b>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {booking.offer_title || 'Offre non renseignée'} · départ le {booking.start_date || 'date non renseignée'}
                </p>
              </div>
            ))
          ) : (
            <p className="p-6 text-sm text-slate-500 dark:text-slate-400">Aucune demande en attente.</p>
          )}
        </section>
      </div>
    </section>
  )
}