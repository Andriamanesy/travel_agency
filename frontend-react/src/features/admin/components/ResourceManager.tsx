import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Pencil, Plus, Trash2, Bold, Italic, 
  List as ListIcon, Link2, Image as ImageIcon, CheckCircle2, Clock, 
  Search, X, AlertCircle, LayoutGrid, Table as TableIcon, Upload, Sparkles, RefreshCw
} from 'lucide-react'
import { useEffect, useState, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useBackofficeActions, useBackofficeResource } from '../hooks/useBackoffice'
import type { AdminRecord, BackofficeResource } from '../services/backoffice.service'

type Field = { 
  key: string
  label: string
  type?: 'text' | 'textarea' | 'richtext' | 'number' | 'date' | 'checkbox' | 'select' | 'image'
  options?: string[] 
}

const configs: Record<BackofficeResource, { title: string; intro: string; fields: Field[]; schema: z.ZodObject<Record<string, z.ZodType>> }> = {
  posts: { 
    title: 'Publications & guides', 
    intro: 'Créez et gérez les contenus éditoriaux visibles par vos voyageurs.', 
    fields: [
      { key: 'title', label: 'Titre de l’article' }, 
      { key: 'slug', label: 'URL / Slug' }, 
      { key: 'cover_image', label: 'Image de couverture', type: 'image' },
      { key: 'excerpt', label: 'Introduction / Résumé', type: 'textarea' }, 
      { key: 'content', label: 'Contenu principal', type: 'richtext' }, 
      { key: 'status', label: 'Statut de publication', type: 'select', options: ['draft', 'published', 'scheduled'] }, 
      { key: 'published_at', label: 'Date de publication', type: 'date' }
    ], 
    schema: z.object({ title: z.string().min(2, 'Le titre est requis'), slug: z.string().min(2, 'Le slug est requis'), excerpt: z.string().optional(), content: z.string().optional(), cover_image: z.string().optional(), status: z.enum(['draft', 'published', 'scheduled']), published_at: z.string().optional() }) 
  },
  banners: { 
    title: 'Bannières d’accueil', 
    intro: 'Pilotez les visuels et messages promotionnels affichés sur la page d’accueil.', 
    fields: [
      { key: 'title', label: 'Titre principal' }, 
      { key: 'subtitle', label: 'Sous-titre explicatif', type: 'textarea' }, 
      { key: 'image_url', label: 'Image de la bannière', type: 'image' }, 
      { key: 'cta_label', label: 'Texte du bouton (CTA)' }, 
      { key: 'cta_url', label: 'Lien de destination' }, 
      { key: 'display_order', label: 'Ordre d’affichage', type: 'number' }, 
      { key: 'is_active', label: 'Afficher la bannière', type: 'checkbox' }
    ], 
    schema: z.object({ title: z.string().min(2, 'Le titre est requis'), subtitle: z.string().optional(), image_url: z.string().optional(), cta_label: z.string().optional(), cta_url: z.string().optional(), display_order: z.coerce.number().int().min(0), is_active: z.boolean() }) 
  },
  coupons: { 
    title: 'Codes promotionnels', 
    intro: 'Créez et contrôlez les remises et codes de réduction applicables.', 
    fields: [
      { key: 'code', label: 'Code promo (ex: MADAGASCAR2026)' }, 
      { key: 'discount_type', label: 'Type de remise', type: 'select', options: ['percent', 'fixed'] }, 
      { key: 'discount_value', label: 'Valeur de la réduction', type: 'number' }, 
      { key: 'valid_from', label: 'Date de début', type: 'date' }, 
      { key: 'valid_until', label: 'Date d’expiration', type: 'date' }, 
      { key: 'max_uses', label: 'Limite d’utilisations', type: 'number' }, 
      { key: 'is_active', label: 'Activer immédiatement', type: 'checkbox' }
    ], 
    schema: z.object({ code: z.string().min(2, 'Le code est requis'), discount_type: z.enum(['percent', 'fixed']), discount_value: z.coerce.number().positive('La valeur doit être positive'), valid_from: z.string().optional(), valid_until: z.string().optional(), max_uses: z.coerce.number().int().positive().optional(), is_active: z.boolean() }) 
  },
  reviews: { 
    title: 'Modération des avis', 
    intro: 'Consultez, modérez et répondez aux avis laissés par vos clients.', 
    fields: [
      { key: 'rating', label: 'Note attribuée (sur 5)', type: 'number' }, 
      { key: 'comment', label: 'Commentaire du client', type: 'textarea' }, 
      { key: 'status', label: 'Décision de modération', type: 'select', options: ['pending', 'approved', 'rejected'] }, 
      { key: 'admin_response', label: 'Réponse officielle de l’équipe', type: 'textarea' }
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
  const { data, isPending, refetch } = useBackofficeResource(resource)
  const actions = useBackofficeActions()
  
  const [editing, setEditing] = useState<AdminRecord | null>(null)
  const [deleting, setDeleting] = useState<AdminRecord | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const form = useForm<Record<string, unknown>>({ 
    resolver: zodResolver(config.schema), 
    defaultValues: defaults(resource) 
  })

  useEffect(() => { 
    form.reset(editing ? { ...defaults(resource), ...editing } : defaults(resource)) 
    setSearchQuery('')
    setSelectedIds([])
  }, [editing, form, resource])

  const submit = form.handleSubmit((values) => 
    actions.saveResource.mutate({ resource, id: editing?.id, values }, { 
      onSuccess: () => { setEditing(null); form.reset(defaults(resource)) } 
    })
  )

  const rows = (data?.[resource] ?? []) as AdminRecord[]

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Filtre de recherche texte
      const searchableText = `${row.title || ''} ${row.code || ''} ${row.excerpt || ''} ${row.subtitle || ''} ${row.comment || ''}`.toLowerCase()
      const matchesSearch = searchableText.includes(searchQuery.toLowerCase().trim())

      // Filtre de statut rapide
      if (statusFilter === 'all') return matchesSearch
      const currentStatus = String(row.status || (row.is_active ? 'actif' : 'inactif'))
      return matchesSearch && currentStatus.toLowerCase() === statusFilter.toLowerCase()
    })
  }, [rows, searchQuery, statusFilter])

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRows.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredRows.map((r) => String(r.id)))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <section className="min-h-screen bg-slate-50/60 pb-20">
      {/* En-tête de section */}
      <header className="border-b border-slate-200/80 bg-white px-8 py-6 shadow-sm">
        <div className="mx-auto max-w-7xl flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600">
              <Sparkles size={14} />
              <span>Panneau d'administration</span>
            </div>
            <h1 className="mt-1 text-2xl font-black text-slate-900 md:text-3xl">{config.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{config.intro}</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => refetch()} 
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              title="Rafraîchir les données"
            >
              <RefreshCw size={14} className={isPending ? 'animate-spin' : ''} />
              Actualiser
            </button>

            {editing && (
              <button 
                onClick={() => { setEditing(null); form.reset(defaults(resource)) }}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 shadow-sm transition hover:bg-amber-100"
              >
                <X size={14} /> Quitter le mode édition
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="mx-auto max-w-7xl px-6 pt-8 grid gap-8 xl:grid-cols-[420px_1fr]">
        
        {/* Formulaire latéral */}
        <form onSubmit={submit} className="h-fit rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 sticky top-6">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className={`h-3 w-3 rounded-full ${editing ? 'bg-amber-500 ring-4 ring-amber-100' : 'bg-emerald-500 ring-4 ring-emerald-100'}`} />
              <h2 className="text-base font-black text-slate-900">
                {editing ? 'Modifier l’élément' : 'Nouveau contenu'}
              </h2>
            </div>
            {editing && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-800">
                ID #{String(editing.id).slice(0, 6)}
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            {config.fields.map((field) => (
              <ResourceField key={field.key} field={field} form={form} />
            ))}
          </div>
          
          <div className="mt-8 flex gap-3 border-t border-slate-100 pt-5">
            {editing && (
              <button 
                type="button" 
                onClick={() => { setEditing(null); form.reset(defaults(resource)); }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Annuler
              </button>
            )}
            <button 
              type="submit"
              disabled={actions.saveResource.isPending} 
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:opacity-50 cursor-pointer"
            >
              <Plus size={16} />
              {actions.saveResource.isPending ? 'Enregistrement...' : (editing ? 'Enregistrer les modifications' : 'Créer l’élément')}
            </button>
          </div>
        </form>

        {/* Liste des éléments */}
        <div className="rounded-3xl bg-white shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
          
          {/* Barre d'outils et de filtres */}
          <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtre :</span>
              <button 
                onClick={() => setStatusFilter('all')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${statusFilter === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
              >
                Tous ({rows.length})
              </button>
              {resource === 'posts' && (
                <>
                  <button onClick={() => setStatusFilter('published')} className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${statusFilter === 'published' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>Publiés</button>
                  <button onClick={() => setStatusFilter('draft')} className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${statusFilter === 'draft' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>Brouillons</button>
                </>
              )}
              {resource === 'reviews' && (
                <>
                  <button onClick={() => setStatusFilter('approved')} className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${statusFilter === 'approved' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>Approuvés</button>
                  <button onClick={() => setStatusFilter('pending')} className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${statusFilter === 'pending' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>En attente</button>
                </>
              )}
            </div>

            {/* Commutateur de vue & Recherche */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs font-medium outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                <button 
                  onClick={() => setViewMode('cards')} 
                  className={`rounded-lg p-1.5 transition ${viewMode === 'cards' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Vue cartes"
                >
                  <LayoutGrid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('table')} 
                  className={`rounded-lg p-1.5 transition ${viewMode === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Vue tableau"
                >
                  <TableIcon size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* En-tête des sélections groupées */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between bg-emerald-50 px-6 py-3 border-b border-emerald-100">
              <span className="text-xs font-bold text-emerald-900">{selectedIds.length} élément(s) sélectionné(s)</span>
              <button 
                onClick={() => {
                  if (confirm(`Voulez-vous supprimer les ${selectedIds.length} éléments sélectionnés ?`)) {
                    selectedIds.forEach((id) => actions.deleteResource.mutate({ resource, id }))
                    setSelectedIds([])
                  }
                }} 
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700"
              >
                <Trash2 size={13} /> Supprimer la sélection
              </button>
            </div>
          )}

          {/* Affichage des données */}
          <div className="flex-1 p-6">
            {isPending ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
                <AlertCircle size={44} className="mb-3 text-slate-300" />
                <p className="font-bold text-slate-700 text-base">Aucun résultat trouvé</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  {searchQuery ? 'Ajustez votre recherche ou vos filtres pour voir les résultats.' : 'Aucun contenu créé pour le moment dans cette catégorie.'}
                </p>
              </div>
            ) : viewMode === 'cards' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredRows.map((row) => (
                  <article key={String(row.id)} className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(String(row.id))} 
                            onChange={() => toggleSelectOne(String(row.id))} 
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <StatusBadge status={String(row.status || (row.is_active ? 'actif' : 'inactif'))} />
                        </div>
                        
                        <div className="flex gap-1">
                          <button 
                            aria-label="Modifier" 
                            onClick={() => { setEditing(row); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Pencil size={15} />
                          </button>
                          <button 
                            aria-label="Supprimer" 
                            onClick={() => setDeleting(row)} 
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <h4 className="mt-3 font-bold text-slate-900 group-hover:text-emerald-700 transition line-clamp-1">
                        {String(row.title || row.code || `Avis ${row.rating}/5`)}
                      </h4>

                      <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {String(row.excerpt || row.subtitle || row.comment || row.admin_response || 'Aucun détail supplémentaire.')}
                      </p>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
                      <span>ID #{String(row.id).slice(0, 8)}</span>
                      {Boolean(row.cover_image || row.image_url) && (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <ImageIcon size={12} /> Image incluse
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              /* Vue Tableau */
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 w-10 text-center">
                        <input type="checkbox" checked={selectedIds.length === filteredRows.length && filteredRows.length > 0} onChange={toggleSelectAll} className="rounded border-slate-300" />
                      </th>
                      <th className="p-3.5">Élément</th>
                      <th className="p-3.5">Aperçu</th>
                      <th className="p-3.5">Statut</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.map((row) => (
                      <tr key={String(row.id)} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 text-center">
                          <input type="checkbox" checked={selectedIds.includes(String(row.id))} onChange={() => toggleSelectOne(String(row.id))} className="rounded border-slate-300" />
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {String(row.title || row.code || `Avis ${row.rating}/5`)}
                        </td>
                        <td className="p-3.5 text-slate-500 max-w-xs truncate">
                          {String(row.excerpt || row.subtitle || row.comment || '-')}
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={String(row.status || (row.is_active ? 'actif' : 'inactif'))} />
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="inline-flex gap-1">
                            <button onClick={() => { setEditing(row); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-1.5 text-slate-400 hover:text-emerald-700">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => setDeleting(row)} className="p-1.5 text-slate-400 hover:text-red-600">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog 
        open={Boolean(deleting)} 
        title="Supprimer cet élément ?" 
        description="Cette action est définitive et supprimera définitivement cet élément." 
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (field.type === 'checkbox') {
    return (
      <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 transition hover:bg-slate-100">
        <span className="text-xs font-bold text-slate-700">{field.label}</span>
        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer" {...form.register(field.key)} />
      </label>
    )
  }

  // Composant d'Upload d'Image interactif
  if (field.type === 'image') {
    const imageUrl = typeof watchedValue === 'string' ? watchedValue : ''
    
    return (
      <div className="w-full space-y-2">
        <label className="block text-xs font-bold text-slate-700">{field.label}</label>
        
        {imageUrl ? (
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 h-32 bg-slate-100 group">
            <img src={imageUrl} alt="Aperçu" className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <button 
                type="button" 
                onClick={() => form.setValue(field.key, '')} 
                className="rounded-xl bg-red-600 p-2 text-white shadow-md hover:bg-red-700" 
                title="Supprimer l'image"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()} 
            className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 hover:bg-slate-100/60 transition cursor-pointer text-center"
          >
            <Upload size={24} className="text-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-700">Cliquez pour téléverser une image</p>
            <p className="text-[10px] text-slate-400 mt-1">Format JPG, PNG ou WebP</p>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const url = URL.createObjectURL(file)
                  form.setValue(field.key, url)
                }
              }} 
            />
          </div>
        )}

        {/* Input texte alternatif pour les URLs distantes */}
        <input 
          type="text" 
          placeholder="Ou collez une URL d'image (ex: https://...)" 
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs outline-none transition focus:border-emerald-500" 
          {...form.register(field.key)} 
        />
        {error && <span className="text-[11px] font-medium text-red-600">{error}</span>}
      </div>
    )
  }

  return (
    <div className="w-full space-y-1">
      <label className="block text-xs font-bold text-slate-700">{field.label}</label>
      
      {field.type === 'textarea' ? (
        <textarea className="w-full min-h-[85px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" {...form.register(field.key)} />
      ) : field.type === 'richtext' ? (
        <RichTextEditor form={form} fieldKey={field.key} />
      ) : field.type === 'select' ? (
        <select className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" {...form.register(field.key)}>
          {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" type={field.type || 'text'} {...form.register(field.key)} />
      )}

      {error && <span className="block text-[11px] font-medium text-red-600">{error}</span>}
    </div>
  ) 
}

function RichTextEditor({ form, fieldKey }: { form: any; fieldKey: string }) {
  const insertText = (tag: string) => {
    const current = form.getValues(fieldKey) || ''
    form.setValue(fieldKey, `${current} ${tag} `)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition bg-white">
      <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50 px-2 py-1.5">
        <button type="button" onClick={() => insertText('**gras**')} className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900" title="Gras"><Bold size={13} /></button>
        <button type="button" onClick={() => insertText('*italique*')} className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900" title="Italique"><Italic size={13} /></button>
        <div className="h-3 w-px bg-slate-200 mx-1"></div>
        <button type="button" onClick={() => insertText('- Liste')} className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900" title="Liste"><ListIcon size={13} /></button>
        <button type="button" onClick={() => insertText('[Lien](https://)')} className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900" title="Lien"><Link2 size={13} /></button>
      </div>
      <textarea 
        className="w-full min-h-[140px] resize-y p-3 text-xs outline-none" 
        placeholder="Rédigez le contenu détaillé..."
        {...form.register(fieldKey)} 
      />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  if (normalized === 'published' || normalized === 'approved' || normalized === 'actif') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 border border-emerald-200/60"><CheckCircle2 size={10} /> {status}</span>
  }
  if (normalized === 'draft' || normalized === 'pending' || normalized === 'scheduled') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 border border-amber-200/60"><Clock size={10} /> {status}</span>
  }
  return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-600">{status}</span>
}