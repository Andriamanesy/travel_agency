import { useState, useEffect, type FormEvent } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { mediaUrl } from '@/lib/api-client'
import { useCatalog } from '../hooks/useCatalog'
import { catalogEntities, type CatalogEntity, type CatalogItem } from '../types'
import { 
  Search, 
  Compass, 
  MapPin, 
  Calendar, 
  Users, 
  ArrowRight, 
  X, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { AuthModal } from '@/features/auth/components/AuthModal'

const ITEMS_PER_PAGE = 6

const labels: Record<CatalogEntity, [string, string]> = { 
  circuits: ['CIRCUITS', 'Circuits touristiques'], 
  hotels: ['HÉBERGEMENTS', 'Hôtels sélectionnés'], 
  guides: ['ACCOMPAGNEMENT', 'Nos guides'], 
  categories: ['CATÉGORIES', 'Explorer par catégorie'] 
}

type CatalogCardItem = CatalogItem & {
  destination_title?: string
  duration?: string
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'title-asc'

export function CatalogPage() {
  const { entity = '' } = useParams()
  const [params, setParams] = useSearchParams()
  
  // Lecture des paramètres de l'URL
  const destination = params.get('destination') ?? ''
  const type = params.get('type') ?? ''
  const date = params.get('date') ?? ''
  const sortBy = (params.get('sort') as SortOption) || 'default'
  const currentPage = Math.max(1, Number(params.get('page') ?? '1'))

  const [input, setInput] = useState(destination)
  const [authOpen, setAuthOpen] = useState(false)

  // Synchronise le champ texte si l'URL change externes (ex: retour navigateur)
  useEffect(() => {
    setInput(destination)
  }, [destination])

  const isValidEntity = catalogEntities.includes(entity as CatalogEntity)
  const catalogEntity: CatalogEntity = isValidEntity ? (entity as CatalogEntity) : 'circuits'
  const { data, isPending, isError } = useCatalog(catalogEntity, destination)

  if (!isValidEntity) return <Navigate to="/catalog/circuits" replace />

  const submit = (event: FormEvent) => { 
    event.preventDefault()
    const next = new URLSearchParams(params)
    if (input.trim()) next.set('destination', input.trim())
    else next.delete('destination')
    next.set('page', '1') // Réinitialise la page lors d'une recherche
    setParams(next) 
  }

  const handleSortChange = (newSort: SortOption) => {
    const next = new URLSearchParams(params)
    if (newSort !== 'default') next.set('sort', newSort)
    else next.delete('sort')
    next.set('page', '1')
    setParams(next)
  }

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(params)
    next.set('page', newPage.toString())
    setParams(next)
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  const resetFilters = () => {
    setInput('')
    setParams(new URLSearchParams())
  }

  const rawItems = (data?.[catalogEntity] ?? []) as CatalogCardItem[]

  // 1. Tri des éléments
  const sortedItems = [...rawItems].sort((a, b) => {
    const priceA = Number(a.price ?? (a as any).price_per_night ?? 0)
    const priceB = Number(b.price ?? (b as any).price_per_night ?? 0)
    const titleA = (a.title || a.name || '').toLowerCase()
    const titleB = (b.title || b.name || '').toLowerCase()

    if (sortBy === 'price-asc') return priceA - priceB
    if (sortBy === 'price-desc') return priceB - priceA
    if (sortBy === 'title-asc') return titleA.localeCompare(titleB)
    return 0
  })

  // 2. Pagination
  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE)
  const safePage = Math.min(currentPage, totalPages || 1)
  const paginatedItems = sortedItems.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  )

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar onAuthenticate={() => setAuthOpen(true)} />

        {/* En-tête de page */}
        <section className="bg-slate-900 text-white py-20 px-6 pt-32 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-600/25 blur-3xl pointer-events-none" />
          <div className="mx-auto max-w-7xl relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-400 mb-3">
              <Compass size={16} />
              <span>{labels[catalogEntity][0]}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{labels[catalogEntity][1]}</h1>
            <p className="mt-4 text-slate-400 text-lg max-w-xl">
              Découvrez notre sélection exclusive et préparez votre prochaine escapade en toute sérénité.
            </p>

            {/* Barre de recherche */}
            <form onSubmit={submit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-3 px-4 py-2 flex-grow">
                <Search size={20} className="text-emerald-400 shrink-0" />
                <input 
                  value={input} 
                  onChange={(event) => setInput(event.target.value)} 
                  className="w-full bg-transparent text-white placeholder-slate-400 text-sm outline-none" 
                  placeholder="Destination ou mot-clé..." 
                  aria-label="Destination ou mot-clé"
                />
              </div>
              <button 
                type="submit" 
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-emerald-900/25 text-sm cursor-pointer"
              >
                Rechercher
              </button>
            </form>
          </div>
        </section>

        {/* Onglets Catalogue */}
        <div className="border-b border-slate-200 bg-white sticky top-20 z-40 shadow-xs">
          <div className="mx-auto max-w-7xl px-6 flex gap-2 overflow-x-auto py-3 no-scrollbar">
            {catalogEntities.map((ent) => {
              const isActive = catalogEntity === ent
              return (
                <Link
                  key={ent}
                  to={`/catalog/${ent}`}
                  className={`rounded-xl px-5 py-2.5 text-sm font-bold whitespace-nowrap transition-all ${
                    isActive 
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {labels[ent][1]}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Section Contenu */}
        <section className="mx-auto max-w-7xl px-6 py-10">
          
          {/* Filtres actifs & Contrôle du Tri */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            
            {/* Badges de filtres actifs */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-slate-500 mr-1">
                {rawItems.length} résultat{rawItems.length > 1 ? 's' : ''}
              </span>
              
              {destination && <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-800">Destination : {destination}</span>}
              {type && <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">Type : {type}</span>}
              {date && <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">Dès le {date}</span>}

              {(destination || type || date) && (
                <button 
                  onClick={resetFilters}
                  className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer ml-2"
                >
                  <X size={14} /> Réinitialiser
                </button>
              )}
            </div>

            {/* Menu Déroulant de Tri */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <ArrowUpDown size={16} className="text-slate-400 shrink-0" />
              <label htmlFor="sort-select" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trier par :</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="default">Par défaut</option>
                <option value="price-asc">Prix : croissant</option>
                <option value="price-desc">Prix : décroissant</option>
                <option value="title-asc">Nom : A-Z</option>
              </select>
            </div>
          </div>

          {isPending && <CatalogSkeleton />}
          
          {isError && (
            <div role="alert" className="text-center py-20 text-red-600 font-medium">
              Impossible de charger le catalogue. Veuillez réessayer ultérieurement.
            </div>
          )}

          {/* Grille de cartes paginées */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedItems.map((item) => (
              <CatalogCard key={item.id} item={item} entity={catalogEntity} />
            ))}
          </div>

          {!isPending && rawItems.length === 0 && (
            <div className="text-center py-20 text-slate-500 font-medium bg-white rounded-3xl border border-slate-100 shadow-sm">
              Aucun résultat trouvé pour votre recherche. Essayez d'autres critères.
            </div>
          )}

          {/* Contrôles de Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(safePage - 1)}
                disabled={safePage === 1}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                aria-label="Page précédente"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`h-10 w-10 rounded-xl text-sm font-bold transition cursor-pointer ${
                    safePage === pageNum
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(safePage + 1)}
                disabled={safePage === totalPages}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                aria-label="Page suivante"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

        </section>
      </div>

      <SiteFooter />

      <AuthModal 
        open={authOpen} 
        initialMode="login" 
        onClose={() => setAuthOpen(false)} 
        onAuthenticated={() => setAuthOpen(false)} 
      />
    </main>
  )
}

function CatalogSkeleton() { 
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="animate-pulse h-[520px] rounded-[2.5rem] bg-slate-200 shadow-sm" />
      ))}
    </div>
  ) 
}

function CatalogCard({ item, entity }: { item: CatalogCardItem; entity: CatalogEntity }) {
  const image = mediaUrl(item.cover_image || item.avatar_url)
  const title = item.title || item.name || 'Sans titre'
  const text = item.description || item.address || item.bio || ''
  const price = item.price ?? item.price_per_night
  const destinationTitle = item.destination_title || 'Madagascar'

  return (
    <article className="group relative h-[520px] overflow-hidden rounded-[2.5rem] shadow-xl transition-all duration-500 hover:-translate-y-1 bg-slate-900">
      {image ? (
        <img 
          src={image} 
          alt={title} 
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
      ) : (
        <div className="absolute inset-0 bg-slate-800" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

      {/* Carte Glassmorphism */}
      <div className="absolute inset-x-4 bottom-4 top-28 flex flex-col justify-between rounded-[2rem] bg-white/80 p-6 backdrop-blur-md border border-white/50 shadow-lg">
        <div>
          {entity === 'circuits' && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-800 mb-2">
              <MapPin size={13} />
              <span>{destinationTitle}</span>
            </div>
          )}

          <h2 className="text-2xl font-black text-slate-900 leading-tight">
            {title}
          </h2>
          
          <p className="mt-2.5 text-xs leading-relaxed text-slate-600 line-clamp-3">
            {text}
          </p>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-900/10">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">
                {entity === 'hotels' ? 'Type :' : entity === 'guides' ? 'Expérience :' : 'Durée :'}
              </span>
              <span className="font-bold text-slate-900">
                {entity === 'hotels' ? 'Hébergement' : entity === 'guides' ? 'Guide Expert' : (item.duration || '7 jours')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">
                {entity === 'hotels' ? 'Par nuit :' : 'Prix :'}
              </span>
              <span className="font-bold text-slate-900">
                {price !== null && price !== undefined ? `dès ${Number(price).toFixed(0)} €` : 'Sur devis'}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Disponibilité : <strong className="text-slate-800 font-semibold">Garantie</strong></span>
            <div className="flex gap-1 text-slate-400">
              <Calendar size={14} />
              <Users size={14} />
            </div>
          </div>

          {entity !== 'categories' ? (
            <Link 
              to={`/catalog/${entity}/${item.id}`} 
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-md cursor-pointer"
            >
              <span>{entity === 'guides' ? 'Voir le profil' : entity === 'hotels' ? 'Réserver l’hôtel' : 'Réserver mon aventure'}</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <div className="h-10" />
          )}
        </div>
      </div>
    </article>
  )
}