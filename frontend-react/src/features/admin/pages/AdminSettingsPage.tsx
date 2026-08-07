import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useBackofficeActions, useSettings } from '../hooks/useBackoffice'

const schema = z.object({ site_name: z.string().min(2), contact_email: z.string().email(), contact_phone: z.string().optional(), currency: z.string().length(3), vat_rate: z.number().min(0).max(100), cancellation_hours: z.number().int().min(0), facebook: z.string().optional(), instagram: z.string().optional() })
type Values = z.infer<typeof schema>
const initial: Values = { site_name: 'TravelMS', contact_email: '', contact_phone: '', currency: 'EUR', vat_rate: 20, cancellation_hours: 48, facebook: '', instagram: '' }
export function AdminSettingsPage() {
  const settings = useSettings(); const actions = useBackofficeActions(); const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: initial })
  useEffect(() => { const value = settings.data?.settings.find((setting) => setting.key === 'general')?.value; if (value) form.reset({ ...initial, ...value }) }, [settings.data, form])
  const submit = form.handleSubmit((value) => actions.saveSetting.mutate({ key: 'general', value }))
  return <section><p className="text-sm font-bold uppercase tracking-[.22em] text-emerald-600">Administration</p><h1 className="mt-2 text-3xl font-black">Paramètres du site</h1><p className="mt-2 text-slate-500">Les réglages sont sauvegardés dans la configuration centralisée.</p>{settings.isPending ? <div className="mt-8 space-y-3"><Skeleton className="h-14" /><Skeleton className="h-14" /><Skeleton className="h-14" /></div> : <form onSubmit={submit} className="mt-8 max-w-4xl rounded-2xl bg-white p-6 shadow-sm"><div className="grid gap-5 md:grid-cols-2"><Field form={form} name="site_name" label="Nom du site" /><Field form={form} name="contact_email" label="E-mail de contact" type="email" /><Field form={form} name="contact_phone" label="Téléphone" /><Field form={form} name="currency" label="Devise par défaut (ISO)" /><Field form={form} name="vat_rate" label="Taux de TVA (%)" type="number" /><Field form={form} name="cancellation_hours" label="Délai d’annulation (heures)" type="number" /><Field form={form} name="facebook" label="Lien Facebook" /><Field form={form} name="instagram" label="Lien Instagram" /></div><button className="action flex items-center gap-2" disabled={actions.saveSetting.isPending}><Save size={17} />Enregistrer les paramètres</button>{actions.saveSetting.isSuccess && <p className="mt-3 text-sm font-bold text-emerald-700">Paramètres enregistrés.</p>}</form>}</section>
}
function Field({ form, name, label, type = 'text' }: { form: ReturnType<typeof useForm<Values>>; name: keyof Values; label: string; type?: string }) { return <label className="block text-sm font-bold text-slate-700">{label}<input type={type} className="field" {...form.register(name, type === 'number' ? { valueAsNumber: true } : undefined)} />{form.formState.errors[name] && <span className="mt-1 block text-xs text-red-700">{form.formState.errors[name]?.message}</span>}</label> }
