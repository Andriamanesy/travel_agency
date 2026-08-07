import { z } from 'zod'

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''))

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis.').max(100),
  email: z.email('Saisissez une adresse e-mail valide.'),
  phone: optionalText(50),
  birthdate: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/, 'Saisissez une date valide.'),
  gender: optionalText(50),
  nationality: optionalText(100),
  country: optionalText(100),
  city: optionalText(100),
  postalCode: optionalText(20),
  address: optionalText(500),
  preferredLang: z.enum(['fr', 'en', 'es']),
})

export type ProfileValues = z.infer<typeof profileSchema>
