import { Link, Navigate, useParams } from 'react-router-dom'
import { mediaUrl } from '@/lib/api-client'
import { useCatalogItem } from '../hooks/useCatalog'
import { type CatalogEntity } from '../types'

const available = ['circuits', 'hotels', 'guides'] as const

export function CatalogDetailPage() {
  const { entity = '', itemId = '' } = useParams()
  const isValidEntity = available.includes(entity as typeof available[number])
  const type: Exclude<CatalogEntity, 'categories'> = isValidEntity ? entity as Exclude<CatalogEntity, 'categories'> : 'circuits'; const { data, isPending, isError } = useCatalogItem(type, itemId)
  if (!isValidEntity) return <Navigate to="/catalog/circuits" replace />
  if (isPending) return <main className="p-8">Chargement…</main>
  if (isError || !data) return <main className="p-8">Offre introuvable.</main>
  const item = data[type.slice(0, -1)]; const image = mediaUrl(item.cover_image || item.avatar_url); const price = item.price ?? item.price_per_night
  return <main className="mx-auto max-w-4xl px-6 py-12"><Link to={`/catalog/${type}`} className="font-semibold text-emerald-700">← Retour au catalogue</Link>{image && <img src={image} alt="" className="mt-7 h-96 w-full rounded-3xl object-cover" />}<section className="mt-8 rounded-3xl bg-white p-8 shadow-sm"><h1 className="text-4xl font-black">{item.title || item.name}</h1><p className="mt-5 whitespace-pre-line leading-8 text-slate-600">{item.description || item.bio || item.address}</p>{price !== null && price !== undefined && <p className="mt-6 text-2xl font-black text-emerald-700">{Number(price).toFixed(2)} €{type === 'hotels' ? ' / nuit' : ''}</p>}{type === 'circuits' && <Link to={`/booking/${item.id}`} className="mt-7 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white">Réserver ce circuit</Link>}</section></main>
}
