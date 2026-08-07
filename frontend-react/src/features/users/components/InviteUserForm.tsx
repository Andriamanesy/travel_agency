import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ApiError } from '@/lib/api-client'
import { useInviteAgent } from '../hooks/useUsers'
import { inviteUserSchema, type InviteUserValues } from '../schemas/user.schema'

export function InviteUserForm() {
  const invitation = useInviteAgent()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteUserValues>({
    resolver: zodResolver(inviteUserSchema),
  })
  const message = invitation.error instanceof ApiError ? invitation.error.message : invitation.isError ? 'Impossible d’envoyer l’invitation.' : null

  return <form onSubmit={handleSubmit((values) => invitation.mutate(values, { onSuccess: () => reset() }))} noValidate className="mt-8 flex max-w-xl flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm">
    <label className="min-w-60 flex-1"><span className="sr-only">E-mail du collaborateur</span><input {...register('email')} type="email" autoComplete="email" placeholder="E-mail du collaborateur" className="field" /></label>
    <button disabled={invitation.isPending} className="rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white disabled:opacity-70">{invitation.isPending ? 'Envoi…' : 'Inviter un agent'}</button>
    {errors.email && <p role="alert" className="w-full text-sm text-red-700">{errors.email.message}</p>}
    {message && <p role="alert" className="w-full text-sm text-red-700">{message}</p>}
    {invitation.isSuccess && <p role="status" className="w-full text-sm text-emerald-700">Invitation envoyée.</p>}
  </form>
}
