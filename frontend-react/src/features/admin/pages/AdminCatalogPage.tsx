import { useState, type FormEvent } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { catalogEntities, type CatalogEntity, type CatalogItem } from '@/features/catalog/types'
import { ApiError } from '@/lib/api-client'
import { useAdminActions, useAdminCatalog } from '../hooks/useAdmin'
import { CircuitForm, type CircuitRecord } from '../components/CircuitForm'
import { useAdvancedCircuits } from '../hooks/useBackoffice'

type Field = { key: string; label: string; type?: 'number' | 'email' | 'textarea' | 'checkbox'; required?: boolean }
const configs: Record<CatalogEntity, { title: string; fields: Field[] }> = {
  categories: { title: 'Catégories', fields: [{ key: 'name', label: 'Nom', required: true }, { key: 'slug', label: 'Slug' }, { key: 'description', label: 'Description', type: 'textarea' }] },
  circuits: { title: 'Circuits', fields: [{ key: 'destination_id', label: 'ID destination', required: true }, { key: 'title', label: 'Titre', required: true }, { key: 'description', label: 'Description', type: 'textarea', required: true }, { key: 'price', label: 'Prix (€)', type: 'number', required: true }, { key: 'duration_days', label: 'Durée (jours)', type: 'number', required: true }, { key: 'capacity', label: 'Capacité', type: 'number', required: true }, { key: 'cover_image', label: 'Image (URL)' }, { key: 'gallery_urls', label: 'Galerie (une URL par ligne)', type: 'textarea' }, { key: 'is_active', label: 'Actif', type: 'checkbox' }] },
  hotels: { title: 'Hôtels', fields: [{ key: 'destination_id', label: 'ID destination', required: true }, { key: 'name', label: 'Nom', required: true }, { key: 'address', label: 'Adresse', required: true }, { key: 'price_per_night', label: 'Prix / nuit (€)', type: 'number', required: true }, { key: 'rating', label: 'Note / 5', type: 'number' }, { key: 'cover_image', label: 'Image (URL)' }, { key: 'is_active', label: 'Actif', type: 'checkbox' }] },
  guides: { title: 'Guides', fields: [{ key: 'name', label: 'Nom', required: true }, { key: 'email', label: 'E-mail', type: 'email', required: true }, { key: 'phone', label: 'Téléphone' }, { key: 'bio', label: 'Biographie', type: 'textarea' }, { key: 'avatar_url', label: 'Photo (URL)' }, { key: 'is_active', label: 'Actif', type: 'checkbox' }] },
}
function blank(fields: Field[]) { return Object.fromEntries(fields.map((field) => [field.key, field.type === 'checkbox' ? true : ''])) }

