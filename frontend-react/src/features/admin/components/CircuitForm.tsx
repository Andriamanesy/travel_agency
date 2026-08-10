import { zodResolver } from '@hookform/resolvers/zod'
import { Minus, Plus } from 'lucide-react'
import { useEffect } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { ApiError } from '@/lib/api-client'
import { useAdminDestinations } from '../hooks/useAdmin'
import { useBackofficeActions } from '../hooks/useBackoffice'

const itinerary = z.object({ day_number: z.number().int().positive(), title: z.string().trim().min(2).max(255), description: z.string().max(10_000), accommodation: z.string().max(255), meals: z.string().max(255) })
const departure = z.object({ start_date: z.string().min(1), end_date: z.string().min(1), total_places: z.coerce.number<number>().int().min(1), reserved_places: z.coerce.number<number>().int().min(0), status: z.enum(['open', 'closed', 'cancelled']) })
const circuitSchema = z.object({ destination_id: z.string().uuid('Sélectionnez une destination.'), title: z.string().trim().min(2).max(255), description: z.string().trim().min(10).max(10_000), available_from: z.string(), available_to: z.string(), price: z.coerce.number<number>().min(0), duration_days: z.coerce.number<number>().int().min(1), capacity: z.coerce.number<number>().int().min(1), cover_image: z.string().trim().max(512), gallery_urls: z.array(z.string()), inclusions: z.array(z.string()), exclusions: z.array(z.string()), itineraries: z.array(itinerary), departures: z.array(departure), is_active: z.boolean() }).superRefine((value, context) => { if (value.available_from && value.available_to && value.available_to <= value.available_from) context.addIssue({ code: 'custom', path: ['available_to'], message: 'La date de fin doit suivre la date de début.' }); value.departures.forEach((item, index) => { if (item.end_date <= item.start_date) context.addIssue({ code: 'custom', path: ['departures', index, 'end_date'], message: 'La fin doit suivre le départ.' }); if (item.reserved_places > item.total_places) context.addIssue({ code: 'custom', path: ['departures', index, 'reserved_places'], message: 'Dépasse les places totales.' }) }) })
export type CircuitValues = z.infer<typeof circuitSchema>
export type CircuitRecord = CircuitValues & { id: string }
const emptyValues: CircuitValues = { destination_id: '', title: '', description: '', available_from: '', available_to: '', price: 0, duration_days: 1, capacity: 1, cover_image: '', gallery_urls: [], inclusions: [], exclusions: [], itineraries: [], departures: [], is_active: true }
const emptyItinerary = (day_number: number) => ({ day_number, title: '', description: '', accommodation: '', meals: '' })
const emptyDeparture = () => ({ start_date: '', end_date: '', total_places: 1, reserved_places: 0, status: 'open' as const })

