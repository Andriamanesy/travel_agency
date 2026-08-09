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
import { Compass, HeartHandshake, ShieldCheck, Sparkles, ArrowRight, MapPin, CalendarDays, Users, Mail, Phone, MessageSquare, Globe, Send } from 'lucide-react'
import heroFallback from '@/assets/hero.png'
import { useFeaturedCircuits, useFeaturedDestinations, useHomeSettings } from '../hooks/useHomeFeatured'

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

export function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [authOpen, setAuthOpen] = useState(false)
  const [destination, setDestination] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [travelType, setTravelType] = useState('Circuit organisé')
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
  const searchCatalog = (event: FormEvent) => { event.preventDefault(); const params = new URLSearchParams(); if (destination.trim()) params.set('destination', destination.trim()); if (departureDate) params.set('date', departureDate); if (travelType) params.set('type', travelType); navigate(`/catalog?${params.toString()}`) }
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

      <section
        className="relative flex min-h-[86vh] items-center justify-center bg-cover bg-center px-6 py-24 text-white"
        style={{
          backgroundImage:
            `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.55)), url('${heroImage}')`,
        }}
      >
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">TravelMS</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">{authenticated && firstName ? `Ravi de vous revoir, ${firstName} ! Où souhaitez-vous partir ?` : hero?.title || 'Explorez le Monde avec Nous'}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-100 sm:text-xl">
            {hero?.subtitle || "Des circuits sur-mesure d'exception"}
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
                <select value={travelType} onChange={(event) => setTravelType(event.target.value)} className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none">
                  <option value="">Hôtel, Circuit...</option>
                  <option>Circuit organisé</option>
                  <option>Hébergement</option>
                </select>
              </div>
              <button className="rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white transition hover:bg-emerald-800">
                Rechercher
              </button>
            </form>
          </div>
          <Link to={hero?.ctaLink || '/catalog/circuits'} className="mt-6 inline-flex rounded-xl border border-white/70 bg-white/10 px-5 py-3 font-bold text-white backdrop-blur transition hover:bg-white hover:text-slate-900">{hero?.ctaText || 'Découvrir nos circuits'}</Link>
        </div>
      </section>

      {authenticated && <section className="mx-auto -mt-10 relative z-10 max-w-5xl px-6"><div className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-white p-5 shadow-xl shadow-emerald-950/10 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.25em] text-emerald-700">Votre prochain départ</p><p className="mt-1 font-bold text-slate-900">{upcoming ? `${upcoming.offer_title ?? 'Votre circuit'} · ${new Date(`${upcoming.start_date}T00:00:00`).toLocaleDateString('fr-FR')}` : 'Votre prochaine aventure reste à imaginer.'}</p></div><Link to={upcoming ? '/bookings' : '/dashboard'} className="shrink-0 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700">{upcoming ? 'Voir ma réservation' : 'Accéder à mon espace'}</Link></div></section>}
      
      {authenticated && !upcoming && <section className="mx-auto max-w-7xl px-6 pt-20"><div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[.3em] text-emerald-600">Inspirations</p><h2 className="mt-2 text-3xl font-black text-slate-900">Inspirations pour votre prochain voyage</h2><p className="mt-2 text-slate-600">Une sélection de circuits pensés pour vous faire repartir.</p></div><Link to="/catalog" className="font-bold text-emerald-700">Voir toutes les offres</Link></div><div className="grid gap-6 md:grid-cols-3">{inspirations.data?.circuits?.slice(0, 3).map((circuit) => <Link key={circuit.id} to={`/catalog/circuits/${circuit.id}`} className="group overflow-hidden rounded-3xl bg-slate-950 shadow-lg"><div className="h-44 overflow-hidden bg-slate-800">{circuit.cover_image && <img src={mediaUrl(circuit.cover_image)} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}</div><div className="p-5 text-white"><p className="text-lg font-black">{circuit.title ?? 'Circuit signature'}</p><p className="mt-2 text-sm text-slate-300">À partir de {Number(circuit.price ?? 0).toFixed(0)} €</p></div></Link>)}</div></section>}

      {/* --- DESIGN GLASSMORPHISM : CIRCUITS À LA UNE --- */}
      <section className="mx-auto max-w-7xl px-6 pt-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.35em] text-emerald-600">Circuits à la une</p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Des départs conçus pour l’aventure</h2>
          </div>
          <Link to="/catalog/circuits" className="font-bold text-emerald-700">Voir les circuits</Link>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredCircuits.isPending ? (
            Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-[36rem] rounded-[2.5rem]" />)
          ) : featuredCircuits.data?.circuits.length ? (
            featuredCircuits.data.circuits.map((circuit) => (
              <Link 
                key={circuit.id} 
                to={`/catalog/circuits/${circuit.id}`} 
                className="group relative flex min-h-[36rem] flex-col justify-end overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-xl"
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

                <div className="relative z-10 m-3 flex flex-col rounded-[2rem] border border-white/60 bg-white/55 p-6 text-slate-950 shadow-2xl backdrop-blur-md transition-all duration-300 group-hover:bg-white/65">
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-900">
                    <MapPin size={14} />
                    <span>{circuit.destination_title || 'Madagascar'}</span>
                  </div>
                  
                  <h3 className="mt-2 text-2xl font-black leading-tight text-slate-950">
                    {circuit.title}
                  </h3>
                  
                  <p className="mt-3 text-sm font-medium leading-relaxed text-slate-900 line-clamp-3">
                    Détendez-vous sur les plages de sable blanc, plongez dans des eaux cristallines et explorez les récifs coralliens lors d'un séjour idyllique.
                  </p>

                  <div className="mt-5 grid grid-cols-[1fr_1fr_auto] items-center gap-4 border-t border-slate-950/15 pt-4">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-700">Durée :</p>
                      <p className="font-bold text-slate-950">{circuit.duration_days} jours</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-700">Prix :</p>
                      <p className="font-bold text-slate-950">dès {Number(circuit.price).toFixed(0)} €</p>
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
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              Aucun circuit publié pour le moment. Revenez bientôt découvrir nos prochaines aventures.
            </div>
          )}
        </div>
      </section>

      <section id="destinations" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Destinations populaires</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Des escapades pensées pour chaque envie</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredDestinations.isPending ? Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-96" />) : featuredDestinations.data?.destinations.length ? featuredDestinations.data.destinations.map((destination) => (
            <article key={destination.id} className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="h-48 overflow-hidden">
                {destination.cover_image && <img src={mediaUrl(destination.cover_image)} alt={destination.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" />}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-black text-slate-900">{destination.title}</h3>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">dès {Number(destination.price).toFixed(0)} €</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">{destination.description}</p>
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{destination.circuit_count} circuit(s)</span>
                  <Link to={`/destinations/${destination.id}`} className="text-sm font-bold text-emerald-700">Voir l’offre</Link>
                </div>
              </div>
            </article>
          )) : <div className="col-span-full rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500">Aucune destination mise en avant pour le moment.</div>}
        </div>
      </section>

      <section id="experiences" className="border-t border-slate-100 bg-slate-50/70 px-6 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Expériences uniques</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Vivez des moments qui marquent</h2>
        </div>

        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = icons[feature.icon as keyof typeof icons] || Compass
            return <div key={`${feature.title}-${index}`} className="rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-lg">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon size={24} /></span>
              <h3 className="mt-5 text-lg font-black text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{feature.description}</p>
            </div>
          })}
        </div>
      </section>

      {/* --- SECTION CONTACT & INFOS COMPLÈTES --- */}
      <section id="contact" className="border-t border-slate-200 bg-slate-900 px-6 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
          {/* Colonne 1 : À propos */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">TravelMS</p>
            <h3 className="mt-2 text-2xl font-black">Votre agence de voyages à Madagascar</h3>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Spécialistes du sur-mesure, nous concevons des voyages d'exception pour vous faire vivre l'authentique beauté de la Grande Île en toute sérénité.
            </p>
          </div>

          {/* Colonne 2 : Coordonnées Directes */}
          <div className="space-y-4">
            <h4 className="text-base font-bold uppercase tracking-wider text-emerald-300">Contactez-nous</h4>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Mail size={18} className="text-emerald-400 shrink-0" />
              <span>contact@travelms.mg</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Phone size={18} className="text-emerald-400 shrink-0" />
              <span>+261 20 22 000 00 / +261 34 00 000 00</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <MessageSquare size={18} className="text-emerald-400 shrink-0" />
              <span>WhatsApp : +261 34 00 000 00</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <MapPin size={18} className="text-emerald-400 shrink-0" />
              <span>Antananarivo, Madagascar</span>
            </div>
          </div>

          {/* Colonne 3 : Liens & Réseaux Sociaux */}
          <div className="space-y-4">
            <h4 className="text-base font-bold uppercase tracking-wider text-emerald-300">Suivez nos aventures</h4>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-slate-300 transition hover:bg-emerald-600 hover:text-white">
                <Globe size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-slate-300 transition hover:bg-emerald-600 hover:text-white">
                <Send size={18} />
              </a>
            </div>
            <div className="pt-2 flex flex-col gap-2 text-sm">
              <a href="#destinations" className="text-slate-400 hover:text-emerald-400">Explorer les Destinations</a>
              <a href="#experiences" className="text-slate-400 hover:text-emerald-400">Nos Expériences Uniques</a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-7xl border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} TravelMS. Tous droits réservés.
        </div>
      </section>

      <AuthModal open={authOpen} initialMode={authMode === 'register' ? 'register' : 'login'} onClose={() => setAuthOpen(false)} onAuthenticated={() => { const roles = useSessionStore.getState().roles; navigate(requestedPath ?? (roles.includes('admin') || roles.includes('super_admin') ? '/admin' : '/'), { replace: true }) }} />
    </main>
  )
}