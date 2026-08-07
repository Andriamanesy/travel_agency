import { ApiError } from '@/lib/api-client'
import { InviteUserForm } from '@/features/users/components/InviteUserForm'
import { UserRoleForm } from '@/features/users/components/UserRoleForm'
import { useUsers } from '@/features/users/hooks/useUsers'

export function AdminAccessPage() {
  const { data, isPending, error } = useUsers()
  const message = error instanceof ApiError ? error.message : null
  return <section><p className="text-sm font-semibold uppercase tracking-[.3em] text-emerald-600">Administration</p><h1 className="mt-2 text-3xl font-black">Utilisateurs et accès</h1>{message && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{message}</p>}<InviteUserForm /><div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm">{isPending && <p className="p-6">Chargement…</p>}{data?.users.map((user) => <article key={user.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5"><div><h2 className="font-semibold">{user.name || user.email}</h2><p className="text-sm text-slate-500">{user.is_verified ? 'Vérifié' : 'En attente'} · {user.is_active ? 'Actif' : 'Inactif'}</p></div><UserRoleForm user={user} /></article>)}</div></section>
}
