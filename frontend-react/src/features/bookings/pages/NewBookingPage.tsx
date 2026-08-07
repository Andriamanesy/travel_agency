import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '@/lib/api-client'
import { useDestination } from '@/features/destinations/hooks/useDestinations'
import { bookingSchema, type BookingFormValues, type BookingValues } from '../schemas/booking.schema'
import { useCreateBooking } from '../hooks/useBookings'

const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

export function NewBookingPage() {
  const [params] = useSearchParams()
  const destinationId = params.get('destinationId') ?? ''
  const destination = useDestination(destinationId)
  const createBooking = useCreateBooking()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<BookingFormValues, unknown, BookingValues>({ resolver: zodResolver(bookingSchema), defaultValues: { participants_count: 1 } })
  const participants = Number(watch('participants_count') || 1)

  if (!destinationId) return <Navigate to="/destinations" replace />
  if (destination.isPending) return <p>Chargement de votre séjour…</p>
  if (destination.isError || !destination.data) return <p role="alert">Cette offre est introuvable.</p>
  if (createBooking.isSuccess) return <section className="mx-auto max-w-lg rounded-3xl bg-white p-10 text-center shadow-sm"><div className="text-5xl">✓</div><h1 className="mt-4 text-3xl font-black">Demande envoyée</h1><p className="mt-3 text-slate-600">Votre réservation est en attente de confirmation. Un e-mail récapitulatif vous a été envoyé.</p><Link to="/bookings" className="mt-7 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white">Voir mes réservations</Link></section>

  const offer = destination.data.destination
  const error = createBooking.error instanceof ApiError ? createBooking.error.message : createBooking.isError ? 'La réservation a échoué.' : null
  return <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.25fr_.75fr]"><form onSubmit={handleSubmit((values) => createBooking.mutate({ destinationId, values }))} noValidate className="rounded-3xl bg-white p-8 shadow-sm"><p className="text-xs font-bold tracking-widest text-emerald-700">RÉSERVATION SÉCURISÉE</p><h1 className="mt-2 text-3xl font-black">Préparez votre voyage</h1><p className="mt-3 text-sm leading-6 text-slate-500">Choisissez vos dates et le nombre de voyageurs.</p><div className="mt-8 grid gap-5 sm:grid-cols-2"><Field label="Date de départ" error={errors.start_date?.message}><input {...register('start_date')} type="date" className="field" /></Field><Field label="Date de retour" error={errors.end_date?.message}><input {...register('end_date')} type="date" className="field" /></Field></div><Field label="Nombre de participants" error={errors.participants_count?.message}><input {...register('participants_count')} type="number" min="1" max="50" className="field" /></Field>{error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={createBooking.isPending} className="mt-8 w-full rounded-xl bg-emerald-700 px-5 py-4 font-bold text-white disabled:opacity-70">{createBooking.isPending ? 'Envoi en cours…' : 'Envoyer ma demande de réservation'}</button></form><aside className="h-fit rounded-3xl bg-slate-900 p-7 text-white"><p className="text-xs font-bold tracking-widest text-emerald-200">RÉCAPITULATIF</p><h2 className="mt-3 text-2xl font-black">{offer.title}</h2><p className="mt-2 text-sm text-slate-300">{offer.location}</p><div className="my-6 border-t border-slate-700" /><div className="flex justify-between text-sm text-slate-300"><span>Prix par participant</span><span>{money.format(offer.price)}</span></div><div className="mt-4 flex justify-between text-lg font-bold"><span>Total estimé</span><span>{money.format(offer.price * participants)}</span></div></aside></div>
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="mt-5 block text-sm font-semibold">{label}{children}{error && <span className="mt-1 block text-sm font-normal text-red-600">{error}</span>}</label>
}
