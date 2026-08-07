import { z } from 'zod'

export const bookingOptionsSchema = z.object({
  cancellation_protection: z.boolean(),
  airport_transfer: z.boolean(),
})

export const circuitBookingSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Saisissez une date de départ valide.'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Saisissez une date de retour valide.'),
  participants_count: z.coerce.number().int().min(1, 'Au moins un voyageur est requis.').max(50, '50 voyageurs maximum.'),
  contact_name: z.string().trim().min(1, 'Le nom du contact est requis.').max(100),
  contact_email: z.email('Saisissez une adresse e-mail valide.'),
  contact_phone: z.string().trim().max(50, 'Le téléphone est trop long.'),
  options: bookingOptionsSchema,
}).refine(({ start_date, end_date }) => end_date > start_date, {
  path: ['end_date'], message: 'La date de retour doit être postérieure au départ.',
})

export type CircuitBookingValues = z.infer<typeof circuitBookingSchema>
export type CircuitBookingFormValues = z.input<typeof circuitBookingSchema>
