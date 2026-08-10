import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminRbacService, type Role } from '../services/admin-rbac.service'
import { ApiError } from '@/lib/api-client'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'

const key = ['admin', 'rbac'] as const

export function AdminRolesPage() {
  const client = useQueryClient()
  const [editing, setEditing] = useState<Role | null>(null)
  const [confirm, setConfirm] = useState<Role | null>(null)

  const roles = useQuery({ queryKey: [...key, 'roles'], queryFn: adminRbacService.roles })
  const permissions = useQuery({ queryKey: [...key, 'permissions'], queryFn: adminRbacService.permissions })

  const save = useMutation({ 
    mutationFn: ({ id, values }: { id: number | null; values: { name: string; description?: string; permissions: string[] } }) => 
      adminRbacService.saveRole(id, values), 
    onSuccess: () => { 
      client.invalidateQueries({ queryKey: key })
      setEditing(null) 
    } 
  })

  const remove = useMutation({ 
    mutationFn: adminRbacService.deleteRole, 
    onSuccess: () => { 
      client.invalidateQueries({ queryKey: key })
      setConfirm(null) 
    } 
  })

  const message = [roles.error, permissions.error, save.error, remove.error].find((value) => value instanceof ApiError)

  return (
    <section className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 transition-colors">
      <p className="text-sm font-semibold uppercase tracking-[.3em] text-emerald-600 dark:text-emerald-400">Administration & sécurité</p>
      
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Rôles & permissions</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Définissez les accès depuis une matrice de permissions.</p>
        </div>
        <button 
          className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-800 transition cursor-pointer" 
          onClick={() => setEditing({ id: 0, code: '', name: '', description: '', is_system: false, permissions: [] })}
        >
          Créer un rôle
        </button>
      </div>

      {message && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 dark:bg-red-950/50 p-4 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/50">
          {message.message}
        </p>
      )}

      {/* Liste des rôles */}
      <div className="mt-8 overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
        {roles.isPending ? (
          <p className="p-6 text-slate-500 dark:text-slate-400 text-center">Chargement…</p>
        ) : (
          roles.data?.roles.map((role) => (
            <article key={role.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  {role.name} 
                  {role.is_system && (
                    <span className="ml-2 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      Système
                    </span>
                  )}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {role.description || 'Aucune description'} · {role.permissions.length} permission(s)
                </p>
              </div>
              {!role.is_system && (
                <div className="flex gap-4">
                  <button className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer" onClick={() => setEditing(role)}>Modifier</button>
                  <button className="font-semibold text-red-700 dark:text-red-400 hover:underline cursor-pointer" onClick={() => setConfirm(role)}>Supprimer</button>
                </div>
              )}
            </article>
          ))
        )}
      </div>

      {editing && (
        <RoleModal 
          role={editing} 
          permissionData={permissions.data?.permissions ?? []} 
          pending={save.isPending} 
          onClose={() => setEditing(null)} 
          onSave={(values) => save.mutate({ id: editing.id || null, values })} 
        />
      )}

      <ConfirmDialog 
        open={Boolean(confirm)} 
        title="Supprimer ce rôle ?" 
        description="Cette action est définitive. Un rôle encore attribué ne peut pas être supprimé." 
        danger 
        pending={remove.isPending} 
        confirmLabel="Supprimer" 
        onCancel={() => setConfirm(null)} 
        onConfirm={() => confirm && remove.mutate(confirm.id)} 
      />
    </section>
  )
}

function RoleModal({ role, permissionData, pending, onClose, onSave }: { role: Role; permissionData: { code: string; label: string; category: string }[]; pending: boolean; onClose: () => void; onSave: (values: { name: string; description: string; permissions: string[] }) => void }) {
  const [name, setName] = useState(role.name)
  const [description, setDescription] = useState(role.description || '')
  const [selected, setSelected] = useState(() => new Set(role.permissions.map((item) => item.code)))

  const grouped = permissionData.reduce<Record<string, typeof permissionData>>((all, item) => { 
    (all[item.category] ??= []).push(item)
    return all 
  }, {})

  const toggle = (code: string) => setSelected((current) => { 
    const next = new Set(current)
    if (next.has(code)) next.delete(code)
    else next.add(code)
    return next 
  })

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-slate-950/60 backdrop-blur-sm p-4">
      <form 
        onSubmit={(event) => { 
          event.preventDefault()
          onSave({ name, description, permissions: [...selected] }) 
        }} 
        className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 p-7 shadow-2xl border border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {role.id ? 'Modifier le rôle' : 'Nouveau rôle'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Cochez les permissions à attribuer.</p>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-semibold cursor-pointer" onClick={onClose}>
            Fermer
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Nom
            <input 
              value={name} 
              onChange={(event) => setName(event.target.value)} 
              required 
              maxLength={100} 
              className="mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" 
            />
          </label>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Description
            <input 
              value={description} 
              onChange={(event) => setDescription(event.target.value)} 
              maxLength={5000} 
              className="mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" 
            />
          </label>
        </div>

        <div className="mt-7 space-y-5 max-h-[50vh] overflow-y-auto pr-2">
          {Object.entries(grouped).map(([category, items]) => (
            <fieldset key={category} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4">
              <legend className="px-2 font-bold text-slate-800 dark:text-slate-200 text-sm">{category}</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items?.map((permission) => (
                  <label 
                    key={permission.code} 
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl p-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-750 transition-colors text-slate-700 dark:text-slate-300"
                  >
                    <input 
                      type="checkbox" 
                      checked={selected.has(permission.code)} 
                      onChange={() => toggle(permission.code)} 
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                    />
                    <span className="select-none leading-tight">{permission.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-5">
          <button 
            type="button" 
            onClick={onClose} 
            className="rounded-xl px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Annuler
          </button>
          <button 
            disabled={pending} 
            className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-800 transition disabled:opacity-50 cursor-pointer"
          >
            {pending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}