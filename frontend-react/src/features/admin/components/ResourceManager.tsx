import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Pencil, Plus, Trash2, Bold, Italic, 
  List, Link2, Image as ImageIcon, CheckCircle2, Clock 
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useBackofficeActions, useBackofficeResource } from '../hooks/useBackoffice'
import type { AdminRecord, BackofficeResource } from '../services/backoffice.service'

// 1. Définition des types de champs étendus
type Field = { 
  key: string
  label: string
  type?: 'text' | 'textarea' | 'richtext' | 'number' | 'date' | 'checkbox' | 'select'
  options?: string[] 
}

// 2. Configuration des ressources avec le champ "richtext" pour le contenu
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
  
  const form = useForm<Record<string, unknown>>({ 
    resolver: zodResolver(config.schema), 
    defaultValues: defaults(resource) 
  })

  useEffect(() => { 
    form.reset(editing ? { ...defaults(resource), ...editing } : defaults(resource)) 
  }, [editing, form, resource])

  const submit = form.handleSubmit((values) => 
    actions.saveResource.mutate({ resource, id: editing?.id, values }, { 
      onSuccess: () => { setEditing(null); form.reset(defaults(resource)) } 
    })
  )

  const rows = data?.[resource] ?? []

  return (
    <section className="min-h-screen bg-slate-50 pb-20">
      {/* En-tête de la page */}
      <header className="mb-8 px-6 pt-8">
        <p className="text-sm font-bold uppercase tracking-[.22em] text-emerald-600">Administration</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">{config.title}</h1>
        <p className="mt-2 text-slate-500">{config.intro}</p>
      </header>

      <div className="mx-6 grid gap-8 xl:grid-cols-[400px_1fr] 2xl:grid-cols-[450px_1fr]">
        
        {/* Colonne de gauche : Formulaire */}
        <form onSubmit={submit} className="h-fit rounded-3xl bg-white p-6 shadow-sm border border-slate-200 sticky top-6">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">{editing ? 'Modifier l’élément' : 'Créer un élément'}</h2>
            {editing && (
              <button type="button" onClick={() => setEditing(null)} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition">
                Annuler
              </button>
            )}
          </div>
          
          <div className="space-y-5">
            {config.fields.map((field) => (
              <ResourceField key={field.key} field={field} form={form} />
            ))}
          </div>
          
          <button 
            disabled={actions.saveResource.isPending} 
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white shadow-md transition hover:bg-emerald-800 disabled:opacity-50"
          >
            <Plus size={18} />
            {actions.saveResource.isPending ? 'Enregistrement...' : (editing ? 'Mettre à jour' : 'Créer l’élément')}
          </button>
        </form>

        {/* Colonne de droite : Liste des éléments */}
        <div className="rounded-3xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <h3 className="font-black text-slate-900">Éléments enregistrés</h3>
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">{rows.length} au total</span>
          </div>

          {isPending ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <List size={48} className="mb-4 opacity-50" />
              <p className="font-medium text-slate-500">Aucun élément à afficher pour le moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {rows.map((row) => (
                <article key={row.id} className="flex items-start justify-between gap-4 p-6 transition hover:bg-slate-50/80">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="truncate text-lg font-bold text-slate-900">
                        {String(row.title || row.code || `Avis ${row.rating}/5`)}
                      </h4>
                      <StatusBadge status={String(row.status || (row.is_active ? 'actif' : 'inactif'))} />
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm text-slate-500 leading-relaxed">
                      {String(row.excerpt || row.subtitle || row.comment || row.admin_response || 'Aucune description disponible.')}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button aria-label="Modifier" onClick={() => setEditing(row)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700">
                      <Pencil size={18} />
                    </button>
                    <button aria-label="Supprimer" onClick={() => setDeleting(row)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:border-red-300 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog 
        open={Boolean(deleting)} 
        title="Supprimer cet élément ?" 
        description="Cette action est définitive et ne peut pas être annulée." 
        danger 
        confirmLabel="Oui, supprimer" 
        pending={actions.deleteResource.isPending} 
        onCancel={() => setDeleting(null)} 
        onConfirm={() => deleting && actions.deleteResource.mutate({ resource, id: deleting.id }, { onSuccess: () => setDeleting(null) })} 
      />
    </section>
  )
}

/* --- SOUS-COMPOSANTS --- */

function ResourceField({ field, form }: { field: Field; form: ReturnType<typeof useForm<Record<string, unknown>>> }) { 
  const error = form.formState.errors[field.key]?.message as string | undefined
  
  if (field.type === 'checkbox') {
    return (
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
        <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" {...form.register(field.key)} />
        <span className="text-sm font-bold text-slate-700">{field.label}</span>
      </label>
    )
  }

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-bold text-slate-700">{field.label}</label>
      
      {field.type === 'textarea' ? (
        <textarea className="w-full min-h-[100px] rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" {...form.register(field.key)} />
      ) : field.type === 'richtext' ? (
        <RichTextEditorPlaceholder form={form} fieldKey={field.key} />
      ) : field.type === 'select' ? (
        <select className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white" {...form.register(field.key)}>
          {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" type={field.type || 'text'} {...form.register(field.key)} />
      )}
      
      {error && <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span>}
    </div>
  ) 
}

// Faux éditeur de texte pour préparer l'intégration d'une vraie librairie
function RichTextEditorPlaceholder({ form, fieldKey }: { form: any, fieldKey: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <button type="button" className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800"><Bold size={16} /></button>
        <button type="button" className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800"><Italic size={16} /></button>
        <div className="h-4 w-px bg-slate-300 mx-1"></div>
        <button type="button" className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800"><List size={16} /></button>
        <button type="button" className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800"><Link2 size={16} /></button>
        <button type="button" className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800"><ImageIcon size={16} /></button>
      </div>
      <textarea 
        className="w-full min-h-[250px] resize-y p-4 text-sm outline-none" 
        placeholder="Rédigez votre contenu ici..."
        {...form.register(fieldKey)} 
      />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'published' || status === 'approved' || status === 'actif') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-800"><CheckCircle2 size={12} /> {status}</span>
  }
  if (status === 'draft' || status === 'pending' || status === 'scheduled') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-amber-800"><Clock size={12} /> {status}</span>
  }
  return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-slate-600">{status}</span>
}