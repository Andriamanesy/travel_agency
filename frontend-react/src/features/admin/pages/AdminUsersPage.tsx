import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ApiError } from '@/lib/api-client'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { adminRbacService, type AdminManagedUser } from '../services/admin-rbac.service'

const schema = z.object({ 
  name: z.string().trim().min(1, 'Le nom est requis.').max(100), 
  email: z.string().email('Adresse e-mail invalide.'), 
  password: z.string().min(12, '12 caractères minimum.').max(200).optional().or(z.literal('')), 
  role_id: z.number().int().positive('Sélectionnez un rôle.') 
})
type Values = z.infer<typeof schema>
const usersKey = ['admin', 'dynamic-users'] as const

export function AdminUsersPage() {
  const client = useQueryClient()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [editing, setEditing] = useState<AdminManagedUser | null>(null)
  const [confirmation, setConfirmation] = useState<{ user: AdminManagedUser; action: 'delete' | 'status' } | null>(null)

  const parameters = new URLSearchParams()
  if (query) parameters.set('q', query)
  if (role) parameters.set('role_id', role)
  if (status) parameters.set('status', status)
  const suffix = parameters.size ? `?${parameters}` : ''

  const users = useQuery({ queryKey: [...usersKey, suffix], queryFn: () => adminRbacService.users(suffix) })
  const roles = useQuery({ queryKey: ['admin', 'rbac', 'roles'], queryFn: adminRbacService.roles })

  const refresh = () => client.invalidateQueries({ queryKey: usersKey })
  
  const save = useMutation({ 
    mutationFn: ({ id, values }: { id: string | null; values: Values }) => 
      id ? adminRbacService.updateUser(id, values) : adminRbacService.createUser({ ...values, password: values.password || undefined }), 
    onSuccess: () => { refresh(); setEditing(null) } 
  })

  const action = useMutation({ 
    mutationFn: ({ user, kind }: { user: AdminManagedUser; kind: 'delete' | 'status' }) => 
      kind === 'delete' ? adminRbacService.deleteUser(user.id) : adminRbacService.setStatus(user.id, !user.is_active), 
    onSuccess: () => { refresh(); setConfirmation(null) } 
  })

  const error = [users.error, roles.error, save.error, action.error].find((item) => item instanceof ApiError)

  return (
    <section className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 transition-colors">
      <p className="text-sm font-semibold uppercase tracking-[.3em] text-emerald-600 dark:text-emerald-400">Administration & sécurité</p>
      
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Utilisateurs</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Créez, modifiez, activez et gérez les comptes.</p>
        </div>
        <button 
          className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-800 transition cursor-pointer" 
          onClick={() => setEditing({ id: '', name: '', email: '', avatar_url: null, is_verified: true, is_active: true, role_id: 0, created_at: '' })}
        >
          Créer un utilisateur
        </button>
      </div>

      {/* Barre de filtres */}
      <div className="mt-7 flex flex-wrap gap-3 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-200 dark:border-slate-800">
        <input 
          value={query} 
          onChange={(event) => setQuery(event.target.value)} 
          placeholder="Rechercher nom ou e-mail" 
          className="field max-w-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" 
        />
        <select 
          value={role} 
          onChange={(event) => setRole(event.target.value)} 
          className="field w-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
        >
          <option value="">Tous les rôles</option>
          {roles.data?.roles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select 
          value={status} 
          onChange={(event) => setStatus(event.target.value)} 
          className="field w-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="banned">Banni</option>
        </select>
      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 dark:bg-red-950/50 p-4 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/50">
          {error.message}
        </p>
      )}

      {/* Tableau des utilisateurs */}
      <div className="mt-6 overflow-x-auto rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[760px] text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4">Utilisateur</th>
              <th className="p-4">Rôle</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Créé le</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.isPending ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500 dark:text-slate-400">Chargement…</td>
              </tr>
            ) : (
              users.data?.users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950 font-bold text-emerald-800 dark:text-emerald-400">
                        {user.name[0]?.toUpperCase()}
                      </span>
                      <span>
                        <b className="block text-slate-900 dark:text-white">{user.name}</b>
                        <small className="text-slate-500 dark:text-slate-400">{user.email}</small>
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-sm text-slate-700 dark:text-slate-300">
                      {user.role_name || user.role_code || '—'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      user.is_active 
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50' 
                        : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-900/50'
                    }`}>
                      {user.is_active ? 'Actif' : 'Banni'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3 text-sm font-semibold">
                      <button className="text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer" onClick={() => setEditing(user)}>Modifier</button>
                      <button className="text-amber-700 dark:text-amber-400 hover:underline cursor-pointer" onClick={() => setConfirmation({ user, action: 'status' })}>
                        {user.is_active ? 'Bannir' : 'Activer'}
                      </button>
                      <button className="text-red-700 dark:text-red-400 hover:underline cursor-pointer" onClick={() => setConfirmation({ user, action: 'delete' })}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {users.data && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{users.data.pagination.total} utilisateur(s)</p>
      )}

      {editing && (
        <UserModal 
          user={editing} 
          roles={roles.data?.roles ?? []} 
          pending={save.isPending} 
          onClose={() => setEditing(null)} 
          onSave={(values) => save.mutate({ id: editing.id || null, values })} 
        />
      )}

      <ConfirmDialog 
        open={Boolean(confirmation)} 
        title={confirmation?.action === 'delete' ? 'Supprimer ce compte ?' : `${confirmation?.user.is_active ? 'Bannir' : 'Activer'} ce compte ?`} 
        description={confirmation?.action === 'delete' ? 'Cette action supprime définitivement le compte.' : 'Le changement est appliqué immédiatement.'} 
        danger={confirmation?.action === 'delete'} 
        pending={action.isPending} 
        confirmLabel={confirmation?.action === 'delete' ? 'Supprimer' : 'Confirmer'} 
        onCancel={() => setConfirmation(null)} 
        onConfirm={() => confirmation && action.mutate({ user: confirmation.user, kind: confirmation.action })} 
      />
    </section>
  )
}

function UserModal({ user, roles, pending, onClose, onSave }: { user: AdminManagedUser; roles: { id: number; name: string }[]; pending: boolean; onClose: () => void; onSave: (values: Values) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ 
    resolver: zodResolver(schema), 
    defaultValues: { name: user.name, email: user.email, password: '', role_id: user.role_id } 
  })

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-slate-950/60 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit(onSave)} className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-7 shadow-2xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          {user.id ? 'Modifier l’utilisateur' : 'Créer un utilisateur'}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {user.id ? 'Laissez le mot de passe vide pour le conserver.' : 'Le mot de passe doit contenir 12 caractères minimum.'}
        </p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Nom
            <input {...register('name')} className="field mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
          </label>
          {errors.name && <p className="text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}

          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            E-mail
            <input {...register('email')} type="email" className="field mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
          </label>
          {errors.email && <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}

          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Mot de passe
            <input {...register('password')} type="password" autoComplete="new-password" className="field mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
          </label>
          {errors.password && <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>}

          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Rôle
            <select {...register('role_id', { setValueAs: (value) => Number(value) })} className="field mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer">
              <option value="">Sélectionner</option>
              {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
          </label>
          {errors.role_id && <p className="text-sm text-red-600 dark:text-red-400">{errors.role_id.message}</p>}
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
            Annuler
          </button>
          <button disabled={pending} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-800 transition disabled:opacity-50 cursor-pointer">
            {pending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}