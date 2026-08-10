import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Save, 
  Building2, 
  Palette, 
  Share2, 
  FileText, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  MessageCircle, 
  Camera,
  AtSign,
  Video,
  Check,
  Upload 
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useBackofficeActions, useSettings } from '../hooks/useBackoffice'

const schema = z.object({
  // Identité & Général
  site_name: z.string().min(2, "Le nom du site est trop court"),
  contact_email: z.string().email("Email invalide").or(z.literal('')),
  contact_phone: z.string().optional(),
  contact_address: z.string().optional(),
  currency: z.string().length(3, "La devise doit faire 3 caractères (ex: EUR)"),
  vat_rate: z.number().min(0).max(100),
  cancellation_hours: z.number().int().min(0),
  
  // Design & Branding (Stocké en base64 après upload)
  logo_url: z.string().optional().or(z.literal('')),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Format hexadécimal requis (ex: #059669)").optional(),
  
  // Réseaux sociaux & Contact rapide
  whatsapp: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  youtube: z.string().optional(),

  // Légal (CGU & Confidentialité)
  terms_and_conditions: z.string().optional(),
  privacy_policy: z.string().optional(),
})

type Values = z.infer<typeof schema>

const initial: Values = {
  site_name: 'TravelMS',
  contact_email: '',
  contact_phone: '',
  contact_address: '',
  currency: 'EUR',
  vat_rate: 20,
  cancellation_hours: 48,
  logo_url: '',
  primary_color: '#059669',
  whatsapp: '',
  facebook: '',
  instagram: '',
  twitter: '',
  youtube: '',
  terms_and_conditions: '',
  privacy_policy: '',
}

export function AdminSettingsPage() {
  const settings = useSettings()
  const actions = useBackofficeActions()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: initial })
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'social' | 'legal'>('general')

  const currentLogo = form.watch('logo_url')

  useEffect(() => {
    const value = settings.data?.settings.find((setting) => setting.key === 'general')?.value
    if (value) form.reset({ ...initial, ...value })
  }, [settings.data, form])

  const submit = form.handleSubmit((value) => actions.saveSetting.mutate({ key: 'general', value }))

  return (
    <section className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10 transition-colors">
      <div className="max-w-5xl mx-auto">
        {/* En-tête */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-600 dark:text-emerald-400">
            Administration
          </p>
          <h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
            Paramètres de l'organisation
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gérez l'identité, l'apparence, les réseaux et le contenu légal de votre plateforme.
          </p>
        </div>

        {/* Navigation par onglets UI/UX */}
        <div className="mt-6 flex gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
          <TabButton 
            active={activeTab === 'general'} 
            onClick={() => setActiveTab('general')} 
            icon={<Building2 size={16} />} 
            label="Général & Contact" 
          />
          <TabButton 
            active={activeTab === 'appearance'} 
            onClick={() => setActiveTab('appearance')} 
            icon={<Palette size={16} />} 
            label="Apparence & Branding" 
          />
          <TabButton 
            active={activeTab === 'social'} 
            onClick={() => setActiveTab('social')} 
            icon={<Share2 size={16} />} 
            label="Réseaux sociaux" 
          />
          <TabButton 
            active={activeTab === 'legal'} 
            onClick={() => setActiveTab('legal')} 
            icon={<FileText size={16} />} 
            label="Pages légales & CGU" 
          />
        </div>

        {settings.isPending ? (
          <div className="mt-8 space-y-4">
            <Skeleton className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6">
            <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200 dark:border-slate-800 transition-all min-h-[450px] flex flex-col justify-between">
              
              <div>
                {/* ONGLET 1 : GÉNÉRAL */}
                {activeTab === 'general' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Informations générales</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Nom de votre site, coordonnées principales et règles financières.</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 pt-2">
                      <Field form={form} name="site_name" label="Nom du site / Agence" icon={<Globe size={15} />} />
                      <Field form={form} name="contact_email" label="E-mail de contact" type="email" icon={<Mail size={15} />} />
                      <Field form={form} name="contact_phone" label="Téléphone" icon={<Phone size={15} />} />
                      <Field form={form} name="contact_address" label="Adresse postale complète" icon={<MapPin size={15} />} placeholder="123 rue du Voyage, 75000 Paris" />
                    </div>
                    
                    <hr className="border-slate-100 dark:border-slate-800 my-4" />
                    
                    <div className="grid gap-6 md:grid-cols-3">
                      <Field form={form} name="currency" label="Devise (ISO)" placeholder="EUR" />
                      <Field form={form} name="vat_rate" label="Taux de TVA (%)" type="number" />
                      <Field form={form} name="cancellation_hours" label="Annulation gratuite (h)" type="number" />
                    </div>
                  </div>
                )}

                {/* ONGLET 2 : APPARENCE & BRANDING */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Apparence et Identité visuelle</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Téléchargez le logo et personnalisez les couleurs principales de votre interface.</p>
                    </div>
                    
                    <div className="grid gap-8 md:grid-cols-2 pt-2">
                      <div className="space-y-4">
                        <ImageUploadField form={form} name="logo_url" label="Logo principal (Fichier image)" />
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 flex items-center justify-center min-h-[120px]">
                          {currentLogo ? (
                            <img 
                              src={currentLogo} 
                              alt="Aperçu du logo" 
                              className="max-h-16 max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-xs text-slate-400">Aucun logo sélectionné</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Couleur principale (Thème)</label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="color" 
                            {...form.register('primary_color')} 
                            className="h-12 w-16 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent cursor-pointer p-1"
                          />
                          <input 
                            type="text" 
                            {...form.register('primary_color')} 
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 uppercase"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-2">Cette couleur sera utilisée pour les boutons, liens actifs et éléments de mise en évidence.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ONGLET 3 : RÉSEAUX SOCIAUX */}
                {activeTab === 'social' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Réseaux Sociaux & Contact</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Liens affichés dans le pied de page (footer) et vos communications client.</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 pt-2">
                      <Field form={form} name="whatsapp" label="Numéro WhatsApp" placeholder="+33600000000" icon={<MessageCircle size={15} />} />
                      <Field form={form} name="facebook" label="Page Facebook" placeholder="https://facebook.com/..." icon={<Globe size={15} />} />
                      <Field form={form} name="instagram" label="Profil Instagram" placeholder="https://instagram.com/..." icon={<Camera size={15} />} />
                      <Field form={form} name="twitter" label="X (Twitter)" placeholder="https://x.com/..." icon={<AtSign size={15} />} />
                      <Field form={form} name="youtube" label="Chaîne YouTube" placeholder="https://youtube.com/..." icon={<Video size={15} />} />
                    </div>
                  </div>
                )}

                {/* ONGLET 4 : PAGES LÉGALES & CGU */}
                {activeTab === 'legal' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Informations légales & CGU</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Contenu textuel de vos conditions générales et politique de confidentialité.</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-1 pt-2">
                      <TextAreaField form={form} name="terms_and_conditions" label="Conditions Générales d'Utilisation / Vente (CGU/CGV)" placeholder="Écrivez ou collez vos CGU ici..." />
                      <TextAreaField form={form} name="privacy_policy" label="Politique de confidentialité (RGPD)" placeholder="Écrivez ou collez votre politique de confidentialité ici..." />
                    </div>
                  </div>
                )}
              </div>

              {/* Barre d'action fixe en bas */}
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                {actions.saveSetting.isSuccess ? (
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-pulse">
                    <Check size={16} /> Modifications enregistrées avec succès.
                  </p>
                ) : (
                  <span />
                )}

                <button 
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer ml-auto" 
                  disabled={actions.saveSetting.isPending}
                >
                  <Save size={18} />
                  {actions.saveSetting.isPending ? 'Enregistrement…' : 'Enregistrer les modifications'}
                </button>
              </div>

            </div>
          </form>
        )}
      </div>
    </section>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
        active 
          ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400' 
          : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function Field({ 
  form, 
  name, 
  label, 
  type = 'text', 
  placeholder, 
  icon 
}: { 
  form: ReturnType<typeof useForm<Values>>; 
  name: keyof Values; 
  label: string; 
  type?: string; 
  placeholder?: string; 
  icon?: React.ReactNode 
}) { 
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </span>
      <input 
        type={type} 
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-normal text-slate-900 dark:text-white outline-none focus:ring-2 transition-all ${
          form.formState.errors[name] 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800' 
            : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
        }`} 
        {...form.register(name, type === 'number' ? { valueAsNumber: true } : undefined)} 
      />
      {form.formState.errors[name] && (
        <span className="block text-xs font-medium text-red-600 dark:text-red-400 mt-1">
          {form.formState.errors[name]?.message as string}
        </span>
      )}
    </label>
  ) 
}

function ImageUploadField({ 
  form, 
  name, 
  label 
}: { 
  form: ReturnType<typeof useForm<Values>>; 
  name: keyof Values; 
  label: string; 
}) { 
  const currentValue = form.watch(name) as string

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      form.setValue(name, base64String, { shouldDirty: true, shouldValidate: true })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-1.5">
      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
        <Upload size={14} className="text-slate-400" />
        {label}
      </span>
      <div className="flex items-center gap-3">
        <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-500 transition text-sm font-medium text-slate-600 dark:text-slate-300">
          <Upload size={16} className="text-slate-400" />
          <span>{currentValue ? 'Changer le fichier...' : 'Sélectionner une image...'}</span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange} 
          />
        </label>
        {currentValue && (
          <button 
            type="button"
            onClick={() => form.setValue(name, '', { shouldDirty: true, shouldValidate: true })}
            className="px-3.5 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl border border-red-200 dark:border-red-900 transition cursor-pointer"
          >
            Effacer
          </button>
        )}
      </div>
      {form.formState.errors[name] && (
        <span className="block text-xs font-medium text-red-600 dark:text-red-400 mt-1">
          {form.formState.errors[name]?.message as string}
        </span>
      )}
    </div>
  )
}

function TextAreaField({ 
  form, 
  name, 
  label, 
  placeholder 
}: { 
  form: ReturnType<typeof useForm<Values>>; 
  name: keyof Values; 
  label: string; 
  placeholder?: string 
}) { 
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
        {label}
      </span>
      <textarea 
        rows={6}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-3 text-sm font-normal text-slate-900 dark:text-white outline-none focus:ring-2 transition-all resize-y ${
          form.formState.errors[name] 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800' 
            : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
        }`} 
        {...form.register(name)} 
      />
      {form.formState.errors[name] && (
        <span className="block text-xs font-medium text-red-600 dark:text-red-400 mt-1">
          {form.formState.errors[name]?.message as string}
        </span>
      )}
    </label>
  ) 
}