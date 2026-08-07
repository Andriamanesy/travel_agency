import { useProfile } from '../hooks/useProfile'
import { Link } from 'react-router-dom'

export function ProfilePage() {
  const { data: profile, isPending, isError } = useProfile()
  if (isPending) return <p>Chargement du profil…</p>
  if (isError || !profile) return <p role="alert">Impossible de charger le profil.</p>
  return <section className="max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[.3em] text-emerald-600">Profil</p><h1 className="mt-3 text-3xl font-black">Mon profil</h1><dl className="mt-8 grid gap-4 rounded-2xl bg-slate-50 p-6"><div><dt className="text-sm font-semibold text-slate-500">Nom</dt><dd className="text-lg font-semibold">{profile.name}</dd></div><div><dt className="text-sm font-semibold text-slate-500">E-mail</dt><dd className="text-lg font-semibold">{profile.email}</dd></div><div><dt className="text-sm font-semibold text-slate-500">Téléphone</dt><dd className="text-lg font-semibold">{profile.phone || 'Non renseigné'}</dd></div></dl><Link to="/change-password" className="mt-6 inline-block font-semibold text-emerald-700">Changer mon mot de passe →</Link></section>
}
