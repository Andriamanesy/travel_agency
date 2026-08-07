import { Link, Navigate, useLocation } from 'react-router-dom'

export function RegisterPage() {
  const location = useLocation()
  return <Navigate to="/?auth=register" replace state={location.state} />
}

/** Conteneur conservé pour les parcours e-mail (vérification, reset). */
export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) { return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><Link to="/" className="text-sm font-semibold text-emerald-700">← TravelMS</Link><h1 className="mt-6 text-3xl font-black">{title}</h1><div className="mt-6">{children}</div></section></main> }
export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="block text-sm font-semibold">{label}{children}{error && <span className="mt-1 block text-sm font-normal text-red-600">{error}</span>}</label> }
