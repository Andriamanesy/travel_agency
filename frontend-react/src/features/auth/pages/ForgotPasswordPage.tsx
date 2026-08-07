import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { ApiError } from '@/lib/api-client'
import { authService } from '../services/auth.service'
import { emailSchema, type EmailValues } from '../schemas/password.schema'
import { AuthCard, Field } from './RegisterPage'

export function ForgotPasswordPage() {
  const mutation = useMutation({ mutationFn: authService.forgotPassword })
  const { register, handleSubmit, formState: { errors } } = useForm<EmailValues>({ resolver: zodResolver(emailSchema) })
  if (mutation.isSuccess) return <AuthCard title="Consultez votre e-mail"><p>Si cette adresse correspond à un compte, un lien de réinitialisation vient d’être envoyé.</p><Link to="/login" className="action">Retour à la connexion</Link></AuthCard>
  const error = mutation.error instanceof ApiError ? mutation.error.message : mutation.isError ? 'Envoi impossible.' : null
  return <AuthCard title="Mot de passe oublié"><p className="mb-6 text-slate-600">Nous vous enverrons les instructions de réinitialisation.</p><form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate><Field label="E-mail" error={errors.email?.message}><input {...register('email')} type="email" autoComplete="email" className="field" /></Field>{error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}<button disabled={mutation.isPending} className="action mt-6 w-full">{mutation.isPending ? 'Envoi…' : 'Envoyer le lien'}</button></form><Link to="/login" className="mt-6 inline-block text-sm font-semibold text-emerald-700">← Retour à la connexion</Link></AuthCard>
}
