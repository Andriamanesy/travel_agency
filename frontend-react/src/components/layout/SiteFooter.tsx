import { Link } from 'react-router-dom'

export function SiteFooter() {
  return <footer className="border-t border-slate-200 bg-white px-6 py-10"><div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between"><p>TravelMS — Votre agence de voyages premium à Madagascar.</p><div className="flex gap-5"><Link to="/catalog/circuits" className="font-semibold text-emerald-700">Catalogue</Link><Link to="/" className="font-semibold text-emerald-700">Accueil</Link></div></div></footer>
}
