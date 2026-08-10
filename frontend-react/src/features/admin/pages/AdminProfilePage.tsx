import { useState } from 'react'
import { useSessionStore } from '@/features/auth/store/session.store'
import { User, Lock, Save, CheckCircle2, ShieldAlert } from 'lucide-react'

export function AdminProfilePage() {
  const user = useSessionStore((state) => state.user)
  const updateUser = useSessionStore((state) => state.updateUser)

  // États pour le formulaire de profil
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [profileSuccess, setProfileSuccess] = useState(false)

  // États pour le formulaire de mot de passe
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulation de mise à jour du profil (à connecter à votre API)
    updateUser({ name, email })
    setProfileSuccess(true)
    setTimeout(() => setProfileSuccess(false), 3000)
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas.')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    // Simulation de mise à jour du mot de passe (à connecter à votre API)
    setPasswordSuccess(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setPasswordSuccess(false), 3000)
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* En-tête de page */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Mon profil & sécurité</h1>
        <p className="text-sm text-slate-400">Gérez vos informations personnelles et renforcez la sécurité de votre compte administrateur.</p>
      </div>

      <div className="grid gap-8">
        {/* Section 1 : Informations personnelles */}
        <div className="rounded-2xl border border-slate-800 bg-[#121214] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-200">Informations du compte</h2>
              <p className="text-xs text-slate-400">Mettez à jour vos coordonnées visibles dans l'administration.</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nom complet</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="Votre nom"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Adresse e-mail</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {profileSuccess ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm animate-in fade-in">
                  <CheckCircle2 size={16} />
                  <span>Modifications enregistrées avec succès !</span>
                </div>
              ) : <div />}

              <button 
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20 ml-auto"
              >
                <Save size={16} />
                <span>Enregistrer</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2 : Sécurité et mot de passe */}
        <div className="rounded-2xl border border-slate-800 bg-[#121214] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-200">Sécurité & Mot de passe</h2>
              <p className="text-xs text-slate-400">Assurez-vous d'utiliser un mot de passe sécurisé et unique.</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {passwordError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">
                <ShieldAlert size={18} className="shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mot de passe actuel</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="••••••••••••"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nouveau mot de passe</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="••••••••••••"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Confirmer le nouveau mot de passe</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {passwordSuccess ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm animate-in fade-in">
                  <CheckCircle2 size={16} />
                  <span>Mot de passe modifié avec succès !</span>
                </div>
              ) : <div />}

              <button 
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors ml-auto"
              >
                <Lock size={16} />
                <span>Mettre à jour le mot de passe</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}