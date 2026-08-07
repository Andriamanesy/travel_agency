import { Link } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { SiteFooter } from '@/components/layout/SiteFooter'

export function NotFoundPage() {
  return <div className="flex min-h-screen flex-col bg-slate-50"><Navbar /><main className="grid flex-1 place-items-center p-6 text-center"><div><p className="text-6xl font-black text-emerald-700">404</p><h1 className="mt-3 text-2xl font-bold">Page introuvable</h1><p className="mt-2 text-slate-500">Cette destination n’existe plus ou a changé d’adresse.</p><Link className="mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white" to="/catalog/circuits">Retourner au catalogue</Link></div></main><SiteFooter /></div>
}
