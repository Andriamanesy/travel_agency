import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState, type ReactNode } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { z } from 'zod'
import { ApiError } from '@/lib/api-client'
import { useLogin } from '../hooks/useLogin'
import { useRegister } from '../hooks/useRegister'
import { passwordSchema } from '../schemas/password.schema'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/session.store'

const modalLoginSchema = z.object({ email: z.email('Saisissez une adresse e-mail valide.'), password: z.string().min(1, 'Le mot de passe est requis.'), remember: z.boolean() })
const modalRegisterSchema = z.object({ firstName: z.string().trim().min(2, 'Le prénom est requis.').max(60), lastName: z.string().trim().min(2, 'Le nom est requis.').max(60), email: z.email('Saisissez une adresse e-mail valide.'), password: passwordSchema, confirmPassword: z.string(), terms: z.literal(true, { error: 'Vous devez accepter les conditions.' }) }).refine((values) => values.password === values.confirmPassword, { path: ['confirmPassword'], message: 'Les mots de passe ne correspondent pas.' })
type Mode = 'login' | 'register'
type LoginValues = z.infer<typeof modalLoginSchema>
type RegisterValues = z.infer<typeof modalRegisterSchema>

interface AuthModalProps {
  open: boolean
  initialMode?: Mode
  redirectTo?: string
  onClose: () => void
  onToast?: (message: string) => void
  onAuthenticated?: () => void
  onNotice?: (message: string) => void
}

