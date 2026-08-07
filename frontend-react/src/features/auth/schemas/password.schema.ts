import { z } from 'zod'

export const passwordSchema = z.string()
  .min(12, 'Le mot de passe doit contenir au moins 12 caractères.')
  .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères.')
  .regex(/[a-z]/, 'Ajoutez au moins une minuscule.')
  .regex(/[A-Z]/, 'Ajoutez au moins une majuscule.')
  .regex(/\d/, 'Ajoutez au moins un chiffre.')
  .regex(/[^A-Za-z0-9\s]/, 'Ajoutez au moins un caractère spécial.')

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Le nom est requis.').max(100),
  email: z.email('Saisissez une adresse e-mail valide.'),
  password: passwordSchema,
  confirmPassword: z.string(),
  terms: z.literal(true, { error: 'Vous devez accepter les conditions.' }),
}).refine((values) => values.password === values.confirmPassword, { path: ['confirmPassword'], message: 'Les mots de passe ne correspondent pas.' })

export const emailSchema = z.object({ email: z.email('Saisissez une adresse e-mail valide.') })
export const resetPasswordSchema = z.object({ password: passwordSchema, confirmPassword: z.string() }).refine((values) => values.password === values.confirmPassword, { path: ['confirmPassword'], message: 'Les mots de passe ne correspondent pas.' })
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1, 'Le mot de passe actuel est requis.'), newPassword: passwordSchema, confirmPassword: z.string() }).refine((values) => values.newPassword === values.confirmPassword, { path: ['confirmPassword'], message: 'Les mots de passe ne correspondent pas.' })

export type RegisterValues = z.infer<typeof registerSchema>
export type EmailValues = z.infer<typeof emailSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
