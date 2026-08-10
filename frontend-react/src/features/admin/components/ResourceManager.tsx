import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Pencil, Plus, Trash2, Bold, Italic, 
  List, Link2, Image as ImageIcon, CheckCircle2, Clock, 
  Search, X, Eye, AlertCircle
} from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useBackofficeActions, useBackofficeResource } from '../hooks/useBackoffice'
import type { AdminRecord, BackofficeResource } from '../services/backoffice.service'

type Field = { 
  key: string
  label: string
  type?: 'text' | 'textarea' | 'richtext' | 'number' | 'date' | 'checkbox' | 'select'
  options?: string[] 
}

const configs: Record<BackofficeResource, { title: string; intro: string; fields: Field[]; schema: z.ZodObject<Record<string, z.ZodType>> }> = {
  posts: { 
    title: 'Publications & guides', 
    intro: 'Créez les contenus éditoriaux visibles par vos voyageurs.', 
    fields: [
      { key: 'title', label: 'Titre' }, 
      { key: 'slug', label: 'Slug' }, 
      { key: 'excerpt', label: 'Introduction', type: 'textarea' }, 
      { key: 'content', label: 'Contenu', type: 'richtext' }, 
      { key: 'cover_image', label: 'Image de couverture (URL)' }, 
      { key: 'status', label: 'Statut', type: 'select', options: ['draft', 'published', 'scheduled'] }, 
      { key: 'published_at', label: 'Publication prévue', type: 'date' }
    ], 
    schema: z.object({ title: z.string().min(2), slug: z.string().min(2), excerpt: z.string().optional(), content: z.string().optional(), cover_image: z.string().optional(), status: z.enum(['draft', 'published', 'scheduled']), published_at: z.string().optional() }) 
  },
  banners: { 
    title: 'Bannières Hero', 
    intro: 'Pilotez les campagnes et messages de la page d’accueil.', 
    fields: [
      { key: 'title', label: 'Titre' }, 
      { key: 'subtitle', label: 'Sous-titre', type: 'textarea' }, 
      { key: 'image_url', label: 'Image (URL)' }, 
      { key: 'cta_label', label: 'Libellé CTA' }, 
      { key: 'cta_url', label: 'Lien CTA' }, 
      { key: 'display_order', label: 'Ordre', type: 'number' }, 
      { key: 'is_active', label: 'Active', type: 'checkbox' }
    ], 
    schema: z.object({ title: z.string().min(2), subtitle: z.string().optional(), image_url: z.string().optional(), cta_label: z.string().optional(), cta_url: z.string().optional(), display_order: z.coerce.number().int().min(0), is_active: z.boolean() }) 
  },
  coupons: { 
    title: 'Codes promotionnels', 
    intro: 'Créez et cadrez les réductions applicables aux circuits.', 
    fields: [
      { key: 'code', label: 'Code' }, 
      { key: 'discount_type', label: 'Type', type: 'select', options: ['percent', 'fixed'] }, 
      { key: 'discount_value', label: 'Valeur', type: 'number' }, 
      { key: 'valid_from', label: 'Début', type: 'date' }, 
      { key: 'valid_until', label: 'Fin', type: 'date' }, 
      { key: 'max_uses', label: 'Utilisations max', type: 'number' }, 
      { key: 'is_active', label: 'Actif', type: 'checkbox' }
    ], 
    schema: z.object({ code: z.string().min(2), discount_type: z.enum(['percent', 'fixed']), discount_value: z.coerce.number().positive(), valid_from: z.string().optional(), valid_until: z.string().optional(), max_uses: z.coerce.number().int().positive().optional(), is_active: z.boolean() }) 
  },
  reviews: { 
    title: 'Modération des avis', 
    intro: 'Approuvez, refusez et répondez aux témoignages clients.', 
    fields: [
      { key: 'rating', label: 'Note / 5', type: 'number' }, 
      { key: 'comment', label: 'Avis', type: 'textarea' }, 
      { key: 'status', label: 'Décision', type: 'select', options: ['pending', 'approved', 'rejected'] }, 
      { key: 'admin_response', label: 'Réponse publique', type: 'textarea' }
    ], 
    schema: z.object({ rating: z.coerce.number().int().min(1).max(5), comment: z.string().min(2), status: z.enum(['pending', 'approved', 'rejected']), admin_response: z.string().optional() }) 
  },
}