export function AuthModal({ open, initialMode = 'login', redirectTo = '/dashboard', onClose, onToast, onAuthenticated, onNotice }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const navigate = useNavigate()
  const login = useLogin()
  const registerAccount = useRegister()
  useEffect(() => { if (open) setMode(initialMode) }, [open, initialMode])
  useEffect(() => { if (!open) return; const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }; document.addEventListener('keydown', onKeyDown); document.body.style.overflow = 'hidden'; return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = '' } }, [open, onClose])
  if (!open) return null

  const notify = (message: string) => { onToast?.(message); onNotice?.(message) }
  const onLogin = (values: LoginValues) => login.mutate(values, { onSuccess: () => { notify('Connexion réussie. Bon voyage !'); onAuthenticated?.(); onClose(); if (!onAuthenticated) navigate(redirectTo, { replace: true }) } })
  const onRegister = (values: RegisterValues) => registerAccount.mutate({ name: `${values.firstName} ${values.lastName}`, email: values.email, password: values.password }, { onSuccess: () => { useSessionStore.getState().showWelcome({ title: `Bienvenue, ${values.firstName} !`, message: 'Votre compte est créé. Vérifiez votre e-mail pour l’activer.', admin: false }); notify('Compte créé. Vérifiez votre e-mail pour l’activer.'); onClose() } })
  const error = (login.error instanceof ApiError ? login.error.message : login.isError ? 'Connexion impossible.' : null) || (registerAccount.error instanceof ApiError ? registerAccount.error.message : registerAccount.isError ? 'Inscription impossible.' : null)

  return <div role="presentation" className="fixed inset-0 z-[100] grid place-items-center p-4 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" /><section role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" className="relative max-h-[min(760px,calc(100vh-2rem))] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-white/60 bg-white/95 p-6 shadow-2xl shadow-slate-950/30 transition duration-300 sm:p-9"><button type="button" aria-label="Fermer" onClick={onClose} className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full text-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-800">×</button><div className="mb-7 pr-10"><p className="text-xs font-black uppercase tracking-[.3em] text-emerald-600">TravelMS · Madagascar</p><h2 id="auth-modal-title" className="mt-2 text-3xl font-black tracking-tight text-slate-950">{mode === 'login' ? 'Votre prochaine aventure commence ici' : 'Créez votre espace voyageur'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{mode === 'login' ? 'Retrouvez vos réservations et vos escapades en un instant.' : 'Un compte simple, sécurisé et pensé pour vos voyages.'}</p></div><div className="mb-7 grid grid-cols-2 rounded-2xl bg-slate-100 p-1" role="tablist"><Tab active={mode === 'login'} onClick={() => setMode('login')}>Connexion</Tab><Tab active={mode === 'register'} onClick={() => setMode('register')}>Créer un compte</Tab></div>{mode === 'login' ? <LoginModalForm pending={login.isPending} error={error} onSubmit={onLogin} /> : <RegisterModalForm pending={registerAccount.isPending} error={error} onSubmit={onRegister} />}</section></div>
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) { return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`rounded-xl px-3 py-3 text-sm font-bold transition ${active ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{children}</button> }

function LoginModalForm({ pending, error, onSubmit }: { pending: boolean; error: string | null; onSubmit: (values: LoginValues) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({ resolver: zodResolver(modalLoginSchema), mode: 'onChange', defaultValues: { remember: true } })
  return <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5"><Field label="Adresse e-mail" error={errors.email?.message}><Input {...register('email')} type="email" autoComplete="email" placeholder="vous@example.com" /></Field><PasswordField label="Mot de passe" error={errors.password?.message} registration={register('password')} autoComplete="current-password" /><label className="flex items-center gap-2 text-sm text-slate-500"><input {...register('remember')} type="checkbox" className="accent-emerald-600" /> Se souvenir de moi <span className="text-xs text-slate-400">(7 jours)</span></label>{error && <ErrorMessage>{error}</ErrorMessage>}<SubmitButton pending={pending}>{pending ? 'Connexion…' : 'Se connecter'}</SubmitButton><p className="text-center text-xs text-slate-400">Vos données sont protégées par une session sécurisée.</p></form>
}

function RegisterModalForm({ pending, error, onSubmit }: { pending: boolean; error: string | null; onSubmit: (values: RegisterValues) => void }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterValues>({ resolver: zodResolver(modalRegisterSchema), mode: 'onChange' })
  const password = watch('password', '')
  return <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Prénom" error={errors.firstName?.message}><Input {...register('firstName')} autoComplete="given-name" placeholder="Amina" /></Field><Field label="Nom" error={errors.lastName?.message}><Input {...register('lastName')} autoComplete="family-name" placeholder="Rakoto" /></Field></div><Field label="Adresse e-mail" error={errors.email?.message}><Input {...register('email')} type="email" autoComplete="email" placeholder="vous@example.com" /></Field><PasswordField label="Mot de passe" error={errors.password?.message} registration={register('password')} autoComplete="new-password" /><PasswordStrength password={password} /><PasswordField label="Confirmation" error={errors.confirmPassword?.message} registration={register('confirmPassword')} autoComplete="new-password" /><label className="flex items-start gap-2 text-xs leading-5 text-slate-500"><input {...register('terms')} type="checkbox" className="mt-1 accent-emerald-600" /> J’accepte les conditions générales et la politique de confidentialité.</label>{errors.terms && <p className="-mt-2 text-xs font-medium text-red-600">{errors.terms.message}</p>}{error && <ErrorMessage>{error}</ErrorMessage>}<SubmitButton pending={pending}>{pending ? 'Création…' : 'Créer mon compte'}</SubmitButton></form>
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) { return <label className="block text-sm font-bold text-slate-700">{label}{children}{error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}</label> }
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" /> }
function PasswordField({ label, error, registration, autoComplete }: { label: string; error?: string; registration: UseFormRegisterReturn; autoComplete: string }) {
  const [visible, setVisible] = useState(false)
  return <Field label={label} error={error}><span className="relative block"><Input {...registration} type={visible ? 'text' : 'password'} autoComplete={autoComplete} placeholder="••••••••••••" /><button type="button" aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} onClick={() => setVisible(!visible)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-700">{visible ? '◉' : '◌'}</button></span></Field>
}
function PasswordStrength({ password }: { password: string }) { const checks = [{ label: '12 caractères', ok: password.length >= 12 }, { label: 'Majuscule et minuscule', ok: /[A-Z]/.test(password) && /[a-z]/.test(password) }, { label: 'Chiffre', ok: /\d/.test(password) }, { label: 'Caractère spécial', ok: /[^A-Za-z0-9\s]/.test(password) }]; const score = checks.filter((check) => check.ok).length; return <div className="rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="mb-2 flex gap-1">{checks.map((check) => <span key={check.label} className={`h-1.5 flex-1 rounded-full ${check.ok ? 'bg-emerald-500' : 'bg-slate-200'}`} />)}</div><div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-500">{checks.map((check) => <span key={check.label} className={check.ok ? 'font-semibold text-emerald-700' : ''}>{check.ok ? '✓' : '·'} {check.label}</span>)}</div><p className="mt-2 text-[11px] font-semibold text-slate-400">{score === 4 ? 'Mot de passe robuste' : 'Renforcez votre mot de passe'}</p></div> }
function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) { return <button disabled={pending} className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-950 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-70">{pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}{children}</button> }
function ErrorMessage({ children }: { children: ReactNode }) { return <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-700">{children}</p> }
