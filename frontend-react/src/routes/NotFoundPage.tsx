import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return <main className="grid min-h-screen place-items-center p-6 text-center">
    <div><p className="text-6xl font-black text-emerald-700">404</p><h1 className="mt-3 text-2xl font-bold">Page introuvable</h1><Link className="mt-6 inline-block font-semibold text-emerald-700" to="/">Retour à l’accueil</Link></div>
  </main>
}