export function AdminCatalogPage() {
  const { entity = '' } = useParams(); const valid = catalogEntities.includes(entity as CatalogEntity); const type: CatalogEntity = valid ? entity as CatalogEntity : 'circuits'; const config = configs[type]
  const { data, isPending, error } = useAdminCatalog(type); const actions = useAdminActions(); const [editing, setEditing] = useState<CatalogItem | null>(null); const [values, setValues] = useState<Record<string, string | boolean>>(() => blank(config.fields))
  if (!valid) return <Navigate to="/admin/catalog/circuits" replace />
  if (type === 'circuits') return <AdminCircuitsPage />
  const reset = () => { setEditing(null); setValues(blank(config.fields)) }; const edit = (item: CatalogItem) => { setEditing(item); setValues(Object.fromEntries(config.fields.map((field) => [field.key, field.type === 'checkbox' ? Boolean(Reflect.get(item, field.key)) : String(Reflect.get(item, field.key) ?? '')]))) }
  const submit = (event: FormEvent) => { event.preventDefault(); actions.saveCatalog.mutate({ entity: type, id: editing?.id ?? null, values }, { onSuccess: reset }) }
  const message = error instanceof ApiError ? error.message : actions.saveCatalog.error instanceof ApiError ? actions.saveCatalog.error.message : actions.deleteCatalog.error instanceof ApiError ? actions.deleteCatalog.error.message : null; const items = data?.[type] ?? []
  
  return (
    <section className="space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-600 dark:text-emerald-400">Administration</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{config.title}</h1>
      </div>
      {message && (
        <p role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
          {message}
        </p>
      )}
      <div className="grid gap-8 xl:grid-cols-[.85fr_1.5fr]">
        <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white dark:bg-[#121214] p-7 shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-colors">
          {config.fields.map((field) => <AdminField key={field.key} field={field} value={values[field.key]} onChange={(value) => setValues({ ...values, [field.key]: value })} />)}
          <div className="flex gap-3 pt-2">
            <button disabled={actions.saveCatalog.isPending} className="rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors disabled:opacity-50">
              {editing ? 'Mettre à jour' : 'Enregistrer'}
            </button>
            {editing && (
              <button type="button" onClick={reset} className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Annuler
              </button>
            )}
          </div>
        </form>
        <div className="overflow-hidden rounded-2xl bg-white dark:bg-[#121214] shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-colors divide-y divide-slate-100 dark:divide-slate-800/80">
          {isPending && <p className="p-6 text-sm text-slate-600 dark:text-slate-300">Chargement…</p>}
          {!isPending && items.length === 0 && <p className="p-6 text-sm text-slate-600 dark:text-slate-300">Aucun élément trouvé.</p>}
          {items.map((item) => (
            <article key={item.id} className="flex items-center justify-between gap-4 p-5">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">{item.name || item.title}</h2>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{item.email || item.address || item.description}</p>
              </div>
              <div className="flex gap-3 text-xs font-bold">
                <button onClick={() => edit(item)} className="text-emerald-700 dark:text-emerald-400 hover:underline">Modifier</button>
                <button onClick={() => { if (confirm('Supprimer cet élément ?')) actions.deleteCatalog.mutate({ entity: type, id: item.id }) }} className="text-red-700 dark:text-red-400 hover:underline">Supprimer</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function AdminCircuitsPage() {
  const { data, isPending, error } = useAdvancedCircuits(); const [editing, setEditing] = useState<CircuitRecord | null>(null)
  const items = (data?.circuits ?? []) as CircuitRecord[]
  const message = error instanceof ApiError ? error.message : null
  
  return (
    <section className="space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-600 dark:text-emerald-400">Administration</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Circuits</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Créez, modifiez et planifiez les circuits proposés.</p>
      </div>
      {message && (
        <p role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
          {message}
        </p>
      )}
      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_1.1fr]">
        <CircuitForm editing={editing} onDone={() => setEditing(null)} />
        <div className="overflow-hidden rounded-2xl bg-white dark:bg-[#121214] shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-colors divide-y divide-slate-100 dark:divide-slate-800/80">
          {isPending && <p className="p-6 text-sm text-slate-600 dark:text-slate-300">Chargement…</p>}
          {!isPending && items.length === 0 && <p className="p-6 text-sm text-slate-600 dark:text-slate-300">Aucun circuit trouvé.</p>}
          {items.map((item) => (
            <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">{item.title}</h2>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{item.duration_days} jours · {item.capacity} places · {item.price} €</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">{item.itineraries.length} étape(s) · {item.departures.length} départ(s)</p>
              </div>
              <button onClick={() => setEditing(item)} className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline">Modifier</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function AdminField({ field, value, onChange }: { field: Field; value: string | boolean; onChange: (value: string | boolean) => void }) { 
  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
        <input 
          type="checkbox" 
          checked={Boolean(value)} 
          onChange={(event) => onChange(event.target.checked)} 
          className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-slate-900"
        />
        {field.label}
      </label>
    )
  } 
  
  return (
    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
      {field.label}
      {field.type === 'textarea' ? (
        <textarea 
          value={String(value)} 
          onChange={(event) => onChange(event.target.value)} 
          required={field.required} 
          className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-3 text-slate-900 dark:text-white outline-none focus:border-emerald-500 min-h-24 transition-colors" 
        />
      ) : (
        <input 
          type={field.type || 'text'} 
          value={String(value)} 
          onChange={(event) => onChange(event.target.value)} 
          required={field.required} 
          className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-3 text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors" 
        />
      )}
    </label>
  )
}