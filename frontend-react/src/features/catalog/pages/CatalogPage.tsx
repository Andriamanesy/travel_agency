import { useState, type FormEvent } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { mediaUrl } from '@/lib/api-client'
import { useCatalog } from '../hooks/useCatalog'
import { catalogEntities, type CatalogEntity, type CatalogItem } from '../types'

const labels: Record<CatalogEntity, [string, string]> = { circuits: ['CIRCUITS', 'Circuits touristiques'], hotels: ['HÉBERGEMENTS', 'Hôtels sélectionnés'], guides: ['ACCOMPAGNEMENT', 'Nos guides'], categories: ['CATÉGORIES', 'Explorer par catégorie'] }

export function CatalogPage() {
  const { entity = '' } = useParams(); const [params, setParams] = useSearchParams(); const destination = params.get('destination') ?? ''; const type = params.get('type') ?? ''; const date = params.get('date') ?? ''; const [input, setInput] = useState(destination)
  const isValidEntity = catalogEntities.includes(entity as CatalogEntity)
  const catalogEntity: CatalogEntity = isValidEntity ? entity as CatalogEntity : 'circuits'; const { data, isPending, isError } = useCatalog(catalogEntity, destination)
  if (!isValidEntity) return <Navigate to="/catalog/circuits" replace />
  const submit = (event: FormEvent) => { event.preventDefault(); const next = new URLSearchParams(params); if (input.trim()) next.set('destination', input.trim()); else next.delete('destination'); setParams(next) }
  const items = data?.[catalogEntity] ?? []
  return <main className="mx-auto max-w-7xl px-6 py-12"><Link to="/" className="font-semibold text-emerald-700">← TravelMS</Link><p className="mt-8 text-xs font-bold tracking-widest text-emerald-700">{labels[catalogEntity][0]}</p><h1 className="mt-2 text-4xl font-black">{labels[catalogEntity][1]}</h1><form onSubmit={submit} className="mt-8 flex max-w-xl gap-3"><input value={input} onChange={(event) => setInput(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3" placeholder="Destination ou expérience" /><button className="rounded-xl bg-slate-900 px-5 font-semibold text-white">Rechercher</button></form>{(destination || type || date) && <div className="mt-4 flex flex-wrap gap-2 text-sm"><span className="font-semibold text-slate-500">Filtres actifs :</span>{destination && <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-800">{destination}</span>}{type && <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">{type}</span>}{date && <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">Dès le {date}</span>}</div>}{isPending && <CatalogSkeleton />}{isError && <p role="alert" className="mt-6 text-red-700">Impossible de charger le catalogue.</p>}<div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <CatalogCard key={item.id} item={item} entity={catalogEntity} />)}</div>{!isPending && items.length === 0 && <p className="mt-10">Aucun résultat pour le moment.</p>}</main>
}

function CatalogSkeleton() { return <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="animate-pulse overflow-hidden rounded-3xl bg-white shadow-sm"><div className="h-48 bg-slate-200" /><div className="space-y-3 p-6"><div className="h-6 w-2/3 rounded bg-slate-200" /><div className="h-4 rounded bg-slate-100" /><div className="h-4 w-3/4 rounded bg-slate-100" /></div></div>)}</div> }

function CatalogCard({ item, entity }: { item: CatalogItem; entity: CatalogEntity }) {
  const image = mediaUrl(item.cover_image || item.avatar_url); const title = item.title || item.name || 'Sans titre'; const text = item.description || item.address || item.bio || ''; const price = item.price ?? item.price_per_night
  return <article className="overflow-hidden rounded-3xl bg-white shadow-sm">{image ? <img src={image} alt="" className="h-48 w-full object-cover" /> : <div className="h-48 bg-slate-200" />}<div className="p-6"><h2 className="text-xl font-bold">{title}</h2><p className="mt-2 line-clamp-3 text-sm text-slate-500">{text}</p>{price !== null && price !== undefined && <p className="mt-4 font-bold text-emerald-700">{Number(price).toFixed(2)} €</p>}{entity !== 'categories' && <Link className="mt-5 inline-block font-semibold text-emerald-700" to={`/catalog/${entity}/${item.id}`}>Voir le détail →</Link>}</div></article>
}
