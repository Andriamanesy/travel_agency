import { useSessionStore } from '@/features/auth/store/session.store'

export function AdminProfilePage() {
  const user = useSessionStore((state) => state.user)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mon profil & sécurité</h1>
        <p className="text-sm text-slate-500">Gérez vos informations personnelles et vos paramètres de sécurité.</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#121214] p-6 space-y-4 max-w-xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-slate-400">Nom complet</label>
          <p className="text-base font-medium text-slate-200">{user?.name || 'Administrateur'}</p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-slate-400">Adresse e-mail</label>
          <p className="text-base font-medium text-slate-200">{user?.email || 'Non renseigné'}</p>
        </div>

        {/* Vous pourrez intégrer ici votre composant de changement de mot de passe */}
      </div>
    </div>
  )
}