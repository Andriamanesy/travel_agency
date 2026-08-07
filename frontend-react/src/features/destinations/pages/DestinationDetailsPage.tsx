import { Link, useParams } from 'react-router-dom'
import { mediaUrl } from '@/lib/api-client'
import { useDestination } from '../hooks/useDestinations'

export function DestinationDetailsPage() {
  const { destinationId = '' } = useParams()
  const { data, isPending, isError } = useDestination(destinationId)
  if (isPending) return <p>Chargement de la destination…</p>
  if (isError || !data) return <p role="alert">Destination introuvable.</p>
  const { destination } = data
  return <article className="mx-auto max-w-4xl"><Link to="/destinations" className="font-semibold text-emerald-700">← Destinations</Link>{mediaUrl(destination.image_url) && <img src={mediaUrl(destination.image_url)} alt="" className="mt-6 h-80 w-full rounded-3xl object-cover" />}<div className="mt-6 rounded-3xl bg-white p-8 shadow-sm"><p className="text-sm font-semibold text-emerald-700">{destination.location}</p><h1 className="mt-2 text-4xl font-black">{destination.title}</h1><p className="mt-5 whitespace-pre-line leading-8 text-slate-600">{destination.description}</p><p className="mt-6 text-2xl font-black text-emerald-700">À partir de {destination.price} €</p><Link to={`/bookings/new?destinationId=${destination.id}`} className="mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white">Réserver cette offre</Link></div></article>
}
