import { Link } from 'react-router-dom'
import type { CreatedBooking } from '../types'

export function BookingConfirmation({ booking }: { booking: CreatedBooking }) {
  return <section className="mx-auto max-w-lg rounded-3xl bg-white p-10 text-center shadow-sm"><div className="text-5xl">✓</div><h1 className="mt-4 text-3xl font-black">Demande envoyée</h1><p className="mt-3 text-slate-600">Votre référence est {booking.id}. La demande est en attente de confirmation ; un e-mail récapitulatif vous a été envoyé.</p><Link to="/dashboard" state={{ bookingCreated: booking.id }} className="mt-7 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white">Voir mon espace client</Link></section>
}
