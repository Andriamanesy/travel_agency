import { useEffect, useRef, useState, type DragEvent } from 'react'
import { useFieldArray, useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { 
  ArrowDown, ArrowUp, Compass, HeartHandshake, ImageUp, 
  Map, Save, ShieldCheck, Sparkles, Star, RotateCcw, 
  LayoutTemplate, Quote, CheckCircle2 
} from 'lucide-react'
import heroFallback from '@/assets/hero.png'
import type { HomeFeature, HomeSettings } from '@/features/home/services/home.service'
import { useBackofficeActions, useHomeContent } from '../hooks/useBackoffice'

const iconOptions = { Compass, Map, ShieldCheck, Star, HeartHandshake, Sparkles }
const defaults: HomeSettings = {
  hero: {
    title: 'Explorez le Monde avec Nous',
    subtitle: "Des circuits sur-mesure d'exception",
    ctaText: 'Découvrir nos circuits',
    ctaLink: '/circuits',
    bgImageUrl: null,
  },
  features: [
    { icon: 'Compass', title: 'Circuits sur-mesure', description: 'Des itinéraires pensés autour de vos envies.', isActive: true },
    { icon: 'ShieldCheck', title: 'Voyagez sereinement', description: 'Une équipe locale attentive à chaque détail.', isActive: true },
    { icon: 'HeartHandshake', title: 'Expériences authentiques', description: 'Des rencontres et des adresses qui ont du sens.', isActive: true },
  ],
}

type Tab = 'hero' | 'features' | 'featured' | 'testimonials' | 'preview'

export function AdminHomeContentPage() {
  const content = useHomeContent()
  const actions = useBackofficeActions()
  const [tab, setTab] = useState<Tab>('hero')
  const input = useRef<HTMLInputElement>(null)

  const form = useForm<HomeSettings>({ defaultValues: defaults })
  const features = useFieldArray({ control: form.control, name: 'features' })
  const values = form.watch()

  useEffect(() => {
    if (content.data) {
      form.reset({
        ...defaults,
        ...content.data,
        hero: { ...defaults.hero, ...content.data.hero },
        features: Array.isArray(content.data.features)
          ? content.data.features.map((feature) => ({ ...feature, isActive: feature.isActive !== false }))
          : defaults.features,
      })
    }
  }, [content.data, form])

  const setImageFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) {
      form.setError('hero.bgImageUrl', { message: 'L\'image ne doit pas dépasser 2 Mo.' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => form.setValue('hero.bgImageUrl', String(reader.result), { shouldDirty: true })
    reader.readAsDataURL(file)
  }

  const drop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setImageFile(event.dataTransfer.files[0])
  }

  const submit = form.handleSubmit((submitted) =>
    actions.saveHomeContent.mutate({
      ...submitted,
      hero: { ...submitted.hero, bgImageUrl: submitted.hero.bgImageUrl || null },
    })
  )

  const background = values.hero?.bgImageUrl || heroFallback
  const customImage = Boolean(values.hero?.bgImageUrl)

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* HEADER FIXE (Sticky) POUR TOUJOURS GARDER LE BOUTON SAVE SOUS LA MAIN */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Éditeur de la page d'accueil</h1>
            <p className="text-sm text-slate-500 hidden sm:block">Personnalisez le contenu visible par vos futurs voyageurs.</p>
          </div>
          <button 
            form="home-content" 
            disabled={actions.saveHomeContent.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:opacity-50 cursor-pointer"
          >
            <Save size={18} />
            {actions.saveHomeContent.isPending ? 'Publication…' : 'Publier en ligne'}
          </button>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-6xl px-6">
        {/* MESSAGES DE STATUT */}
        {content.isError && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-red-700 border border-red-100">
            <span className="font-semibold">Erreur :</span> Impossible de charger la configuration actuelle. Les valeurs par défaut sont affichées.
          </div>
        )}
        {actions.saveHomeContent.isSuccess && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800 border border-emerald-100">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span className="font-semibold">Succès !</span> Vos modifications ont été publiées sur la page d'accueil.
          </div>
        )}

        {/* NAVIGATION PAR ONGLETS MODERNISÉE */}
        <div className="mb-8 flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm border border-slate-200 scrollbar-hide">
          <TabButton active={tab === 'hero'} icon={LayoutTemplate} onClick={() => setTab('hero')}>En-tête (Hero)</TabButton>
          <TabButton active={tab === 'features'} icon={Compass} onClick={() => setTab('features')}>Arguments</TabButton>
          <TabButton active={tab === 'featured'} icon={Map} onClick={() => setTab('featured')}>À la une</TabButton>
          <TabButton active={tab === 'testimonials'} icon={Quote} onClick={() => setTab('testimonials')}>Témoignages</TabButton>
          <div className="w-px bg-slate-200 mx-2 my-1"></div>
          <TabButton active={tab === 'preview'} icon={Star} onClick={() => setTab('preview')}>Aperçu global</TabButton>
        </div>

        <form id="home-content" onSubmit={submit} className="grid gap-8">
          
          {/* ONGLET HERO */}
          {tab === 'hero' && (
            <div className="grid gap-8 xl:grid-cols-[1fr_400px]">
              {/* Formulaire Textes */}
              <div className="space-y-6 rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
                <Header title="Textes d'accroche" subtitle="Ces éléments apparaissent en premier sur votre site." />
                
                <div className="mt-6 space-y-5">
                  <TextField
                    label="Titre principal"
                    placeholder="Ex: Explorez le Monde avec Nous"
                    registration={form.register('hero.title', { required: true, maxLength: 160 })}
                    error={form.formState.errors.hero?.title?.message}
                  />
                  <TextField
                    label="Sous-titre / Description courte"
                    placeholder="Ex: Des circuits sur-mesure d'exception à Madagascar..."
                    textarea
                    registration={form.register('hero.subtitle', { required: true, maxLength: 500 })}
                    error={form.formState.errors.hero?.subtitle?.message}
                  />
                  <div className="grid gap-5 sm:grid-cols-2 pt-4 border-t border-slate-100">
                    <TextField 
                      label="Texte du bouton (CTA)" 
                      placeholder="Ex: Découvrir nos circuits"
                      registration={form.register('hero.ctaText', { required: true, maxLength: 80 })} 
                    />
                    <TextField 
                      label="Lien du bouton" 
                      placeholder="Ex: /catalog/circuits"
                      registration={form.register('hero.ctaLink', { required: true })} 
                    />
                  </div>
                </div>
              </div>

              {/* Upload Image */}
              <div className="space-y-6">
                <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
                  <div className="flex items-start justify-between mb-6">
                    <Header title="Image de fond" subtitle="Taille recommandée: 1920x1080 (Max 2Mo)." />
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-emerald-500 hover:bg-emerald-50">
                    {customImage && (
                      <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${background})` }}></div>
                    )}
                    <button
                      type="button"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={drop}
                      onClick={() => input.current?.click()}
                      className="relative z-10 flex w-full flex-col items-center justify-center p-8 text-center cursor-pointer"
                    >
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700 mb-4">
                        <ImageUp size={24} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">Cliquez ou glissez une image ici</span>
                      <span className="mt-1 text-xs text-slate-500">JPG, PNG, WebP acceptés</span>
                    </button>
                  </div>
                  
                  <input ref={input} className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setImageFile(e.target.files?.[0])} />
                  
                  <div className="mt-6">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Ou via une URL externe</label>
                    <input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" placeholder="https://..." {...form.register('hero.bgImageUrl')} />
                  </div>

                  {customImage && (
                    <button type="button" onClick={() => form.setValue('hero.bgImageUrl', null, { shouldDirty: true })} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 cursor-pointer">
                      <RotateCcw size={16} /> Rétablir l'image par défaut
                    </button>
                  )}
                  {form.formState.errors.hero?.bgImageUrl && <p className="mt-2 text-sm text-red-700">{form.formState.errors.hero.bgImageUrl.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ONGLET ARGUMENTS */}
          {tab === 'features' && (
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
                <Header title="Cartes d'arguments (Expériences)" subtitle="Mettez en avant jusqu'à 4 points forts de votre agence." />
                <button
                  type="button"
                  disabled={features.fields.length >= 4}
                  onClick={() => features.append({ icon: 'Sparkles', title: '', description: '', isActive: true })}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 hover:bg-slate-800 transition cursor-pointer"
                >
                  + Ajouter une carte
                </button>
              </div>
              
              <div className="grid gap-6 lg:grid-cols-2">
                {features.fields.map((feature, index) => (
                  <FeatureCard
                    key={feature.id}
                    index={index}
                    feature={feature}
                    register={form.register}
                    setValue={form.setValue}
                    active={values.features?.[index]?.isActive !== false}
                    onToggle={() => form.setValue(`features.${index}.isActive`, !values.features?.[index]?.isActive, { shouldDirty: true })}
                    onUp={() => features.move(index, index - 1)}
                    onDown={() => features.move(index, index + 1)}
                    onRemove={() => features.remove(index)}
                    canRemove={features.fields.length > 1}
                    canUp={index > 0}
                    canDown={index < features.fields.length - 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ONGLET À LA UNE */}
          {tab === 'featured' && (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-16 shadow-sm border border-slate-200 text-center min-h-[400px]">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-slate-100 text-slate-400 mb-6">
                <Map size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Circuits & Destinations à la une</h2>
              <p className="mt-3 max-w-md text-slate-500">
                C'est ici que nous allons lier votre catalogue (circuits et destinations) à la page d'accueil.
              </p>
              <span className="mt-6 inline-flex rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-bold text-emerald-800">
                Prochaine étape à développer
              </span>
            </div>
          )}

          {/* ONGLET TÉMOIGNAGES */}
          {tab === 'testimonials' && (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-16 shadow-sm border border-slate-200 text-center min-h-[400px]">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-slate-100 text-slate-400 mb-6">
                <Quote size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Gestion des Témoignages</h2>
              <p className="mt-3 max-w-md text-slate-500">
                Interface prévue pour ajouter, modifier ou masquer les avis de vos voyageurs satisfaits.
              </p>
              <span className="mt-6 inline-flex rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-bold text-emerald-800">
                Prochaine étape à développer
              </span>
            </div>
          )}

          {/* ONGLET APERÇU */}
          {tab === 'preview' && (
            <div className="space-y-8">
              <HeroPreview hero={values.hero} image={background} large />
              <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
                <Header title="Aperçu des arguments" subtitle="Ce que verront vos visiteurs." />
                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                  {(values.features || [])
                    .filter((feature) => feature.isActive !== false)
                    .map((feature, index) => {
                      const Icon = iconOptions[feature.icon as keyof typeof iconOptions] || Compass
                      return (
                        <article key={`${feature.title}-${index}`} className="rounded-3xl bg-slate-50 p-6 border border-slate-100 text-center">
                          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                            <Icon size={28} />
                          </span>
                          <h3 className="mt-5 text-lg font-black text-slate-900">{feature.title || 'Titre manquant'}</h3>
                          <p className="mt-2 text-sm text-slate-500 leading-relaxed">{feature.description || 'Description manquante.'}</p>
                        </article>
                      )
                    })}
                </div>
              </div>
            </div>
          )}

        </form>
      </main>
    </div>
  )
}

/* --- SOUS-COMPOSANTS MODERNISÉS --- */

function TabButton({ active, icon: Icon, onClick, children }: { active: boolean; icon: any; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all cursor-pointer ${
        active ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={18} className={active ? 'text-emerald-400' : 'text-slate-400'} />
      {children}
    </button>
  )
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-xl font-black text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}

function TextField({ label, placeholder, registration, error, textarea = false }: { label: string; placeholder?: string; registration: UseFormRegisterReturn; error?: string; textarea?: boolean }) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-bold text-slate-700">{label}</label>
      {textarea ? (
        <textarea 
          className="w-full min-h-[120px] rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" 
          placeholder={placeholder}
          {...registration} 
        />
      ) : (
        <input 
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" 
          placeholder={placeholder}
          {...registration} 
        />
      )}
      {error && <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span>}
    </div>
  )
}

function FeatureCard({ index, feature, register, setValue, active, onToggle, onUp, onDown, onRemove, canRemove, canUp, canDown }: any) {
  const selected = feature.icon as keyof typeof iconOptions
  const Icon = iconOptions[selected] || Compass

  return (
    <article className={`relative flex flex-col rounded-2xl border-2 p-6 transition-all ${active ? 'border-emerald-200 bg-white shadow-sm' : 'border-slate-200 bg-slate-50 opacity-60'}`}>
      
      {/* Contrôles Haut/Bas intégrés au design */}
      <div className="absolute -left-3 top-1/2 flex -translate-y-1/2 flex-col gap-1">
        <button type="button" onClick={onUp} disabled={!canUp} className="rounded-full bg-white border border-slate-200 p-1 text-slate-400 hover:text-emerald-600 hover:border-emerald-300 disabled:opacity-0 shadow-sm transition-all cursor-pointer"><ArrowUp size={14} /></button>
        <button type="button" onClick={onDown} disabled={!canDown} className="rounded-full bg-white border border-slate-200 p-1 text-slate-400 hover:text-emerald-600 hover:border-emerald-300 disabled:opacity-0 shadow-sm transition-all cursor-pointer"><ArrowDown size={14} /></button>
      </div>

      <div className="flex items-center justify-between pl-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <Icon size={24} />
          </span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={active} onChange={onToggle} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer" />
            <span className="text-sm font-bold text-slate-700">{active ? 'Carte visible' : 'Carte masquée'}</span>
          </label>
        </div>
        <button type="button" disabled={!canRemove} onClick={onRemove} className="text-sm font-bold text-red-500 hover:text-red-700 disabled:opacity-30 cursor-pointer">
          Supprimer
        </button>
      </div>

      <div className="mt-6 pl-4 space-y-4">
        {/* Sélecteur d'icône plus discret */}
        <div>
          <label className="text-xs font-bold text-slate-500 mb-2 block">Icône</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(iconOptions).map(([name, PickerIcon]) => (
              <button
                type="button"
                key={name}
                onClick={() => setValue(`features.${index}.icon`, name as HomeFeature['icon'], { shouldDirty: true })}
                className={`grid h-10 w-10 place-items-center rounded-lg border transition cursor-pointer ${feature.icon === name ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
              >
                <PickerIcon size={18} />
              </button>
            ))}
          </div>
        </div>

        <input type="hidden" {...register(`features.${index}.icon` as const)} />
        <TextField label="Titre de l'argument" placeholder="Ex: Voyagez sereinement" registration={register(`features.${index}.title` as const, { required: true })} />
        <TextField label="Description courte" placeholder="Ex: Une équipe locale attentive..." textarea registration={register(`features.${index}.description` as const, { required: true })} />
      </div>
    </article>
  )
}

function HeroPreview({ hero, image, large = false }: { hero: HomeSettings['hero']; image: string; large?: boolean }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[2.5rem] text-white shadow-xl ${large ? 'min-h-[600px]' : 'min-h-[400px]'}`}
      style={{
        backgroundImage: `linear-gradient(110deg, rgba(15, 23, 42, .85), rgba(15, 23, 42, .4)), url('${image}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-xs font-bold uppercase tracking-widest backdrop-blur-md border border-white/20">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        Live Preview
      </div>
      <div className="relative flex min-h-inherit flex-col justify-center p-12 lg:p-20 max-w-4xl">
        <p className="text-sm font-black uppercase tracking-[.3em] text-emerald-400">TravelMS</p>
        <h2 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">{hero?.title || 'Titre principal'}</h2>
        <p className="mt-6 max-w-2xl text-lg text-slate-200 sm:text-xl">{hero?.subtitle || "Votre sous-titre apparaîtra ici."}</p>
        <span className="mt-10 inline-flex w-fit items-center rounded-xl bg-emerald-600 px-6 py-4 text-sm font-bold shadow-lg shadow-emerald-900/30">
          {hero?.ctaText || 'Texte du bouton'}
        </span>
      </div>
    </section>
  )
}