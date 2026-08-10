import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useBackofficeActions, useSettings } from '../hooks/useBackoffice'

const schema = z.object({ 
  site_name: z.string().min(2), 
  contact_email: z.string().email(), 
  contact_phone: z.string().optional(), 
  currency: z.string().length(3), 
  vat_rate: z.number().min(0).max(100), 
  cancellation_hours: z.number().int().min(0), 
  facebook: z.string().optional(), 
  instagram: z.string().optional() 
})

type Values = z.infer<typeof schema>

const initial: Values = { 
  site_name: 'TravelMS', 
  contact_email: '', 
  contact_phone: '', 
  currency: 'EUR', 
  vat_rate: 20, 
  cancellation_hours: 48, 
  facebook: '', 
  instagram: '' 
}

export function AdminSettingsPage() {
  const settings = useSettings() 
  const actions = useBackofficeActions() 
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: initial })

  useEffect(() => { 
    const value = settings.data?.settings.find((setting) => setting.key === 'general')?.value
    if (value) form.reset({ ...initial, ...value }) 
  }, [settings.data, form])

  const submit = form.handleSubmit((value) => actions.saveSetting.mutate({ key: 'general', value }))

  return (
    <section className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 transition-colors">
      <p className="text-sm font-bold uppercase tracking-[.22em] text-emerald-600 dark:text-emerald-400">Administration</p>
      <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Paramètres du site</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">Les réglages sont sauvegardés dans la configuration centralisée.</p>

      {settings.isPending ? (
        <div className="mt-8 max-w-4xl space-y-3">
          <Skeleton className="h-14 bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-14 bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-14 bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 max-w-4xl rounded-3xl bg-white dark:bg-slate-900 p-7 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="grid gap-5 md:grid-cols-2">
            <Field form={form} name="site_name" label="Nom du site" />
            <Field form={form} name="contact_email" label="E-mail de contact" type="email" />
            <Field form={form} name="contact_phone" label="Téléphone" />
            <Field form={form} name="currency" label="Devise par défaut (ISO)" />
            <Field form={form} name="vat_rate" label="Taux de TVA (%)" type="number" />
            <Field form={form} name="cancellation_hours" label="Délai d’annulation (heures)" type="number" />
            <Field form={form} name="facebook" label="Lien Facebook" />
            <Field form={form} name="instagram" label="Lien Instagram" />
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-5">
            <button 
              className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-800 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer" 
              disabled={actions.saveSetting.isPending}
            >
              <Save size={17} />
              {actions.saveSetting.isPending ? 'Enregistrement…' : 'Enregistrer les paramètres'}
            </button>

            {actions.saveSetting.isSuccess && (
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Paramètres enregistrés.</p>
            )}
          </div>
        </form>
      )}
    </section>
  )
}

function Field({ form, name, label, type = 'text' }: { form: ReturnType<typeof useForm<Values>>; name: keyof Values; label: string; type?: string }) { 
  return (
    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
      {label}
      <input 
        type={type} 
        className="mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-normal text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" 
        {...form.register(name, type === 'number' ? { valueAsNumber: true } : undefined)} 
      />
      {form.formState.errors[name] && (
        <span className="mt-1 block text-xs font-normal text-red-600 dark:text-red-400">
          {form.formState.errors[name]?.message}
        </span>
      )}
    </label>
  ) 
}