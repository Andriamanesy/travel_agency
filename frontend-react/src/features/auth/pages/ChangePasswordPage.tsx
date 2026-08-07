import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '@/lib/api-client'
import { clearSession } from '@/lib/session'
import { authService } from '../services/auth.service'
import { changePasswordSchema, type ChangePasswordValues } from '../schemas/password.schema'
import { Field } from './RegisterPage'

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const mutation = useMutation({ mutationFn: authService.changePassword, onSuccess: () => { clearSession(); navigate('/login', { replace: true, state: { changedPassword: true } }) } })
  const { register, handleSubmit, formState: { errors } } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) })
  const error = mutation.error instanceof ApiError ? mutation.error.message : mutation.isError ? 'Mise à jour impossible.' : null
  return <section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><Link to="/profile" className="font-semibold text-emerald-700">← Mon profil</Link><h1 className="mt-5 text-3xl font-black">Changer le mot de passe</h1><p className="mt-2 text-slate-600">Vous serez déconnecté de tous vos appareils après la mise à jour.</p><form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="mt-6 space-y-4"><Field label="Mot de passe actuel" error={errors.currentPassword?.message}><input {...register('currentPassword')} type="password" autoComplete="current-password" className="field" /></Field><Field label="Nouveau mot de passe" error={errors.newPassword?.message}><input {...register('newPassword')} type="password" autoComplete="new-password" className="field" /></Field><Field label="Confirmer le nouveau mot de passe" error={errors.confirmPassword?.message}><input {...register('confirmPassword')} type="password" autoComplete="new-password" className="field" /></Field>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button disabled={mutation.isPending} className="action">{mutation.isPending ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}</button></form></section>
}
