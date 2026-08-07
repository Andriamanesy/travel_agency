import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ApiError } from '@/lib/api-client'
import { useLogin } from '../hooks/useLogin'
import { loginSchema, type LoginValues } from '../schemas/login.schema'

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })
  const login = useLogin()
  const submit = (values: LoginValues) => login.mutate(values, { onSuccess })
  const message = login.error instanceof ApiError ? login.error.message : login.isError ? 'Connexion impossible.' : null

  return <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
    <div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Connexion</p><h1 className="mt-2 text-2xl font-black">Accédez à votre espace</h1></div>
    <label className="flex flex-col gap-2 text-sm font-medium">Email<input {...register('email')} type="email" autoComplete="email" placeholder="vous@example.com" className="rounded-xl border border-slate-300 px-4 py-3" /></label>
    {errors.email && <p className="-mt-2 text-sm text-red-600">{errors.email.message}</p>}
    <label className="flex flex-col gap-2 text-sm font-medium">Mot de passe<input {...register('password')} type="password" autoComplete="current-password" placeholder="••••••••" className="rounded-xl border border-slate-300 px-4 py-3" /></label>
    {errors.password && <p className="-mt-2 text-sm text-red-600">{errors.password.message}</p>}
    {message && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p>}
    <button disabled={login.isPending} className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-70">{login.isPending ? 'Connexion…' : 'Se connecter'}</button>
  </form>
}
