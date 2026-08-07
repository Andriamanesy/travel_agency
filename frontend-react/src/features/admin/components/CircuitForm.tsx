import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ApiError } from '@/lib/api-client'
import { useAdminActions, useAdminDestinations } from '../hooks/useAdmin'

const circuitSchema = z.object({
  destination_id: z.string().uuid('Sélectionnez une destination.'),
  title: z.string().trim().min(2, 'Le titre est requis.').max(255),
  description: z.string().trim().min(10, 'Décrivez le circuit (10 caractères minimum).').max(10_000),
  available_from: z.string(),
  available_to: z.string(),
  price: z.coerce.number<number>().min(0, 'Le prix doit être positif.'),
  duration_days: z.coerce.number<number>().int().min(1, 'La durée doit être d’au moins un jour.'),
  capacity: z.coerce.number<number>().int().min(1, 'La capacité doit être d’au moins une place.'),
  cover_image: z.string().trim().max(512).refine((value) => !value || /^https?:\/\//.test(value) || value.startsWith('/uploads/'), 'Utilisez une URL http(s) ou un média téléversé.'),
  gallery_urls: z.string().max(5_000),
  is_active: z.boolean(),
}).superRefine((value, context) => {
  if (value.available_from && value.available_to && value.available_to <= value.available_from) {
    context.addIssue({ code: 'custom', path: ['available_to'], message: 'La date de fin doit suivre la date de début.' })
  }
})

export type CircuitValues = z.infer<typeof circuitSchema>
export type CircuitRecord = CircuitValues & { id: string }

const emptyValues: CircuitValues = { destination_id: '', title: '', description: '', available_from: '', available_to: '', price: 0, duration_days: 1, capacity: 1, cover_image: '', gallery_urls: '', is_active: true }

export function CircuitForm({ editing, onDone }: { editing: CircuitRecord | null; onDone: () => void }) {
  const { data: destinations } = useAdminDestinations()
  const actions = useAdminActions()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CircuitValues>({ resolver: zodResolver(circuitSchema), defaultValues: emptyValues })

  useEffect(() => { reset(editing ?? emptyValues) }, [editing, reset])
  const failure = actions.saveCatalog.error instanceof ApiError ? actions.saveCatalog.error.message : null

  return <form noValidate onSubmit={handleSubmit((values) => actions.saveCatalog.mutate({ entity: 'circuits', id: editing?.id ?? null, values }, { onSuccess: onDone }))} className="space-y-4 rounded-3xl bg-white p-7 shadow-sm">
    <h2 className="text-xl font-black">{editing ? 'Modifier le circuit' : 'Nouveau circuit'}</h2>
    <Field label="Destination" error={errors.destination_id?.message}><select {...register('destination_id')} className="field"><option value="">Sélectionner…</option>{destinations?.destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.title} — {destination.location}</option>)}</select></Field>
    <Field label="Titre" error={errors.title?.message}><input {...register('title')} className="field" /></Field>
    <Field label="Description" error={errors.description?.message}><textarea {...register('description')} className="field min-h-28" /></Field>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Disponible à partir du" error={errors.available_from?.message}><input type="date" {...register('available_from')} className="field" /></Field><Field label="Disponible jusqu’au" error={errors.available_to?.message}><input type="date" {...register('available_to')} className="field" /></Field></div>
    <div className="grid gap-4 sm:grid-cols-3"><Field label="Prix (€)" error={errors.price?.message}><input type="number" min="0" step="0.01" {...register('price')} className="field" /></Field><Field label="Durée (jours)" error={errors.duration_days?.message}><input type="number" min="1" {...register('duration_days')} className="field" /></Field><Field label="Capacité" error={errors.capacity?.message}><input type="number" min="1" {...register('capacity')} className="field" /></Field></div>
    <Field label="Image de couverture (URL)" error={errors.cover_image?.message}><input type="url" {...register('cover_image')} className="field" placeholder="https://…" /></Field>
    <Field label="Galerie (une URL par ligne)" error={errors.gallery_urls?.message}><textarea {...register('gallery_urls')} className="field min-h-20" /></Field>
    <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" {...register('is_active')} /> Circuit visible dans le catalogue</label>
    {failure && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{failure}</p>}
    <div className="flex gap-3"><button disabled={actions.saveCatalog.isPending} className="action mt-0">{actions.saveCatalog.isPending ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer le circuit'}</button>{editing && <button type="button" onClick={onDone} className="rounded-xl bg-slate-100 px-4 py-3 font-semibold">Annuler</button>}</div>
  </form>
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold">{label}{children}{error && <span className="mt-1 block text-xs font-medium text-red-700">{error}</span>}</label>
}
