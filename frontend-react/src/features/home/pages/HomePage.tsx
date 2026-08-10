import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import { AuthModal } from '@/features/auth/components/AuthModal'
import { useSessionStore } from '@/features/auth/store/session.store'
import { Navbar } from '@/components/layout/Navbar'
import { useCustomerBookings } from '@/features/dashboard/hooks/useCustomerBookings'
import { useCatalog } from '@/features/catalog/hooks/useCatalog'
import { mediaUrl } from '@/lib/api-client'
import { Skeleton } from '@/components/feedback/Skeleton'
import { Compass, HeartHandshake, ShieldCheck, Sparkles, ArrowRight, MapPin, CalendarDays, Users, Star, Quote, Tag, Percent } from 'lucide-react'
import heroFallback from '@/assets/hero.png'
import { useFeaturedCircuits, useFeaturedDestinations, useHomeSettings } from '../hooks/useHomeFeatured'
import { SiteFooter } from '@/components/layout/SiteFooter'

const defaultFeatures = [
  {
    title: 'Plages Tropicales',
    description: 'Détente sur les lagons turquoise de Nosy Be et Sainte-Marie.',
    icon: 'Compass',
  },
  {
    title: 'Aventures & Treks',
    description: "Randonnées spectaculaires dans l'Isalo et l'Andringitra.",
    icon: 'ShieldCheck',
  },
  {
    title: 'Escapades Culturelles',
    description: 'Histoire des Hautes Terres, artisanat local et hospitalité malgache.',
    icon: 'HeartHandshake',
  },
  {
    title: 'Faune Endémique',
    description: 'Rencontre avec les lémuriens, caméléons et baobabs centenaires.',
    icon: 'Sparkles',
  },
]

// Témoignages clients (Preuve sociale)
const testimonials = [
  {
    name: 'Thomas & Julie M.',
    location: 'Paris, France',
    comment: "Un voyage sur-mesure magique à Madagascar. L'organisation était irréprochable du début à la fin !",
    rating: 5,
  },
  {
    name: 'Sarah L.',
    location: 'Lyon, France',
    comment: "La rencontre avec les lémuriens à Andasibe restera gravée à jamais. Merci à TravelMS pour leur écoute.",
    rating: 5,
  },
  {
    name: 'Marc D.',
    location: 'Genève, Suisse',
    comment: "Des paysages grandioses dans le sud et un accompagnement local d'une gentillesse incroyable.",
    rating: 5,
  },
]

