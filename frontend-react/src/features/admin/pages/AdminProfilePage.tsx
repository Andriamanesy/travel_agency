import { useState } from 'react'
import { useSessionStore } from '@/features/auth/store/session.store'
import { 
  User, Lock, CheckCircle2, ShieldAlert, Loader2, Eye, EyeOff, ShieldCheck 
} from 'lucide-react'

// --- Composant utilitaire pour la mise en page (Split Layout) ---
function SettingsSection({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 py-8 border-b border-slate-200 dark:border-slate-800/60 last:border-0">
      <div className="md:col-span-1 space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
      <div className="md:col-span-2">
        <div className="bg-white dark:bg-[#121214] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

export function AdminProfilePage() {
  const user = useSessionStore((state) => state.user)
  const updateUser = useSessionStore((state) => state.updateUser)

  // États Profil
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [profilePassword, setProfilePassword] = useState('')
  const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [profileErrorMsg, setProfileErrorMsg] = useState('')

  // États Mot de passe
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('')

  // UX: Vérification de la force du mot de passe en temps réel
  const isPasswordLongEnough = newPassword.length >= 8
  const doPasswordsMatch = newPassword === confirmPassword && newPassword.length > 0

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profilePassword) {
      setProfileErrorMsg('Votre mot de passe actuel est requis.')
      setProfileStatus('error')
      return
    }

    setProfileStatus('loading')
    // Simulation d'appel réseau
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    updateUser({ name, email })
    setProfileStatus('success')
    setProfilePassword('')
    setTimeout(() => setProfileStatus('idle'), 3000)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentPassword) {
      setPasswordErrorMsg('Veuillez saisir votre mot de passe actuel.')
      setPasswordStatus('error')
      return
    }
    if (!isPasswordLongEnough) {
      setPasswordErrorMsg('Le nouveau mot de passe est trop court.')
      setPasswordStatus('error')
      return
    }
    if (!doPasswordsMatch) {
      setPasswordErrorMsg('Les mots de passe ne correspondent pas.')
      setPasswordStatus('error')
      return
    }

    setPasswordStatus('loading')
    // Simulation d'appel réseau
    await new Promise(resolve => setTimeout(resolve, 1200))

    setPasswordStatus('success')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setPasswordStatus('idle'), 3000)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Paramètres du compte</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Gérez vos préférences, votre sécurité et vos sessions actives.</p>
      </div>

      <div className="space-y-2">
        
        {/* --- SECTION PROFIL --- */}
        <SettingsSection 
          title="Informations personnelles" 
          description="Utilisez une adresse e-mail professionnelle. Ces informations seront visibles dans l'historique d'audit par les autres administrateurs."
        >
          <form onSubmit={handleUpdateProfile}>
            <div className="p-6 space-y-6">
              {profileStatus === 'error' && (
                <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 text-sm text-red-800 dark:text-red-300">
                  <ShieldAlert size={18} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <p>{profileErrorMsg}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Nom complet</label>
                  <input 
                    id="name"
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Adresse e-mail</label>
                  <input 
                    id="email"
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label htmlFor="profilePassword" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  Mot de passe actuel
                  <span className="text-xs text-slate-500 font-normal">Requis pour authentifier l'action</span>
                </label>
                <input 
                  id="profilePassword"
                  type="password" 
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full sm:max-w-md rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">
                {profileStatus === 'success' && (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
                    <CheckCircle2 size={16} /> Profil mis à jour
                  </span>
                )}
              </p>
              <button 
                type="submit"
                disabled={profileStatus === 'loading'}
                className="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-500 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {profileStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Enregistrer'}
              </button>
            </div>
          </form>
        </SettingsSection>

        {/* --- SECTION SÉCURITÉ --- */}
        <SettingsSection 
          title="Sécurité du compte" 
          description="Mettez à jour votre mot de passe. Nous vous recommandons d'utiliser un mot de passe long et unique, généré par un gestionnaire de mots de passe."
        >
          <form onSubmit={handleUpdatePassword}>
            <div className="p-6 space-y-6">
              {passwordStatus === 'error' && (
                <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 text-sm text-red-800 dark:text-red-300">
                  <ShieldAlert size={18} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <p>{passwordErrorMsg}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="currentPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">Mot de passe actuel</label>
                <div className="relative w-full sm:max-w-md">
                  <input 
                    id="currentPassword"
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                  <label htmlFor="newPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">Nouveau mot de passe</label>
                  <input 
                    id="newPassword"
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirmer le mot de passe</label>
                  <input 
                    id="confirmPassword"
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* UX: Feedback en temps réel sur le mot de passe */}
              {(newPassword.length > 0 || confirmPassword.length > 0) && (
                <div className="flex flex-col gap-2 text-xs">
                  <div className={`flex items-center gap-2 ${isPasswordLongEnough ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                    <ShieldCheck size={14} />
                    <span>Au moins 8 caractères</span>
                  </div>
                  <div className={`flex items-center gap-2 ${doPasswordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                    <ShieldCheck size={14} />
                    <span>Les mots de passe correspondent</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">
                {passwordStatus === 'success' && (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
                    <CheckCircle2 size={16} /> Mot de passe modifié
                  </span>
                )}
              </p>
              <button 
                type="submit"
                disabled={passwordStatus === 'loading' || !isPasswordLongEnough || !doPasswordsMatch}
                className="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 px-5 py-2.5 text-sm font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-slate-100 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {passwordStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Mettre à jour'}
              </button>
            </div>
          </form>
        </SettingsSection>

      </div>
    </div>
  )
}