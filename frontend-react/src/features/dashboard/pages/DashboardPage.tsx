import { useLocation, Link } from 'react-router-dom'
import { ApiError } from '@/lib/api-client'
import { CustomerBookingCard } from '../components/CustomerBookingCard'
import { useCancelCustomerBooking, useCustomerBookings } from '../hooks/useCustomerBookings'
import { Skeleton } from '@/components/feedback/Skeleton'
import type { Booking } from '@/features/bookings/types'
import { CheckCircle2, AlertCircle, Calendar, History, Compass } from 'lucide-react'

export function DashboardPage() {
  const location = useLocation()
  const bookings = useCustomerBookings()
  const cancellation = useCancelCustomerBooking()
  const now = new Date()

  const list = bookings.data?.bookings ?? []

  // Séparation entre voyages à venir et passez/annulés
  const upcoming = list.filter((booking) => {
    const startDate = new Date(`${booking.start_date}T00:00:00`)
    return startDate >= now && booking.status !== 'cancelled'
  })

  const past = list.filter((booking) => !upcoming.includes(booking))

  // Gestion des erreurs
  const error = bookings.error instanceof ApiError 
    ? bookings.error.message 
    : cancellation.error instanceof ApiError 
      ? cancellation.error.message 
      : bookings.isError 
        ? 'Impossible de charger vos réservations.' 
        : null

  // Message flash de confirmation après création d'une réservation
  const message = (location.state as { bookingCreated?: string } | null)?.bookingCreated

  return (
    <div className="space-y-10">
      {/* En-tête de l'espace client */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-600 mb-1">
          <Compass size={16} />
          <span>Espace client</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Mes voyages
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Suivez vos demandes et retrouvez le détail de l'ensemble de vos réservations.
        </p>
      </div>

      {/* Message de confirmation flash */}
      {message && (
        <div role="status" className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800 border border-emerald-200/80 shadow-sm">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold">
            Votre demande <strong className="font-extrabold">{message}</strong> a bien été enregistrée.
          </p>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-rose-700 border border-rose-200/80 shadow-sm">
          <AlertCircle size={20} className="text-rose-600 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Chargement par Skeletons */}
      {bookings.isPending ? (
        <div className="space-y-8">
          <div className="grid gap-4 xl:grid-cols-2">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Section Voyages à venir */}
          <BookingSection 
            title="Voyages à venir" 
            icon={<Calendar size={20} className="text-emerald-600" />}
            bookings={upcoming} 
            onCancel={(id) => cancellation.mutate(id)} 
            cancelling={cancellation.isPending} 
            empty="Aucun voyage à venir pour le moment." 
            showExploreLink={true}
          />

          {/* Section Historique */}
          <BookingSection 
            title="Historique des réservations" 
            icon={<History size={20} className="text-slate-400" />}
            bookings={past} 
            onCancel={(id) => cancellation.mutate(id)} 
            cancelling={cancellation.isPending} 
            empty="Votre historique de voyage est vide." 
          />
        </div>
      )}
    </div>
  )
}

interface BookingSectionProps {
  title: string
  icon?: React.ReactNode
  bookings: Booking[]
  onCancel: (id: string) => void
  cancelling: boolean
  empty: string
  showExploreLink?: boolean
}

function BookingSection({ 
  title, 
  icon, 
  bookings, 
  onCancel, 
  cancelling, 
  empty,
  showExploreLink = false 
}: BookingSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
        <div className="flex items-center gap-2.5">
          {icon}
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 border border-slate-200/60">
            {bookings.length}
          </span>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{empty}</p>
          {showExploreLink && (
            <Link
              to="/catalog/circuits"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 transition shadow-sm"
            >
              Découvrir nos circuits
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {bookings.map((booking) => (
            <CustomerBookingCard 
              key={booking.id} 
              booking={booking} 
              onCancel={onCancel} 
              cancelling={cancelling} 
            />
          ))}
        </div>
      )}
    </section>
  )
}