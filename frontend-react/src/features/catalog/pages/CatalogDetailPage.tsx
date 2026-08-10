import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { mediaUrl } from '@/lib/api-client'
import { useCatalogItem } from '../hooks/useCatalog'
import { type CatalogEntity } from '../types'
import { MapPin, CalendarDays, Users, ArrowLeft, Info, Compass, ShieldCheck, Camera, X, ChevronLeft, ChevronRight, Navigation } from 'lucide-react'
import { Skeleton } from '@/components/feedback/Skeleton'
import { Navbar } from '@/components/layout/Navbar'
import { SiteFooter } from '@/components/layout/SiteFooter' // <--- Import du Footer
import { AuthModal } from '@/features/auth/components/AuthModal'

const available = ['circuits', 'hotels', 'guides'] as const

const bookingOptions = {
  dates: ['Septembre 15-22, 2024', 'Octobre 10-17, 2024', 'Novembre 05-12, 2024'],
  maxTravelers: 12,
  highlights: [
    { title: 'Nature sauvage', desc: 'Plongée dans la réserve marine.', icon: Compass },
    { title: 'Faune endémique', desc: 'Rencontre avec les lémuriens.', icon: ShieldCheck },
  ],
  itinerary: [
    { day: 1, title: 'Arrivée & Accueil', desc: 'Transfert de l\'aéroport à votre hébergement et briefing.' },
    { day: 2, title: 'Découverte de la région', desc: 'Journée d\'exploration des sites emblématiques locaux.' },
    { day: 3, title: 'Immersion Culturelle', desc: 'Rencontre avec la population et découverte de l\'artisanat.' },
    { day: 4, title: 'Départ', desc: 'Temps libre avant le transfert vers l\'aéroport.' },
  ],
}

// Fallback d'images si le backend ne retourne pas de galerie
const fallbackGallery = [
  'https://images.unsplash.com/photo-1553603227-2366a99ce714?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1523688882641-9c71fcc23a23?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517400508447-f8dd518b86db?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1473177104440-ffee2f376098?auto=format&fit=crop&q=80',
]

