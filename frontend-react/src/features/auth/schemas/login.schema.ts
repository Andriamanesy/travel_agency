import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Saisissez une adresse e-mail valide.'),
  password: z.string().min(1, 'Le mot de passe est requis.'),
})

export type LoginValues = z.infer<typeof loginSchema>
