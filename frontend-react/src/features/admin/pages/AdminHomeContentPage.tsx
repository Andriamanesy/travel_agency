import { useEffect, useRef, useState, type DragEvent } from 'react'
import { useFieldArray, useForm, type UseFormRegister, type UseFormRegisterReturn } from 'react-hook-form'
import { ArrowDown, ArrowUp, Compass, HeartHandshake, ImageUp, Map, Save, ShieldCheck, Sparkles, Star, RotateCcw } from 'lucide-react'
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
type Tab = 'hero' | 'features' | 'preview'

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
      form.setError('hero.bgImageUrl', { message: 'Image limitée à 2 Mo.' })
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
    <section className="mx-auto max-w-6xl pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.22em] text-emerald-600">Studio Landing</p>
          <h1 className="mt-2 text-3xl font-black">Page d’accueil</h1>
          <p className="mt-2 text-slate-500">Composez une landing cohérente, puis vérifiez-la avant publication.</p>
        </div>
        <button form="home-content" className="action flex items-center gap-2" disabled={actions.saveHomeContent.isPending}>
          <Save size={17} />
          {actions.saveHomeContent.isPending ? 'Publication…' : 'Publier les changements'}
        </button>
      </div>

      {content.isError && (
        <p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 text-red-700">
          Impossible de charger la configuration. Les valeurs système restent disponibles.
        </p>
      )}
      {actions.saveHomeContent.isSuccess && (
        <p className="mt-5 rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-800">Modifications publiées sur la landing.</p>
      )}

      <div className="mt-8 flex gap-2 rounded-2xl bg-slate-200/70 p-1.5">
        <TabButton active={tab === 'hero'} onClick={() => setTab('hero')}>Hero Banner</TabButton>
        <TabButton active={tab === 'features'} onClick={() => setTab('features')}>Cartes d’arguments</TabButton>
        <TabButton active={tab === 'preview'} onClick={() => setTab('preview')}>Aperçu global</TabButton>
      </div>

      <form id="home-content" onSubmit={submit} className="mt-6">
        {tab === 'hero' && (
          <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <Header title="Contenu du Hero" subtitle="Les changements sont visibles instantanément dans l’aperçu." />
              <div className="mt-6 grid gap-4">
                <TextField
                  label="Titre principal"
                  registration={form.register('hero.title', { required: true, maxLength: 160 })}
                  error={form.formState.errors.hero?.title?.message}
                />
                <TextField
                  label="Sous-titre"
                  textarea
                  registration={form.register('hero.subtitle', { required: true, maxLength: 500 })}
                  error={form.formState.errors.hero?.subtitle?.message}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Libellé CTA" registration={form.register('hero.ctaText', { required: true, maxLength: 80 })} />
                  <TextField label="Lien CTA" registration={form.register('hero.ctaLink', { required: true })} />
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <HeroPreview hero={values.hero} image={background} />
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <Header title="Image de fond" subtitle="JPG, PNG ou WebP — 2 Mo maximum." />
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${customImage ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    {customImage ? 'Image personnalisée' : 'Image système par défaut'}
                  </span>
                </div>
                <button
                  type="button"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={drop}
                  onClick={() => input.current?.click()}
                  className="mt-5 grid w-full place-items-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 px-5 py-8 text-center transition hover:border-emerald-500 hover:bg-emerald-50"
                >
                  <ImageUp className="text-emerald-700" size={28} />
                  <b className="mt-3 text-sm">Glissez une image ici ou cliquez pour parcourir</b>
                  <span className="mt-1 text-xs text-slate-500">L’aperçu est immédiat et l’image est enregistrée avec le contenu.</span>
                </button>
                <input
                  ref={input}
                  className="hidden"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => setImageFile(event.target.files?.[0])}
                />
                <div className="mt-4">
                  <label className="text-sm font-bold text-slate-700">ou saisir une URL</label>
                  <input className="field" placeholder="https://… ou /uploads/…" {...form.register('hero.bgImageUrl')} />
                </div>
                <button
                  type="button"
                  onClick={() => form.setValue('hero.bgImageUrl', null, { shouldDirty: true })}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-700"
                >
                  <RotateCcw size={16} />
                  Rétablir l’image par défaut
                </button>
                {form.formState.errors.hero?.bgImageUrl && (
                  <p className="mt-2 text-sm text-red-700">{form.formState.errors.hero.bgImageUrl.message}</p>
                )}
              </div>
            </section>
          </div>
        )}

        {tab === 'features' && (
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Header title="Cartes d’arguments" subtitle="Activez, réordonnez et personnalisez jusqu’à quatre arguments." />
              <button
                type="button"
                disabled={features.fields.length >= 4}
                onClick={() => features.append({ icon: 'Sparkles', title: 'Nouvel argument', description: 'Décrivez cet avantage.', isActive: true })}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold disabled:opacity-50"
              >
                Ajouter une carte
              </button>
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
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
                  canRemove={features.fields.length > 3}
                  canUp={index > 0}
                  canDown={index < features.fields.length - 1}
                />
              ))}
            </div>
          </section>
        )}

        {tab === 'preview' && (
          <div className="space-y-6">
            <HeroPreview hero={values.hero} image={background} large />
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <Header title="Arguments visibles" subtitle="Seules les cartes activées seront affichées sur la landing." />
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {(values.features || [])
                  .filter((feature) => feature.isActive !== false)
                  .map((feature, index) => {
                    const Icon = iconOptions[feature.icon as keyof typeof iconOptions] || Compass
                    return (
                      <article key={`${feature.title}-${index}`} className="rounded-2xl border border-slate-100 p-5">
                        <Icon className="text-emerald-700" />
                        <h3 className="mt-4 font-black">{feature.title || 'Sans titre'}</h3>
                        <p className="mt-2 text-sm text-slate-500">{feature.description || 'Ajoutez une description.'}</p>
                      </article>
                    )
                  })}
              </div>
            </section>
          </div>
        )}
      </form>
    </section>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
        active ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:bg-white/60'
      }`}
    >
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

function TextField({
  label,
  registration,
  error,
  textarea = false,
}: {
  label: string
  registration: UseFormRegisterReturn
  error?: string
  textarea?: boolean
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      {textarea ? <textarea className="field min-h-28" {...registration} /> : <input className="field" {...registration} />}
      {error && <span className="mt-1 block text-xs text-red-700">{error}</span>}
    </label>
  )
}

function HeroPreview({ hero, image, large = false }: { hero: HomeSettings['hero']; image: string; large?: boolean }) {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl ${large ? 'min-h-105' : 'min-h-85'}`}
      style={{
        backgroundImage: `linear-gradient(110deg, rgba(2, 6, 23, .78), rgba(2, 6, 23, .38)), url('${image}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute left-5 top-5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-widest backdrop-blur">
        Live Preview
      </div>
      <div className="relative flex min-h-inherit flex-col justify-end p-8">
        <p className="text-xs font-black uppercase tracking-[.3em] text-emerald-300">TravelMS</p>
        <h2 className="mt-3 max-w-xl text-3xl font-black leading-tight">{hero?.title || 'Explorez le Monde avec Nous'}</h2>
        <p className="mt-3 max-w-lg text-sm text-slate-200">{hero?.subtitle || "Des circuits sur-mesure d'exception"}</p>
        <span className="mt-6 inline-flex w-fit rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold">
          {hero?.ctaText || 'Découvrir nos circuits'}
        </span>
      </div>
    </section>
  )
}

function FeatureCard({
  index,
  feature,
  register,
  setValue,
  active,
  onToggle,
  onUp,
  onDown,
  onRemove,
  canRemove,
  canUp,
  canDown,
}: {
  index: number
  feature: HomeFeature & { id?: string }
  register: UseFormRegister<HomeSettings>
  setValue: (name: `features.${number}.icon`, value: HomeFeature['icon'], options?: { shouldDirty: boolean }) => void
  active: boolean
  onToggle: () => void
  onUp: () => void
  onDown: () => void
  onRemove: () => void
  canRemove: boolean
  canUp: boolean
  canDown: boolean
}) {
  const selected = feature.icon as keyof typeof iconOptions
  const Icon = iconOptions[selected] || Compass

  return (
    <article className={`rounded-3xl border p-5 transition ${active ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50 opacity-65'}`}>
      <div className="flex items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm">
          <Icon size={21} />
        </span>
        <label className="flex items-center gap-2 text-xs font-bold">
          <input type="checkbox" checked={active} onChange={onToggle} />
          Active
        </label>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {Object.entries(iconOptions).map(([name, PickerIcon]) => (
          <button
            type="button"
            key={name}
            onClick={() => setValue(`features.${index}.icon`, name as HomeFeature['icon'], { shouldDirty: true })}
            className={`grid h-10 place-items-center rounded-xl ${
              feature.icon === name ? 'bg-emerald-700 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'
            }`}
          >
            <PickerIcon size={17} />
          </button>
        ))}
      </div>

      <input type="hidden" {...register(`features.${index}.icon` as const)} />
      <input className="field mt-4" placeholder="Titre" {...register(`features.${index}.title` as const, { required: true })} />
      <textarea className="field min-h-24" placeholder="Description" {...register(`features.${index}.description` as const, { required: true })} />

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-1">
          <button type="button" onClick={onUp} disabled={!canUp} className="rounded-lg p-2 hover:bg-white disabled:opacity-30">
            <ArrowUp size={17} />
          </button>
          <button type="button" onClick={onDown} disabled={!canDown} className="rounded-lg p-2 hover:bg-white disabled:opacity-30">
            <ArrowDown size={17} />
          </button>
        </div>
        <button type="button" disabled={!canRemove} onClick={onRemove} className="text-sm font-bold text-red-700 disabled:opacity-30">
          Supprimer
        </button>
      </div>
    </article>
  )
}