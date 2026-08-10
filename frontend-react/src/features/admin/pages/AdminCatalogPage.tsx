import { useState, useEffect, type FormEvent, type DragEvent } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { catalogEntities, type CatalogEntity, type CatalogItem } from '@/features/catalog/types'
import { ApiError } from '@/lib/api-client'
import { useAdminActions, useAdminCatalog } from '../hooks/useAdmin'
import { CircuitForm, type CircuitRecord } from '../components/CircuitForm'
import { useAdvancedCircuits } from '../hooks/useBackoffice'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  AlertCircle, 
  X, 
  Check, 
  Ban,
  Upload,
  User,
  Link as LinkIcon
} from 'lucide-react'

type Field = { 
  key: string 
  label: string 
  type?: 'number' | 'email' | 'textarea' | 'checkbox' 
  required?: boolean 
}

const configs: Record<CatalogEntity, { title: string; fields: Field[] }> = {
  categories: { 
    title: 'Catégories', 
    fields: [
      { key: 'name', label: 'Nom', required: true }, 
      { key: 'slug', label: 'Slug' }, 
      { key: 'description', label: 'Description', type: 'textarea' }
    ] 
  },
  circuits: { 
    title: 'Circuits', 
    fields: [
      { key: 'destination_id', label: 'ID destination', required: true }, 
      { key: 'title', label: 'Titre', required: true }, 
      { key: 'description', label: 'Description', type: 'textarea', required: true }, 
      { key: 'price', label: 'Prix (€)', type: 'number', required: true }, 
      { key: 'original_price', label: 'Prix avant promo (€)', type: 'number' },
      { key: 'duration_days', label: 'Durée (jours)', type: 'number', required: true }, 
      { key: 'capacity', label: 'Capacité', type: 'number', required: true }, 
      { key: 'cover_image', label: 'Image de couverture' }, 
      { key: 'gallery_urls', label: 'Galerie (une URL par ligne)', type: 'textarea' }, 
      { key: 'is_active', label: 'Actif dans le catalogue', type: 'checkbox' }
    ] 
  },
  hotels: { 
    title: 'Hôtels', 
    fields: [
      { key: 'destination_id', label: 'ID destination', required: true }, 
      { key: 'name', label: 'Nom', required: true }, 
      { key: 'address', label: 'Adresse', required: true }, 
      { key: 'price_per_night', label: 'Prix / nuit (€)', type: 'number', required: true }, 
      { key: 'original_price', label: 'Prix avant promo / nuit (€)', type: 'number' },
      { key: 'rating', label: 'Note / 5', type: 'number' }, 
      { key: 'cover_image', label: 'Photo de l’hôtel' }, 
      { key: 'is_active', label: 'Actif dans le catalogue', type: 'checkbox' }
    ] 
  },
  guides: { 
    title: 'Guides', 
    fields: [
      { key: 'name', label: 'Nom', required: true }, 
      { key: 'email', label: 'E-mail', type: 'email', required: true }, 
      { key: 'phone', label: 'Téléphone' }, 
      { key: 'bio', label: 'Biographie', type: 'textarea' }, 
      { key: 'avatar_url', label: 'Photo de profil (Avatar)' }, 
      { key: 'is_active', label: 'Actif', type: 'checkbox' }
    ] 
  },
}

function blank(fields: Field[]) { 
  return Object.fromEntries(fields.map((field) => [field.key, field.type === 'checkbox' ? true : ''])) 
}