export function CircuitForm({ editing, onDone }: { editing: CircuitRecord | null; onDone: () => void }) {
  const { data: destinations } = useAdminDestinations(); const actions = useBackofficeActions(); const form = useForm<CircuitValues>({ resolver: zodResolver(circuitSchema), defaultValues: emptyValues }); const { register, handleSubmit, reset, control, setValue, formState: { errors } } = form
  const itineraryFields = useFieldArray({ control, name: 'itineraries' }); const departureFields = useFieldArray({ control, name: 'departures' }); const galleryUrls = useWatch({ control, name: 'gallery_urls' }) || []; const inclusions = useWatch({ control, name: 'inclusions' }) || []; const exclusions = useWatch({ control, name: 'exclusions' }) || []
  useEffect(() => { reset(editing ?? emptyValues) }, [editing, reset]); const failure = actions.saveCircuit.error instanceof ApiError ? actions.saveCircuit.error.message : null
  
  return (
    <form noValidate onSubmit={handleSubmit((values) => actions.saveCircuit.mutate({ id: editing?.id ?? null, values }, { onSuccess: onDone }))} className="space-y-5 rounded-2xl bg-white dark:bg-[#121214] p-7 shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <h2 className="text-xl font-black text-slate-900 dark:text-white">{editing ? 'Modifier le circuit' : 'Nouveau circuit'}</h2>
      
      <Field label="Destination" error={errors.destination_id?.message}>
        <select {...register('destination_id')} className="field">
          <option value="">Sélectionner…</option>
          {destinations?.destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.title} — {destination.location}</option>)}
        </select>
      </Field>

      <Field label="Titre" error={errors.title?.message}><input {...register('title')} className="field" /></Field>
      <Field label="Description" error={errors.description?.message}><textarea {...register('description')} className="field min-h-28" /></Field>
      
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Prix (€)" error={errors.price?.message}><input type="number" step="0.01" {...register('price')} className="field" /></Field>
        <Field label="Durée (jours)" error={errors.duration_days?.message}><input type="number" {...register('duration_days')} className="field" /></Field>
        <Field label="Capacité" error={errors.capacity?.message}><input type="number" {...register('capacity')} className="field" /></Field>
      </div>

      <Field label="Image de couverture (URL)" error={errors.cover_image?.message}><input {...register('cover_image')} className="field" /></Field>
      
      <StringList title="Galerie" values={galleryUrls} onChange={(value) => setValue('gallery_urls', value)} placeholder="URL d’image" />
      <StringList title="Inclusions" values={inclusions} onChange={(value) => setValue('inclusions', value)} placeholder="Ex. Hébergement" />
      <StringList title="Exclusions" values={exclusions} onChange={(value) => setValue('exclusions', value)} placeholder="Ex. Vol international" />

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/30">
        <Header title="Programme jour par jour" onAdd={() => itineraryFields.append(emptyItinerary(itineraryFields.fields.length + 1))} />
        {itineraryFields.fields.map((field, index) => (
          <div className="mt-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3" key={field.id}>
            <div className="flex justify-between items-center">
              <b className="text-xs font-bold text-slate-900 dark:text-white">Jour {index + 1}</b>
              <button type="button" onClick={() => itineraryFields.remove(index)} className="text-red-700 dark:text-red-400 hover:opacity-80"><Minus size={17} /></button>
            </div>
            <input type="hidden" {...register(`itineraries.${index}.day_number` as const, { valueAsNumber: true })} value={index + 1} />
            <input className="field" placeholder="Titre de la journée" {...register(`itineraries.${index}.title` as const)} />
            <textarea className="field min-h-20" placeholder="Description" {...register(`itineraries.${index}.description` as const)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="field" placeholder="Hébergement" {...register(`itineraries.${index}.accommodation` as const)} />
              <input className="field" placeholder="Repas inclus" {...register(`itineraries.${index}.meals` as const)} />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/30">
        <Header title="Dates de départ" onAdd={() => departureFields.append(emptyDeparture())} />
        {departureFields.fields.map((field, index) => (
          <div className="mt-4 grid gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:grid-cols-3 items-center" key={field.id}>
            <input type="date" className="field" {...register(`departures.${index}.start_date` as const)} />
            <input type="date" className="field" {...register(`departures.${index}.end_date` as const)} />
            <select className="field" {...register(`departures.${index}.status` as const)}>
              <option value="open">Ouvert</option>
              <option value="closed">Fermé</option>
              <option value="cancelled">Annulé</option>
            </select>
            <input type="number" className="field" placeholder="Places totales" {...register(`departures.${index}.total_places` as const)} />
            <input type="number" className="field" placeholder="Places réservées" {...register(`departures.${index}.reserved_places` as const)} />
            <button type="button" onClick={() => departureFields.remove(index)} className="text-xs font-bold text-red-700 dark:text-red-400 hover:underline justify-self-start sm:justify-self-auto">Supprimer</button>
          </div>
        ))}
      </section>

      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer pt-2">
        <input type="checkbox" {...register('is_active')} className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-slate-900" /> 
        Circuit visible dans le catalogue
      </label>

      {failure && <p role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">{failure}</p>}

      <button disabled={actions.saveCircuit.isPending} className="rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors disabled:opacity-50">
        {actions.saveCircuit.isPending ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer le circuit'}
      </button>
    </form>
  )
}

function Header({ title, onAdd }: { title: string; onAdd: () => void }) { 
  return (
    <div className="flex items-center justify-between">
      <b className="text-sm font-bold text-slate-900 dark:text-white">{title}</b>
      <button type="button" onClick={onAdd} className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
        <Plus size={16} />Ajouter
      </button>
    </div>
  ) 
}

function StringList({ title, values, onChange, placeholder }: { title: string; values: string[]; onChange: (values: string[]) => void; placeholder: string }) { 
  return (
    <section className="space-y-2">
      <Header title={title} onAdd={() => onChange([...values, ''])} />
      {values.map((value, index) => (
        <div key={`${title}-${index}`} className="flex gap-2 items-center">
          <input className="field mt-0" placeholder={placeholder} value={value} onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />
          <button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} className="text-red-700 dark:text-red-400 hover:opacity-80 p-2"><Minus size={17} /></button>
        </div>
      ))}
    </section>
  ) 
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { 
  return (
    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 space-y-1">
      {label}
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-700 dark:text-red-400">{error}</span>}
    </label>
  ) 
}