function defaults(resource: BackofficeResource) { 
  return Object.fromEntries(configs[resource].fields.map((field) => [
    field.key, 
    field.type === 'checkbox' ? true : field.key === 'status' ? (resource === 'posts' ? 'draft' : resource === 'reviews' ? 'pending' : '') : field.key === 'discount_type' ? 'percent' : field.key === 'display_order' ? 0 : ''
  ])) 
}

export function ResourceManager({ resource }: { resource: BackofficeResource }) {
  const config = configs[resource]
  const { data, isPending } = useBackofficeResource(resource)
  const actions = useBackofficeActions()
  const [editing, setEditing] = useState<AdminRecord | null>(null)
  const [deleting, setDeleting] = useState<AdminRecord | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  const form = useForm<Record<string, unknown>>({ 
    resolver: zodResolver(config.schema), 
    defaultValues: defaults(resource) 
  })

  useEffect(() => { 
    form.reset(editing ? { ...defaults(resource), ...editing } : defaults(resource)) 
    setSearchQuery('')
  }, [editing, form, resource])

  const submit = form.handleSubmit((values) => 
    actions.saveResource.mutate({ resource, id: editing?.id, values }, { 
      onSuccess: () => { setEditing(null); form.reset(defaults(resource)) } 
    })
  )

  const rows = data?.[resource] ?? []

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows
    const query = searchQuery.toLowerCase()
    return rows.filter((row) => {
      const searchableText = `${row.title || ''} ${row.code || ''} ${row.excerpt || ''} ${row.subtitle || ''} ${row.comment || ''}`.toLowerCase()
      return searchableText.includes(query)
    })
  }, [rows, searchQuery])

  return (
    <section className="min-h-screen bg-slate-50/50 pb-20">
      <header className="mb-8 px-6 pt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.22em] text-emerald-600">Administration Backoffice</p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">{config.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{config.intro}</p>
          </div>
          {editing && (
            <button 
              onClick={() => setEditing(null)}
              className="self-start md:self-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <X size={14} /> Annuler l'édition en cours
            </button>
          )}
        </div>
      </header>

      <div className="mx-6 grid gap-8 xl:grid-cols-[420px_1fr]">
        <form onSubmit={submit} className="h-fit rounded-3xl bg-white p-6 shadow-sm border border-slate-200 sticky top-6">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${editing ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <h2 className="text-base font-black text-slate-900">
                {editing ? 'Modifier l’élément' : 'Ajouter un élément'}
              </h2>
            </div>
            {editing && (
              <span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700">
                Mode édition
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            {config.fields.map((field) => (
              <ResourceField key={field.key} field={field} form={form} />
            ))}
          </div>
          
          <div className="mt-8 flex gap-3">
            {editing && (
              <button 
                type="button" 
                onClick={() => { setEditing(null); form.reset(defaults(resource)); }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Annuler
              </button>
            )}
            <button 
              type="submit"
              disabled={actions.saveResource.isPending} 
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:opacity-50"
            >
              <Plus size={16} />
              {actions.saveResource.isPending ? 'Enregistrement...' : (editing ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>

        <div className="rounded-3xl bg-white shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <h3 className="font-black text-slate-900">Éléments enregistrés</h3>
              <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                {filteredRows.length} / {rows.length}
              </span>
            </div>

            <div className="relative min-w-[240px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Filtrer par titre, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-medium outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1">
            {isPending ? (
              <div className="space-y-4 p-6">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 px-4 text-center">
                <AlertCircle size={40} className="mb-3 text-slate-300" />
                <p className="font-bold text-slate-700">Aucun élément trouvé</p>
                <p className="text-xs text-slate-400 mt-1">
                  {searchQuery ? 'Essayez de modifier votre recherche.' : 'Commencez par créer votre premier élément via le formulaire.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredRows.map((row) => (
                  <article key={row.id} className="flex items-start justify-between gap-4 p-5 transition hover:bg-slate-50/80 group">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition">
                          {String(row.title || row.code || `Avis ${row.rating}/5`)}
                        </h4>
                        <StatusBadge status={String(row.status || (row.is_active ? 'actif' : 'inactif'))} />
                      </div>
                      {/* FIX TS2322: Utilisation explicite de String() pour éviter le type unknown */}
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                        {String(row.excerpt || row.subtitle || row.comment || row.admin_response || 'Aucun détail supplémentaire.')}
                      </p>
                      {Boolean(row.cover_image) && (
                        <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          <ImageIcon size={12} /> Contient une image
                        </span>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1.5 opacity-90 group-hover:opacity-100">
                      <button 
                        aria-label="Modifier" 
                        onClick={() => { setEditing(row); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        aria-label="Supprimer" 
                        onClick={() => setDeleting(row)} 
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog 
        open={Boolean(deleting)} 
        title="Supprimer cet élément ?" 
        description="Cette action est définitive et supprimera l'élément de la base de données." 
        danger 
        confirmLabel="Confirmer la suppression" 
        pending={actions.deleteResource.isPending} 
        onCancel={() => setDeleting(null)} 
        onConfirm={() => deleting && actions.deleteResource.mutate({ resource, id: deleting.id }, { onSuccess: () => setDeleting(null) })} 
      />
    </section>
  )
}

function ResourceField({ field, form }: { field: Field; form: ReturnType<typeof useForm<Record<string, unknown>>> }) { 
  const error = form.formState.errors[field.key]?.message as string | undefined
  const watchedValue = form.watch(field.key)
  
  if (field.type === 'checkbox') {
    return (
      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 transition hover:bg-slate-100">
        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" {...form.register(field.key)} />
        <span className="text-xs font-bold text-slate-700">{field.label}</span>
      </label>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-bold text-slate-700">{field.label}</label>
        {(field.key === 'cover_image' || field.key === 'image_url') && typeof watchedValue === 'string' && watchedValue.startsWith('http') && (
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
            <Eye size={10} /> Aperçu valide
          </span>
        )}
      </div>
      
      {field.type === 'textarea' ? (
        <textarea className="w-full min-h-[90px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" {...form.register(field.key)} />
      ) : field.type === 'richtext' ? (
        <RichTextEditorPlaceholder form={form} fieldKey={field.key} />
      ) : field.type === 'select' ? (
        <select className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" {...form.register(field.key)}>
          {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" type={field.type || 'text'} {...form.register(field.key)} />
      )}

      {(field.key === 'cover_image' || field.key === 'image_url') && typeof watchedValue === 'string' && watchedValue.startsWith('http') && (
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 h-20 bg-slate-100 relative">
          <img src={watchedValue} alt="Aperçu" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
        </div>
      )}
      
      {error && <span className="mt-1 block text-[11px] font-medium text-red-600">{error}</span>}
    </div>
  ) 
}

function RichTextEditorPlaceholder({ form, fieldKey }: { form: any, fieldKey: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50 px-2.5 py-1.5">
        <button type="button" tabIndex={-1} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"><Bold size={14} /></button>
        <button type="button" tabIndex={-1} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"><Italic size={14} /></button>
        <div className="h-3 w-px bg-slate-200 mx-1"></div>
        <button type="button" tabIndex={-1} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"><List size={14} /></button>
        <button type="button" tabIndex={-1} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"><Link2 size={14} /></button>
        <button type="button" tabIndex={-1} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"><ImageIcon size={14} /></button>
      </div>
      <textarea 
        className="w-full min-h-[180px] resize-y p-3.5 text-xs outline-none" 
        placeholder="Rédigez le contenu détaillé ici..."
        {...form.register(fieldKey)} 
      />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'published' || status === 'approved' || status === 'actif') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 border border-emerald-200/60"><CheckCircle2 size={10} /> {status}</span>
  }
  if (status === 'draft' || status === 'pending' || status === 'scheduled') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 border border-amber-200/60"><Clock size={10} /> {status}</span>
  }
  return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-600">{status}</span>
}