export function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [authOpen, setAuthOpen] = useState(false)
  const [destination, setDestination] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [travelType, setTravelType] = useState('circuits')
  const user = useSessionStore((state) => state.user)
  const authenticated = useSessionStore((state) => state.status === 'authenticated')
  const isAdmin = useSessionStore((state) => state.roles.includes('admin') || state.roles.includes('super_admin'))
  const bookings = useCustomerBookings({ enabled: authenticated && !isAdmin })
  const upcoming = (bookings.data?.bookings ?? []).find((booking) => booking.status !== 'cancelled' && new Date(`${booking.start_date}T00:00:00`) >= new Date())
  const inspirations = useCatalog('circuits', '', authenticated && !isAdmin && !upcoming)
  const featuredDestinations = useFeaturedDestinations()
  const featuredCircuits = useFeaturedCircuits()
  const homeSettings = useHomeSettings()
  const hero = homeSettings.data?.hero
  const configuredFeatures = Array.isArray(homeSettings.data?.features) ? homeSettings.data.features.filter((feature) => feature?.isActive !== false) : []
  const features = configuredFeatures.length ? configuredFeatures : defaultFeatures
  const heroImage = hero?.bgImageUrl && /^(https?:\/\/|\/uploads\/|data:image\/)/i.test(hero.bgImageUrl) ? mediaUrl(hero.bgImageUrl) : heroFallback
  const icons = { Compass, ShieldCheck, HeartHandshake, Sparkles }
  const firstName = user?.name.trim().split(/\s+/)[0]

  const searchCatalog = (event: FormEvent) => { 
    event.preventDefault()
    const params = new URLSearchParams() 
    if (destination.trim()) params.set('destination', destination.trim()) 
    if (departureDate) params.set('date', departureDate) 
    navigate(`/catalog/${travelType}?${params.toString()}`) 
  }

  const requestedPath = (location.state as { from?: string; authMessage?: string } | null)?.from
  const authMessage = (location.state as { authMessage?: string } | null)?.authMessage
  const authMode = new URLSearchParams(location.search).get('auth')
  
  useEffect(() => {
    if (authMode === 'login' || authMode === 'register') setAuthOpen(true)
  }, [authMode])
  
  useEffect(() => {
    if (!authMessage) return
    useSessionStore.getState().showToast({ title: 'Accès sécurisé', message: authMessage, tone: 'info' })
    navigate(`${location.pathname}${location.search}`, { replace: true, state: requestedPath ? { from: requestedPath } : null })
  }, [authMessage, location.pathname, location.search, navigate, requestedPath])
  
  if (authenticated && isAdmin) return <Navigate to="/admin" replace />
  
  return (
    <main className="min-h-screen bg-white text-slate-800">
      <Navbar onAuthenticate={() => { setAuthOpen(true); navigate('/?auth=login', { replace: true, state: requestedPath ? { from: requestedPath } : null }) }} />

      {/* BANNIÈRE DE PROMOTION (Sous la Navbar) */}
      <div className="relative z-20 bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-2.5 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black shadow-sm">
              <Tag size={15} />
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-red-500/90 px-2 py-0.5 text-[11px] font-black uppercase text-white animate-pulse">
                -20% IMMÉDIAT
              </span>
              <span className="font-semibold text-slate-100">
                🎉 Offre Spéciale : Profitez de 20% de réduction sur nos circuits phares ce mois-ci !
              </span>
            </div>
          </div>
          <Link 
            to="/catalog/circuits" 
            className="group inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1 text-xs font-bold text-slate-950 transition hover:bg-amber-300"
          >
            <span>En profiter</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* HERO SECTION */}
      <section
        className="relative flex min-h-[86vh] items-center justify-center bg-cover bg-center px-6 py-24 text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.55)), url('${heroImage}')`,
        }}
      >
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">TravelMS</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">
            {authenticated && firstName ? `Ravi de vous revoir, ${firstName} ! Où souhaitez-vous partir ?` : hero?.title || 'Explorez le Monde avec Nous'}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-100 sm:text-xl">
            {hero?.subtitle || "Des circuits sur-mesure d'exception à Madagascar"}
          </p>

          <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-white p-3 shadow-2xl">
            <form onSubmit={searchCatalog} className="grid gap-3 md:grid-cols-[1.2fr_1fr_0.8fr_0.9fr]">
              <div className="rounded-xl border border-slate-200 px-3 py-2 text-left">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Destination</label>
                <input value={destination} onChange={(event) => setDestination(event.target.value)} className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none" placeholder="Ville, région..." />
              </div>
              <div className="rounded-xl border border-slate-200 px-3 py-2 text-left">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Date</label>
                <input value={departureDate} onChange={(event) => setDepartureDate(event.target.value)} type="date" className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-500 outline-none" />
              </div>
              <div className="rounded-xl border border-slate-200 px-3 py-2 text-left">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Type</label>
                <select value={travelType} onChange={(event) => setTravelType(event.target.value)} className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer">
                  <option value="circuits">Circuits</option>
                  <option value="hotels">Hébergements</option>
                  <option value="guides">Guides</option>
                </select>
              </div>
              <button type="submit" className="rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white transition hover:bg-emerald-800 shadow-md">
                Rechercher
              </button>
            </form>
          </div>
          <Link 
            to={hero?.ctaLink?.startsWith('/catalog') ? hero.ctaLink : '/catalog/circuits'} 
            className="mt-6 inline-flex rounded-xl border border-white/70 bg-white/10 px-5 py-3 font-bold text-white backdrop-blur transition hover:bg-white hover:text-slate-900 cursor-pointer"
          >
            {hero?.ctaText || 'Découvrir nos circuits'}
          </Link>
        </div>
      </section>

      {/* PROCHAIN DÉPART (SI CONNECTÉ) */}
      {authenticated && (
        <section className="mx-auto -mt-10 relative z-10 max-w-5xl px-6">
          <div className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-white p-5 shadow-xl shadow-emerald-950/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.25em] text-emerald-700">Votre prochain départ</p>
              <p className="mt-1 font-bold text-slate-900">{upcoming ? `${upcoming.offer_title ?? 'Votre circuit'} · ${new Date(`${upcoming.start_date}T00:00:00`).toLocaleDateString('fr-FR')}` : 'Votre prochaine aventure reste à imaginer.'}</p>
            </div>
            <Link to={upcoming ? '/bookings' : '/dashboard'} className="shrink-0 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700">
              {upcoming ? 'Voir ma réservation' : 'Accéder à mon espace'}
            </Link>
          </div>
        </section>
      )}

      {/* INSPIRATIONS (SI AUTHENTIFIÉ SANS RÉSERVATION) */}
      {authenticated && !upcoming && (
        <section className="mx-auto max-w-7xl px-6 pt-20">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[.3em] text-emerald-600">Inspirations</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">Inspirations pour votre prochain voyage</h2>
              <p className="mt-2 text-slate-600">Une sélection de circuits pensés pour vous faire repartir.</p>
            </div>
            <Link to="/catalog/circuits" className="font-bold text-emerald-700 hover:underline">Voir toutes les offres</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {inspirations.data?.circuits?.slice(0, 3).map((circuit) => (
              <Link key={circuit.id} to={`/catalog/circuits/${circuit.id}`} className="group overflow-hidden rounded-3xl bg-slate-950 shadow-lg">
                <div className="h-44 overflow-hidden bg-slate-800">
                  {circuit.cover_image && <img src={mediaUrl(circuit.cover_image)} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                </div>
                <div className="p-5 text-white">
                  <p className="text-lg font-black">{circuit.title ?? 'Circuit signature'}</p>
                  <p className="mt-2 text-sm text-slate-300">À partir de {Number(circuit.price ?? 0).toFixed(0)} €</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CIRCUITS À LA UNE */}
      <section className="mx-auto max-w-7xl px-6 pt-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.35em] text-emerald-600">Circuits à la une</p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Des départs conçus pour l’aventure</h2>
          </div>
          <Link to="/catalog/circuits" className="font-bold text-emerald-700 hover:underline">Voir tous les circuits</Link>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredCircuits.isPending ? (
            Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-[36rem] rounded-[2.5rem]" />)
          ) : featuredCircuits.data?.circuits.length ? (
            featuredCircuits.data.circuits.map((circuit) => {
              const currentPrice = Number(circuit.price)
              const originalPrice = circuit.original_price ? Number(circuit.original_price) : null
              
              // Le circuit est en promo SI originalPrice existe ET qu'il est supérieur au prix actuel
              const isPromo = Boolean(originalPrice && originalPrice > currentPrice)
              
              // Calcul du pourcentage réel de réduction s'il y en a une
              const discountPercent = isPromo 
                ? Math.round((((originalPrice as number) - currentPrice) / (originalPrice as number)) * 100) 
                : 0

              return (
                <Link 
                  key={circuit.id} 
                  to={`/catalog/circuits/${circuit.id}`} 
                  className="group relative flex min-h-[36rem] flex-col justify-end overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute inset-0">
                    {circuit.cover_image && (
                      <img 
                        src={mediaUrl(circuit.cover_image)} 
                        alt={circuit.title} 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    )}
                  </div>

                  {/* BADGE PROMOTION : S'affiche UNIQUEMENT si le circuit est vraiment en promo */}
                  {isPromo && (
                    <div className="absolute top-5 right-5 z-20 flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-black text-white shadow-xl ring-4 ring-white/20">
                      <Percent size={13} strokeWidth={3} />
                      <span>-{discountPercent}% OFF</span>
                    </div>
                  )}

                  <div className="relative z-10 m-3 flex flex-col rounded-[2rem] border border-white/60 bg-white/55 p-6 text-slate-950 shadow-2xl backdrop-blur-md transition-all duration-300 group-hover:bg-white/65">
                    <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-900">
                      <MapPin size={14} />
                      <span>{circuit.destination_title || 'Madagascar'}</span>
                    </div>
                    
                    <h3 className="mt-2 text-2xl font-black leading-tight text-slate-950">
                      {circuit.title}
                    </h3>
                    
                    <p className="mt-3 text-sm font-medium leading-relaxed text-slate-900 line-clamp-3">
                      Découvrez des paysages époustouflants et plongez au cœur de la culture locale avec ce circuit d'exception.
                    </p>

                    <div className="mt-5 grid grid-cols-[1fr_1.2fr_auto] items-center gap-3 border-t border-slate-950/15 pt-4">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-700">Durée :</p>
                        <p className="font-bold text-slate-950">{circuit.duration_days} jours</p>
                      </div>
                      
                      {/* GESTION DU PRIX DYNAMIQUE */}
                      <div>
                        <p className="text-[11px] font-semibold text-slate-700">
                          {isPromo ? 'Prix promo :' : 'Prix :'}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="font-black text-emerald-800 text-base">
                            {currentPrice.toFixed(0)} €
                          </span>
                          
                          {/* L'ancien prix barré s'affiche UNIQUEMENT s'il y a une promotion */}
                          {isPromo && originalPrice && (
                            <span className="text-xs text-slate-500 line-through decoration-red-500 decoration-2 font-semibold">
                              {originalPrice.toFixed(0)} €
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1.5 text-slate-600">
                        <CalendarDays size={18} />
                        <Users size={18} />
                      </div>
                    </div>

                    <div className="mt-4 border-t border-slate-950/15 pt-4">
                      <p className="text-[11px] font-semibold text-slate-700">Prochain départ :</p>
                      <p className="font-bold text-slate-950">
                        {circuit.next_departure ? new Date(`${circuit.next_departure}T00:00:00`).toLocaleDateString('fr-FR') : 'Départs à venir'}
                      </p>
                    </div>

                    <div className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-sm font-bold text-emerald-800 shadow-sm transition-all hover:bg-emerald-50">
                      Réserver mon aventure <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              Aucun circuit publié pour le moment. Revenez bientôt découvrir nos prochaines aventures.
            </div>
          )}
        </div>
      </section>

      {/* DESTINATIONS POPULAIRES */}
      <section id="destinations" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Destinations populaires</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Des escapades pensées pour chaque envie</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredDestinations.isPending ? (
            Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-96 rounded-3xl" />)
          ) : featuredDestinations.data?.destinations.length ? (
            featuredDestinations.data.destinations.map((destination) => (
              <article key={destination.id} className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="h-48 overflow-hidden">
                  {destination.cover_image && <img src={mediaUrl(destination.cover_image)} alt={destination.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" />}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-black text-slate-900">{destination.title}</h3>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">dès {Number(destination.price).toFixed(0)} €</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500 line-clamp-3">{destination.description}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{destination.circuit_count} circuit(s)</span>
                    <Link to={`/destinations/${destination.id}`} className="text-sm font-bold text-emerald-700 hover:underline">Voir l’offre</Link>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              Aucune destination mise en avant pour le moment.
            </div>
          )}
        </div>
      </section>

      {/* EXPÉRIENCES UNIQUES */}
      <section id="experiences" className="border-t border-slate-100 bg-slate-50/70 px-6 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Expériences uniques</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Vivez des moments qui marquent</h2>
        </div>

        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = icons[feature.icon as keyof typeof icons] || Compass
            return (
              <div key={`${feature.title}-${index}`} className="rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-lg border border-slate-100">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Icon size={24} />
                </span>
                <h3 className="mt-5 text-lg font-black text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* TÉMOIGNAGES CLIENTS (PREUVE SOCIALE) */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Témoignages</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Ce que nos voyageurs disent de nous</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div key={i} className="flex flex-col justify-between rounded-3xl bg-slate-50 p-8 border border-slate-100 shadow-sm relative">
              <Quote className="absolute top-6 right-6 text-emerald-200" size={32} />
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed italic">"{t.comment}"</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                <span className="text-xs text-slate-400">{t.location}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BANNIÈRE APPEL À L'ACTION (CTA) */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-16 text-center text-white md:px-16 shadow-2xl">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-emerald-600/20 blur-3xl"></div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Prêt à vivre l'aventure de votre vie ?</h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Nos experts locaux conçoivent le voyage qui vous ressemble. Contactez-nous dès aujourd'hui pour un devis personnalisé.
            </p>
            <div className="pt-2">
              <Link to="/catalog/circuits" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-8 py-4 font-bold text-white transition hover:bg-emerald-600 shadow-lg shadow-emerald-900/30">
                Explorer le catalogue <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />

      <AuthModal 
        open={authOpen} 
        initialMode={authMode === 'register' ? 'register' : 'login'} 
        onClose={() => setAuthOpen(false)} 
        onAuthenticated={() => { 
          const roles = useSessionStore.getState().roles
          navigate(requestedPath ?? (roles.includes('admin') || roles.includes('super_admin') ? '/admin' : '/'), { replace: true }) 
        }} 
      />
    </main>
  )
}