export function AdminCatalogPage() {
  const { entity = '' } = useParams()
  const valid = catalogEntities.includes(entity as CatalogEntity)
  const type: CatalogEntity = valid ? (entity as CatalogEntity) : 'circuits'
  const config = configs[type]

  const { data, isPending, error } = useAdminCatalog(type)
  const actions = useAdminActions()

  const [editing, setEditing] = useState<CatalogItem | null>(null)
  const [values, setValues] = useState<Record<string, string | boolean>>(() => blank(config.fields))
  const [searchTerm, setSearchTerm] = useState('')

  // Réinitialise le formulaire lors du changement d'entité
  useEffect(() => {
    reset()
    setSearchTerm('')
  }, [type])

  if (!valid) return <Navigate to="/admin/catalog/circuits" replace />
  if (type === 'circuits') return <AdminCircuitsPage />

  const reset = () => { 
    setEditing(null)
    setValues(blank(config.fields)) 
  }

  const edit = (item: CatalogItem) => { 
    setEditing(item)
    setValues(
      Object.fromEntries(
        config.fields.map((field) => [
          field.key, 
          field.type === 'checkbox' 
            ? Boolean(Reflect.get(item, field.key)) 
            : String(Reflect.get(item, field.key) ?? '')
        ])
      )
    ) 
  }

  const submit = (event: FormEvent) => { 
    event.preventDefault()
    actions.saveCatalog.mutate(
      { entity: type, id: editing?.id ?? null, values }, 
      { onSuccess: reset }
    ) 
  }

  const message = error instanceof ApiError 
    ? error.message 
    : actions.saveCatalog.error instanceof ApiError 
      ? actions.saveCatalog.error.message 
      : actions.deleteCatalog.error instanceof ApiError 
        ? actions.deleteCatalog.error.message 
        : null

  const items = (data?.[type] ?? []) as CatalogItem[]

  // Filtrage des éléments
  const filteredItems = items.filter((item) => {
    const title = (item.name || item.title || item.email || '').toLowerCase()
    return title.includes(searchTerm.toLowerCase())
  })

  return (
    <section className="space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-600 dark:text-emerald-400">
          Administration
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
          {config.title}
        </h1>
      </div>

      {message && (
        <div role="alert" className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
          <AlertCircle size={18} className="shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[.9fr_1.4fr] items-start">
        {/* Formulaire de saisie / modification */}
        <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white dark:bg-[#121214] p-6 shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-colors sticky top-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              {editing ? 'Modifier l’élément' : 'Nouvel enregistrement'}
            </h2>
            {editing && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Mode Édition
              </span>
            )}
          </div>

          {config.fields.map((field) => (
            <AdminField 
              key={field.key} 
              field={field} 
              value={values[field.key]} 
              onChange={(value) => setValues({ ...values, [field.key]: value })} 
            />
          ))}

          <div className="flex gap-3 pt-4">
            <button 
              disabled={actions.saveCatalog.isPending} 
              className="flex-1 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 px-5 py-3 text-xs font-bold text-white shadow-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              {actions.saveCatalog.isPending ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Enregistrer'}
            </button>
            
            {editing && (
              <button 
                type="button" 
                onClick={reset} 
                className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Annuler
              </button>
            )}
          </div>
        </form>

        {/* Liste des éléments */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#121214] px-4 py-2.5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder={`Rechercher dans ${config.title.toLowerCase()}...`} 
              className="w-full bg-transparent text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl bg-white dark:bg-[#121214] shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-colors divide-y divide-slate-100 dark:divide-slate-800/80">
            {isPending && <p className="p-6 text-sm text-slate-600 dark:text-slate-300">Chargement…</p>}
            
            {!isPending && filteredItems.length === 0 && (
              <p className="p-6 text-sm text-slate-600 dark:text-slate-300">
                {searchTerm ? 'Aucun résultat ne correspond à votre recherche.' : 'Aucun élément trouvé.'}
              </p>
            )}

            {filteredItems.map((item) => {
              const isActive = (item as any).is_active !== false
              const imageUrl = (item as any).cover_image || (item as any).avatar_url

              return (
                <article key={item.id} className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Miniature de l'image si présente */}
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt=""
                        className="h-10 w-10 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shrink-0"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    )}

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {item.name || item.title}
                        </h2>
                        {'is_active' in item && (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${
                            isActive 
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                          }`}>
                            {isActive ? <Check size={10} /> : <Ban size={10} />}
                            {isActive ? 'Actif' : 'Inactif'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {item.email || item.address || item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button 
                      onClick={() => edit(item)} 
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      <Pencil size={13} />
                      <span>Modifier</span>
                    </button>
                    
                    <button 
                      onClick={() => { 
                        if (confirm('Supprimer cet élément ?')) {
                          actions.deleteCatalog.mutate({ entity: type, id: item.id })
                        }
                      }} 
                      className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function AdminCircuitsPage() {
  const { data, isPending, error } = useAdvancedCircuits()
  const [editing, setEditing] = useState<CircuitRecord | null>(null)
  
  const items = (data?.circuits ?? []) as CircuitRecord[]
  const message = error instanceof ApiError ? error.message : null
  
  return (
    <section className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-600 dark:text-emerald-400">
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            Circuits
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Créez, modifiez et planifiez les circuits proposés.
          </p>
        </div>

        {editing && (
          <button
            onClick={() => setEditing(null)}
            className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold hover:bg-emerald-600 transition shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Nouveau circuit</span>
          </button>
        )}
      </div>

      {message && (
        <div role="alert" className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
          <AlertCircle size={18} className="shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_1.1fr] items-start">
        <CircuitForm editing={editing} onDone={() => setEditing(null)} />

        <div className="overflow-hidden rounded-2xl bg-white dark:bg-[#121214] shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-colors divide-y divide-slate-100 dark:divide-slate-800/80">
          {isPending && <p className="p-6 text-sm text-slate-600 dark:text-slate-300">Chargement…</p>}
          {!isPending && items.length === 0 && <p className="p-6 text-sm text-slate-600 dark:text-slate-300">Aucun circuit trouvé.</p>}
          
          {items.map((item) => (
            <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
              <div className="flex items-center gap-3">
                {item.cover_image && (
                  <img
                    src={item.cover_image}
                    alt=""
                    className="h-12 w-12 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shrink-0"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">{item.title}</h2>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                    {item.duration_days} jours · {item.capacity} places · <strong className="text-emerald-600 dark:text-emerald-400">{item.price} €</strong>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    {item.itineraries?.length ?? 0} étape(s) · {item.departures?.length ?? 0} départ(s)
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setEditing(item)} 
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <Pencil size={13} />
                <span>Modifier</span>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function AdminField({ 
  field, 
  value, 
  onChange 
}: { 
  field: Field
  value: string | boolean 
  onChange: (value: string | boolean) => void 
}) { 
  // Rendu spécifique pour le téléversement d'image avec aperçu
  if (field.key === 'cover_image' || field.key === 'avatar_url') {
    return (
      <ImageUploadField
        label={field.label}
        value={String(value ?? '')}
        onChange={(val) => onChange(val)}
        required={field.required}
        isAvatar={field.key === 'avatar_url'}
      />
    )
  }

  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer py-1">
        <input 
          type="checkbox" 
          checked={Boolean(value)} 
          onChange={(event) => onChange(event.target.checked)} 
          className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-slate-900 cursor-pointer"
        />
        {field.label}
      </label>
    )
  } 
  
  return (
    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
      <span className="mb-1 block">
        {field.label} {field.required && <span className="text-rose-500">*</span>}
      </span>
      {field.type === 'textarea' ? (
        <textarea 
          value={String(value ?? '')} 
          onChange={(event) => onChange(event.target.value)} 
          required={field.required} 
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 min-h-24 transition-colors" 
        />
      ) : (
        <input 
          type={field.type || 'text'} 
          value={String(value ?? '')} 
          onChange={(event) => onChange(event.target.value)} 
          required={field.required} 
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors" 
        />
      )}
    </label>
  )
}

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  isAvatar?: boolean
}

function ImageUploadField({ label, value, onChange, required, isAvatar }: ImageUploadFieldProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) onChange(result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      {value ? (
        /* Zone d'aperçu lorsque l'image est définie */
        <div className="relative group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3 flex items-center gap-3">
          <img
            src={value}
            alt="Aperçu"
            className={`object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 ${
              isAvatar ? 'h-14 w-14 rounded-full' : 'h-16 w-24 rounded-xl'
            }`}
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Erreur+Image'
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {value.startsWith('data:') ? '📷 Image téléversée (Base64)' : '🌐 Image externe (Lien)'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {value}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 transition cursor-pointer shrink-0"
            title="Supprimer l'image"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        /* Zone de dépose / téléversement de fichier */
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 scale-[0.99]'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="p-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              {isAvatar ? <User size={18} /> : <Upload size={18} />}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              <label className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer">
                <span>Choisir un fichier</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFile(e.target.files[0])
                  }}
                />
              </label>
              {' '}ou glisser-déposer
            </div>
            <span className="text-[10px] text-slate-400">PNG, JPG, WEBP jusqu'à 5Mo</span>
          </div>

          {/* Saisie d'URL alternative */}
          <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2 px-1">
            <LinkIcon size={13} className="text-slate-400 shrink-0" />
            <input
              type="url"
              value={value.startsWith('data:') ? '' : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Ou collez l'URL d'une image web (https://...)"
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  )
}