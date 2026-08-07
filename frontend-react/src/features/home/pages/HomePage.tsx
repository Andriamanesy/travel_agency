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
import { useFeaturedCircuits, useFeaturedDestinations } from '../hooks/useHomeFeatured'

const experiences = [
  {
    title: 'Plages Tropicales',
    description: 'Détente sur les lagons turquoise de Nosy Be et Sainte-Marie.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Aventures & Treks',
    description: "Randonnées spectaculaires dans l'Isalo et l'Andringitra.",
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Escapades Culturelles',
    description: 'Histoire des Hautes Terres, artisanat local et hospitalité malgache.',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Faune Endémique',
    description: 'Rencontre avec les lémuriens, caméléons et baobabs centenaires.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
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
  const isAdmin = useSessionStore((state) => state.roles.includes('admin'))
  const bookings = useCustomerBookings({ enabled: authenticated && !isAdmin })
  const upcoming = (bookings.data?.bookings ?? []).find((booking) => booking.status !== 'cancelled' && new Date(`${booking.start_date}T00:00:00`) >= new Date())
  const inspirations = useCatalog('circuits', '', authenticated && !isAdmin && !upcoming)
  const featuredDestinations = useFeaturedDestinations()
  const featuredCircuits = useFeaturedCircuits()
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
            "linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.55)), url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1920&q=80')",
        }}
      >
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">TravelMS</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">{authenticated && firstName ? `Ravi de vous revoir, ${firstName} ! Où souhaitez-vous partir ?` : 'Explorez Madagascar avec des voyages pensés pour l’exception'}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-100 sm:text-xl">
            Découvrez des destinations inoubliables, des circuits uniques et des hébergements de prestige au cœur de la Grande Île.
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
        </div>
      </section>

      {authenticated && <section className="mx-auto -mt-10 relative z-10 max-w-5xl px-6"><div className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-white p-5 shadow-xl shadow-emerald-950/10 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.25em] text-emerald-700">Votre prochain départ</p><p className="mt-1 font-bold text-slate-900">{upcoming ? `${upcoming.offer_title ?? 'Votre circuit'} · ${new Date(`${upcoming.start_date}T00:00:00`).toLocaleDateString('fr-FR')}` : 'Votre prochaine aventure reste à imaginer.'}</p></div><Link to={upcoming ? '/bookings' : '/dashboard'} className="shrink-0 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700">{upcoming ? 'Voir ma réservation' : 'Accéder à mon espace'}</Link></div></section>}
      {authenticated && !upcoming && <section className="mx-auto max-w-7xl px-6 pt-20"><div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[.3em] text-emerald-600">Inspirations</p><h2 className="mt-2 text-3xl font-black text-slate-900">Inspirations pour votre prochain voyage</h2><p className="mt-2 text-slate-600">Une sélection de circuits pensés pour vous faire repartir.</p></div><Link to="/catalog" className="font-bold text-emerald-700">Voir toutes les offres</Link></div><div className="grid gap-6 md:grid-cols-3">{inspirations.data?.circuits?.slice(0, 3).map((circuit) => <Link key={circuit.id} to={`/catalog/circuits/${circuit.id}`} className="group overflow-hidden rounded-3xl bg-slate-950 shadow-lg"><div className="h-44 overflow-hidden bg-slate-800">{circuit.cover_image && <img src={mediaUrl(circuit.cover_image)} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}</div><div className="p-5 text-white"><p className="text-lg font-black">{circuit.title ?? 'Circuit signature'}</p><p className="mt-2 text-sm text-slate-300">À partir de {Number(circuit.price ?? 0).toFixed(0)} €</p></div></Link>)}</div></section>}

      <section className="mx-auto max-w-7xl px-6 pt-20"><div className="mb-10 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[.35em] text-emerald-600">Circuits à la une</p><h2 className="mt-3 text-3xl font-extrabold text-slate-900">Des départs conçus pour l’aventure</h2></div><Link to="/catalog/circuits" className="font-bold text-emerald-700">Voir les circuits</Link></div><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{featuredCircuits.isPending ? Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-80" />) : featuredCircuits.data?.circuits.length ? featuredCircuits.data.circuits.map((circuit) => <Link key={circuit.id} to={`/catalog/circuits/${circuit.id}`} className="group overflow-hidden rounded-3xl bg-slate-950 shadow-lg"><div className="h-48 bg-slate-800">{circuit.cover_image && <img src={mediaUrl(circuit.cover_image)} alt={circuit.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}</div><div className="p-5 text-white"><p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-300">{circuit.destination_title}</p><h3 className="mt-2 text-xl font-black">{circuit.title}</h3><p className="mt-2 text-sm text-slate-300">{circuit.duration_days} jours · dès {Number(circuit.price).toFixed(0)} €</p><p className="mt-2 text-xs text-slate-400">{circuit.next_departure ? `Prochain départ : ${new Date(`${circuit.next_departure}T00:00:00`).toLocaleDateString('fr-FR')}` : 'Départs à venir'}</p></div></Link>) : <div className="col-span-full rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500">Aucun circuit publié pour le moment. Revenez bientôt découvrir nos prochaines aventures.</div>}</div></section>

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
          {experiences.map((experience) => (
            <div key={experience.title} className="group rounded-3xl bg-white p-3 shadow-sm transition hover:shadow-lg">
              <div className="h-44 overflow-hidden rounded-2xl">
                <img src={experience.image} alt={experience.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900">{experience.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{experience.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer id="contact" className="border-t border-slate-200 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>TravelMS — Votre agence de voyages premium à Madagascar.</p>
          <div className="flex gap-5">
            <a href="#destinations" className="font-semibold text-emerald-700">Destinations</a>
            <a href="#experiences" className="font-semibold text-emerald-700">Expériences</a>
          </div>
        </div>
      </footer>
      <AuthModal open={authOpen} initialMode={authMode === 'register' ? 'register' : 'login'} onClose={() => setAuthOpen(false)} onAuthenticated={() => navigate(requestedPath ?? (useSessionStore.getState().roles.includes('admin') ? '/admin' : '/'), { replace: true })} />
    </main>
  )
}
