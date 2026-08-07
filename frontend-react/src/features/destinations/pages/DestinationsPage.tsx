import { Link } from 'react-router-dom'
import { mediaUrl } from '@/lib/api-client'
import { useDestinations } from '../hooks/useDestinations'

export function DestinationsPage() {
  const { data, isPending, isError } = useDestinations()
  return <div className="space-y-6">
    <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[.3em] text-emerald-600">Exploration</p><h1 className="mt-2 text-3xl font-black">Destinations premium</h1><p className="mt-2 text-slate-600">Explorez nos séjours à Madagascar.</p></section>
    {isPending && <p>Chargement des destinations…</p>}
    {isError && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">Impossible de charger les destinations.</p>}
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {data?.destinations.map((destination) => <article key={destination.id} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        {mediaUrl(destination.image_url) && <img src={mediaUrl(destination.image_url)} alt="" className="h-48 w-full object-cover" />}
        <div className="p-6"><div className="flex justify-between gap-3"><div><h2 className="text-lg font-black">{destination.title}</h2><p className="text-sm text-slate-500">{destination.location}</p></div><span className="font-semibold text-emerald-700">{destination.price} €</span></div><p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{destination.description}</p><Link to={`/destinations/${destination.id}`} className="mt-5 inline-block font-semibold text-emerald-700">Voir le détail →</Link></div>
      </article>)}</div>
  </div>
}
