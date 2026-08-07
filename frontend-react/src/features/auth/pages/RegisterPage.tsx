import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { ApiError } from '@/lib/api-client'
import { authService } from '../services/auth.service'
import { registerSchema, type RegisterValues } from '../schemas/password.schema'
import { useMutation } from '@tanstack/react-query'

export function RegisterPage() {
  const registerAccount = useMutation({ mutationFn: authService.register })
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })
  if (registerAccount.isSuccess) return <AuthCard title="Vérifiez votre e-mail"><p>Votre compte a été créé. Consultez votre boîte e-mail pour l’activer avant de vous connecter.</p><Link to="/login" className="action">Aller à la connexion</Link></AuthCard>
  const error = registerAccount.error instanceof ApiError ? registerAccount.error.message : registerAccount.isError ? 'Inscription impossible.' : null
  return <AuthCard title="Créer un compte"><form onSubmit={handleSubmit((values) => registerAccount.mutate(values))} noValidate className="space-y-4"><Field label="Nom complet" error={errors.name?.message}><input {...register('name')} autoComplete="name" className="field" /></Field><Field label="E-mail" error={errors.email?.message}><input {...register('email')} type="email" autoComplete="email" className="field" /></Field><Field label="Mot de passe" error={errors.password?.message}><input {...register('password')} type="password" autoComplete="new-password" className="field" /></Field><p className="text-xs text-slate-500">12 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.</p><Field label="Confirmer le mot de passe" error={errors.confirmPassword?.message}><input {...register('confirmPassword')} type="password" autoComplete="new-password" className="field" /></Field><label className="flex gap-2 text-sm"><input {...register('terms')} type="checkbox" /> J’accepte les conditions générales.</label>{errors.terms && <p className="text-sm text-red-600">{errors.terms.message}</p>}{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={registerAccount.isPending} className="action w-full">{registerAccount.isPending ? 'Création…' : 'Créer mon compte'}</button></form><p className="mt-6 text-sm text-slate-600">Déjà un compte ? <Link to="/login" className="font-semibold text-emerald-700">Se connecter</Link></p></AuthCard>
}

export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) { return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><Link to="/" className="text-sm font-semibold text-emerald-700">← TravelMS</Link><h1 className="mt-6 text-3xl font-black">{title}</h1><div className="mt-6">{children}</div></section></main> }
export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="block text-sm font-semibold">{label}{children}{error && <span className="mt-1 block text-sm font-normal text-red-600">{error}</span>}</label> }
