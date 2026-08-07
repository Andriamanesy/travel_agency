import { z } from 'zod'

export const bookingSchema = z.object({
  start_date: z.string().min(1, 'La date de départ est requise.'),
  end_date: z.string().min(1, 'La date de retour est requise.'),
  participants_count: z.coerce.number().int().min(1, 'Au moins un participant est requis.').max(50, '50 participants maximum.'),
}).refine(({ start_date, end_date }) => !start_date || !end_date || end_date > start_date, {
  path: ['end_date'], message: 'La date de retour doit être postérieure au départ.',
})

export type BookingValues = z.infer<typeof bookingSchema>
export type BookingFormValues = z.input<typeof bookingSchema>
