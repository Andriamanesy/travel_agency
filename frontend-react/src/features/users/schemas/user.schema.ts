import { z } from 'zod'
import { userRoles } from '../types'

export const inviteUserSchema = z.object({
  email: z.email('Saisissez une adresse e-mail valide.'),
})

export const userRoleSchema = z.object({
  role: z.enum(userRoles, 'Sélectionnez un rôle valide.'),
})

export type InviteUserValues = z.infer<typeof inviteUserSchema>
export type UserRoleValues = z.infer<typeof userRoleSchema>
