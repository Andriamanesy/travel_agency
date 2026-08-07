import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/LoginForm'
import { getAccessToken } from '@/lib/session'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  if (getAccessToken()) return <Navigate to="/dashboard" replace />
  const destination = (location.state as { from?: string } | null)?.from ?? '/dashboard'
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
    <div className="w-full max-w-md"><Link className="mb-6 inline-block text-sm font-semibold text-emerald-700" to="/">← Retour à l’accueil</Link><LoginForm onSuccess={() => navigate(destination, { replace: true })} /><div className="mt-5 flex justify-between text-sm"><Link to="/forgot-password" className="font-semibold text-emerald-700">Mot de passe oublié ?</Link><Link to="/register" className="font-semibold text-emerald-700">Créer un compte</Link></div></div>
  </main>
}
