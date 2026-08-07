import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ApiError } from '@/lib/api-client'
import type { User } from '@/features/auth/types'
import { circuitBookingSchema, type CircuitBookingFormValues, type CircuitBookingValues } from '../schemas/booking.schema'
import { useCreateCircuitBooking } from '../hooks/useBooking'
import type { Circuit, CreatedBooking } from '../types'
import { calculateBookingPrice } from '../utils/pricing'
import { BookingSummary } from './BookingSummary'

export function CircuitBookingForm({ circuit, user, onSuccess }: { circuit: Circuit; user: User; onSuccess: (booking: CreatedBooking) => void }) {
  const booking = useCreateCircuitBooking()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CircuitBookingFormValues, unknown, CircuitBookingValues>({
    resolver: zodResolver(circuitBookingSchema),
    defaultValues: { start_date: '', end_date: '', participants_count: 1, contact_name: user.name, contact_email: user.email, contact_phone: user.phone ?? '', options: { cancellation_protection: false, airport_transfer: false } },
  })
  const options = watch('options')
  const participants = Number(watch('participants_count') || 1)
  const price = calculateBookingPrice(circuit.price, participants, options)
  const error = booking.error instanceof ApiError ? booking.error.message : booking.isError ? 'La réservation n’a pas pu être créée.' : null

  return <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.25fr_.75fr]"><form onSubmit={handleSubmit((values) => booking.mutate({ circuitId: circuit.id, values }, { onSuccess: ({ booking: created }) => onSuccess(created) }))} noValidate className="rounded-3xl bg-white p-8 shadow-sm"><p className="text-xs font-bold tracking-widest text-emerald-700">RÉSERVATION SÉCURISÉE</p><h1 className="mt-2 text-3xl font-black">Préparez votre circuit</h1><div className="mt-8 grid gap-5 sm:grid-cols-2"><Field label="Date de départ" error={errors.start_date?.message}><input {...register('start_date')} type="date" className="field" /></Field><Field label="Date de retour" error={errors.end_date?.message}><input {...register('end_date')} type="date" className="field" /></Field></div><Field label="Nombre de voyageurs" error={errors.participants_count?.message}><input {...register('participants_count')} type="number" min="1" max="50" className="field" /></Field><fieldset className="mt-6"><legend className="text-sm font-semibold">Options</legend><label className="mt-3 flex gap-3 rounded-xl border border-slate-200 p-4 text-sm"><input {...register('options.cancellation_protection')} type="checkbox" /> Protection annulation (+35 € / voyageur)</label><label className="mt-3 flex gap-3 rounded-xl border border-slate-200 p-4 text-sm"><input {...register('options.airport_transfer')} type="checkbox" /> Transfert aéroport (+50 €)</label></fieldset><div className="mt-7 border-t border-slate-100 pt-6"><h2 className="text-lg font-bold">Contact de réservation</h2><Field label="Nom complet" error={errors.contact_name?.message}><input {...register('contact_name')} autoComplete="name" className="field" /></Field><Field label="E-mail" error={errors.contact_email?.message}><input {...register('contact_email')} type="email" autoComplete="email" className="field" /></Field><Field label="Téléphone" error={errors.contact_phone?.message}><input {...register('contact_phone')} type="tel" autoComplete="tel" className="field" /></Field></div>{error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={booking.isPending} className="mt-8 w-full rounded-xl bg-emerald-700 px-5 py-4 font-bold text-white disabled:opacity-70">{booking.isPending ? 'Validation…' : 'Confirmer la demande'}</button></form><BookingSummary circuit={circuit} participants={participants} price={price} /></div>
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="mt-5 block text-sm font-semibold">{label}{children}{error && <span className="mt-1 block text-sm font-normal text-red-600">{error}</span>}</label> }