export function CatalogDetailPage() {
  const { entity = '', itemId = '' } = useParams()
  
  const [authOpen, setAuthOpen] = useState(false)
  
  // États pour la Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  
  const isValidEntity = available.includes(entity as typeof available[number])
  const type: Exclude<CatalogEntity, 'categories'> = isValidEntity ? entity as Exclude<CatalogEntity, 'categories'> : 'circuits'
  const { data, isPending, isError } = useCatalogItem(type, itemId)

  const [selectedDate, setSelectedDate] = useState(bookingOptions.dates[0])
  const [travelers, setTravelers] = useState(2)

  if (!isValidEntity) return <Navigate to="/catalog/circuits" replace />
  if (isPending) return (
    <main className="min-h-screen bg-slate-50/50 p-6 pt-24 flex flex-col justify-between">
      <div>
        <Navbar onAuthenticate={() => setAuthOpen(true)} />
        <div className="mx-auto max-w-7xl mt-12">
          <Skeleton className="h-10 w-40 mb-10 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <Skeleton className="lg:col-span-2 h-[40rem] rounded-[2.5rem]" />
            <Skeleton className="h-[30rem] rounded-[2.5rem]" />
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  )
  if (isError || !data) return (
    <main className="flex min-h-screen flex-col justify-between bg-slate-50">
      <Navbar onAuthenticate={() => setAuthOpen(true)} />
      <div className="flex flex-1 items-center justify-center p-8 text-center text-slate-600 font-medium">
        Offre introuvable.
      </div>
      <SiteFooter />
    </main>
  )

  const item = data[type.slice(0, -1)]
  const coverImage = item.cover_image || item.avatar_url ? mediaUrl(item.cover_image || item.avatar_url) : fallbackGallery[0]
  const price = item.price ?? item.price_per_night
  const destinationTitle = (item as any).destination_title || 'Madagascar'
  
  // Récupération de la galerie d'images du backend, sinon utilisation du fallback
  const itemImages = (item as any).images
  const galleryImages: string[] = itemImages?.length > 0 
    ? itemImages.map((img: string) => mediaUrl(img)) 
    : fallbackGallery

  // Fonctions de navigation de la Lightbox
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const prevImage = () => {
    setLightboxIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
  }

  const nextImage = () => {
    setLightboxIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
  }

  if (type !== 'circuits') {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
            <div>
              <Navbar onAuthenticate={() => setAuthOpen(true)} />
              <div className="mx-auto max-w-4xl px-6 pt-32 pb-20">
                <Link to={`/catalog/${type}`} className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700 hover:text-emerald-800 transition">← Retour</Link>
                {coverImage && <img src={coverImage} alt="" className="mt-8 h-[30rem] w-full rounded-[2.5rem] object-cover shadow-xl" />}
                
                {galleryImages.length > 1 && (
                  <div className="mt-6 flex gap-4 overflow-x-auto pb-4 snap-x">
                    {galleryImages.slice(1).map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`Galerie ${idx + 1}`} 
                        className="h-40 w-56 flex-shrink-0 object-cover rounded-2xl shadow-sm snap-center cursor-pointer hover:opacity-90 transition" 
                        onClick={() => openLightbox(idx + 1)}
                      />
                    ))}
                  </div>
                )}

                <section className="mt-8 rounded-[2.5rem] bg-white p-10 shadow-sm border border-slate-100">
                    <h1 className="text-4xl font-extrabold text-slate-900">{item.title || item.name}</h1>
                    <p className="mt-6 whitespace-pre-line leading-relaxed text-slate-600">{item.description || item.bio || item.address}</p>
                    {price !== null && price !== undefined && <p className="mt-8 text-3xl font-black text-emerald-700">{Number(price).toFixed(2)} €{type === 'hotels' ? ' / nuit' : ''}</p>}
                </section>
              </div>
            </div>
            
            <SiteFooter />
            
            <AuthModal open={authOpen} initialMode="login" onClose={() => setAuthOpen(false)} onAuthenticated={() => { setAuthOpen(false) }} />
            
            {lightboxOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm p-4">
                <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white transition p-2">
                  <X size={32} />
                </button>
                <button onClick={prevImage} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition">
                  <ChevronLeft size={32} />
                </button>
                <img src={galleryImages[lightboxIndex]} alt="Aperçu" className="max-h-[90vh] max-w-full rounded-2xl object-contain" />
                <button onClick={nextImage} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition">
                  <ChevronRight size={32} />
                </button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-semibold tracking-widest text-white/70">
                  {lightboxIndex + 1} / {galleryImages.length}
                </div>
              </div>
            )}
        </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar onAuthenticate={() => setAuthOpen(true)} />

        <section 
          className="relative flex min-h-[70vh] items-end justify-center bg-cover bg-center px-6 pb-20 pt-32 text-white"
          style={{
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.2), rgba(15, 23, 42, 0.85)), url('${coverImage}')`,
          }}
        >
          <div className="mx-auto w-full max-w-7xl relative z-10">
            <Link to="/catalog/circuits" className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-emerald-300 hover:text-white transition">
              <ArrowLeft size={16} />
              Retour aux circuits
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-300">
                  <MapPin size={16} />
                  <span>{destinationTitle}</span>
                </div>
                <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl text-white">
                  {item.title}
                </h1>
              </div>
              
              <div className="hidden lg:flex flex-col items-end shrink-0 bg-slate-950/40 p-5 rounded-3xl backdrop-blur-sm border border-white/10">
                 <span className="text-xs font-bold uppercase tracking-widest text-slate-300">À partir de</span>
                 <span className="text-4xl font-black text-emerald-400 mt-1">
                  {Number(price).toFixed(0)} €
                 </span>
                 <span className="text-sm font-medium text-slate-200 mt-1">par personne</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
          
          <div className="space-y-16">
            
            <div>
               <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Aperçu</p>
               <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 mb-6">Plongez dans l'aventure</h2>
               <p className="text-lg leading-8 text-slate-600 whitespace-pre-line">
                {item.description || "Un voyage inoubliable conçu pour vous faire découvrir les merveilles cachées de notre destination. Laissez-vous porter par une expérience sur-mesure."}
              </p>
            </div>

            {/* GALERIE STYLE RÉSEAUX SOCIAUX */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Camera className="text-emerald-600" size={28} />
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Galerie photos</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
                {galleryImages.length > 0 && (
                  <div 
                    onClick={() => openLightbox(0)}
                    className="relative overflow-hidden rounded-[2rem] group shadow-sm cursor-pointer md:col-span-2 h-full"
                  >
                    <img 
                      src={galleryImages[0]} 
                      alt="Photo 1" 
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20 flex items-center justify-center">
                      <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md" size={32} />
                    </div>
                  </div>
                )}

                <div className="hidden md:flex flex-col gap-4 h-full">
                  {galleryImages.length > 1 && (
                    <div 
                      onClick={() => openLightbox(1)}
                      className="relative overflow-hidden rounded-[2rem] group shadow-sm cursor-pointer h-[calc(50%-8rem)] flex-grow"
                    >
                      <img 
                        src={galleryImages[1]} 
                        alt="Photo 2" 
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20 flex items-center justify-center">
                        <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md" size={24} />
                      </div>
                    </div>
                  )}

                  {galleryImages.length > 2 && (
                    <div 
                      onClick={() => openLightbox(2)}
                      className="relative overflow-hidden rounded-[2rem] group shadow-sm cursor-pointer h-[calc(50%-8rem)] flex-grow"
                    >
                      <img 
                        src={galleryImages[2]} 
                        alt="Photo 3" 
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      {galleryImages.length > 3 ? (
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center transition-colors group-hover:bg-slate-950/70">
                          <span className="text-white font-extrabold text-xl tracking-wide">
                            +{galleryImages.length - 3} photos
                          </span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20 flex items-center justify-center">
                          <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md" size={24} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {galleryImages.length > 3 && (
                <div className="mt-4 md:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-sm font-semibold text-slate-700">Et {galleryImages.length - 3} autres photos...</span>
                  <button 
                    onClick={() => openLightbox(2)} 
                    className="bg-emerald-50 text-emerald-700 font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Tout afficher
                  </button>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Les incontournables</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 mb-6">Points forts du circuit</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {bookingOptions.highlights.map((highlight, index) => {
                  const Icon = highlight.icon
                  return (
                    <div key={index} className="rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-lg border border-slate-100">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <Icon size={24} />
                      </span>
                      <h3 className="mt-5 text-lg font-black text-slate-900">{highlight.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{highlight.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Itinéraire</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 mb-8">Votre programme jour par jour</h2>
              <div className="space-y-6">
                {bookingOptions.itinerary.map((day, index) => (
                  <div key={day.day} className="flex gap-6 items-start group">
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <span className="flex items-center justify-center font-bold text-emerald-700 bg-emerald-50 rounded-2xl w-14 h-14 text-xl group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                        J{day.day}
                      </span>
                      {index < bookingOptions.itinerary.length - 1 && (
                        <div className="w-0.5 h-full min-h-[4rem] bg-slate-200 mt-2"></div>
                      )}
                    </div>
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] flex-grow shadow-sm border border-slate-100 transition hover:shadow-lg">
                      <h3 className="text-xl font-bold text-slate-900 mb-3">
                        {day.title}
                      </h3>
                      <p className="text-base leading-relaxed text-slate-600">
                        {day.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <Navigation className="text-emerald-600" size={28} />
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Localisation</h2>
              </div>
              <div className="overflow-hidden rounded-[2.5rem] shadow-sm border border-slate-100 bg-white p-3">
                <div className="h-[400px] w-full overflow-hidden rounded-[2rem]">
                  <iframe
                    title="Carte de localisation"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(destinationTitle)}&t=&z=10&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                </div>
              </div>
            </div>

          </div>

          <aside className="sticky top-28">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-600/20 blur-3xl"></div>
              
              <div className="relative z-10 p-8 text-white space-y-8">
                <div className="border-b border-white/10 pb-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">Réserver ce circuit</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">{Number(price).toFixed(0)} €</span>
                    <span className="text-sm font-medium text-slate-400">/ pers.</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <CalendarDays size={14} className="text-emerald-400"/>
                      Date de départ
                    </label>
                    <select 
                      value={selectedDate} 
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="mt-2 w-full bg-transparent text-sm font-semibold text-white outline-none cursor-pointer [&>option]:text-slate-900"
                    >
                      {bookingOptions.dates.map(date => (
                        <option key={date} value={date}>{date}</option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3">
                     <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <Users size={14} className="text-emerald-400"/>
                        Voyageurs
                     </label>
                     <input 
                      type="number" 
                      value={travelers} 
                      min={1} 
                      max={bookingOptions.maxTravelers} 
                      onChange={(e) => setTravelers(parseInt(e.target.value))}
                      className="mt-2 w-full bg-transparent text-sm font-semibold text-white outline-none"
                     />
                  </div>
                </div>

                <Link to={`/booking/${item.id}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-4 text-sm font-bold text-white transition hover:bg-emerald-600 shadow-lg shadow-emerald-900/20">
                   Confirmer ma demande
                </Link>
                
                <div className="rounded-2xl bg-white/5 p-4 flex gap-3 items-start border border-white/5">
                  <Info size={18} className="text-emerald-400 shrink-0 mt-0.5"/>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Ceci est une demande de réservation sans engagement. Notre équipe vous recontactera sous 24h.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>

      {/* Intégration du Footer ici */}
      <SiteFooter />

      <AuthModal 
        open={authOpen} 
        initialMode="login" 
        onClose={() => setAuthOpen(false)} 
        onAuthenticated={() => setAuthOpen(false)} 
      />

      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm p-4">
          <button 
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition p-2"
          >
            <X size={32} />
          </button>
          
          <button 
            onClick={prevImage}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition"
          >
            <ChevronLeft size={32} />
          </button>

          <img 
            src={galleryImages[lightboxIndex]} 
            alt={`Aperçu ${lightboxIndex + 1}`} 
            className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />

          <button 
            onClick={nextImage}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition"
          >
            <ChevronRight size={32} />
          </button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-semibold tracking-widest text-white/70">
            {lightboxIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}
    </main>
  )
}