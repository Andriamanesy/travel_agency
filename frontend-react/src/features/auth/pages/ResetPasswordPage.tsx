import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError } from '@/lib/api-client'
import { authService } from '../services/auth.service'
import { resetPasswordSchema, type ResetPasswordValues } from '../schemas/password.schema'
import { AuthCard, Field } from './RegisterPage'

export function ResetPasswordPage() {
  const [params] = useSearchParams(); const token = params.get('token')
  const mutation = useMutation({ mutationFn: (values: ResetPasswordValues) => authService.resetPassword(token ?? '', values) })
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) })
  if (!token) return <AuthCard title="Lien invalide"><p>Le lien de réinitialisation est incomplet ou invalide.</p><Link to="/forgot-password" className="action">Demander un nouveau lien</Link></AuthCard>
  if (mutation.isSuccess) return <AuthCard title="Mot de passe mis à jour"><p>Votre compte est à nouveau sécurisé. Connectez-vous avec vos nouveaux identifiants.</p><Link to="/login" className="action">Se connecter</Link></AuthCard>
  const error = mutation.error instanceof ApiError ? mutation.error.message : mutation.isError ? 'Mise à jour impossible.' : null
  return <AuthCard title="Nouveau mot de passe"><form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate><Field label="Nouveau mot de passe" error={errors.password?.message}><input {...register('password')} type="password" autoComplete="new-password" className="field" /></Field><Field label="Confirmer le mot de passe" error={errors.confirmPassword?.message}><input {...register('confirmPassword')} type="password" autoComplete="new-password" className="field" /></Field>{error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}<button disabled={mutation.isPending} className="action mt-6 w-full">{mutation.isPending ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}</button></form></AuthCard>
}
