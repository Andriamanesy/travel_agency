import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { adminRbacService, type Role } from '../services/admin-rbac.service'
import { ApiError } from '@/lib/api-client'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'

const KEY = ['admin', 'rbac'] as const

type PermissionItem = { code: string; label: string; category: string }

export function AdminRolesPage() {
  const client = useQueryClient()
  const [editing, setEditing] = useState<Role | null>(null)
  const [confirm, setConfirm] = useState<Role | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const roles = useQuery({ queryKey: [...KEY, 'roles'], queryFn: adminRbacService.roles })
  const permissions = useQuery({ queryKey: [...KEY, 'permissions'], queryFn: adminRbacService.permissions })

  const save = useMutation({
    mutationFn: ({ id, values }: { id: number | null; values: { name: string; description?: string; permissions: string[] } }) =>
      adminRbacService.saveRole(id, values),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: KEY })
      setEditing(null)
    },
  })

  const remove = useMutation({
    mutationFn: adminRbacService.deleteRole,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: KEY })
      setConfirm(null)
    },
  })

  const filteredRoles = useMemo(() => {
    if (!roles.data?.roles) return []
    const query = searchQuery.toLowerCase().trim()
    if (!query) return roles.data.roles
    return roles.data.roles.filter(
      (r) => r.name.toLowerCase().includes(query) || r.description?.toLowerCase().includes(query)
    )
  }, [roles.data?.roles, searchQuery])

  const handleDuplicate = (role: Role) => {
    setEditing({
      id: 0,
      code: '',
      name: `${role.name} (Copie)`,
      description: role.description,
      is_system: false,
      permissions: [...role.permissions],
    })
  }

  const errorMessage = [roles.error, permissions.error, save.error, remove.error].find(
    (value) => value instanceof ApiError
  )?.message

  return (
    <section className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 transition-colors">
      <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-600 dark:text-emerald-400">
        Administration & Sécurité
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Rôles & permissions</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Contrôlez la matrice des privilèges et accès utilisateurs.
          </p>
        </div>
        <button
          className="rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-700/20 transition cursor-pointer"
          onClick={() => setEditing({ id: 0, code: '', name: '', description: '', is_system: false, permissions: [] })}
        >
          + Créer un rôle
        </button>
      </div>

      {errorMessage && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50">
          {errorMessage}
        </p>
      )}

      {/* Barre de filtre des rôles */}
      <div className="mt-6">
        <input
          type="text"
          placeholder="Rechercher un rôle par nom ou description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {/* Liste des rôles */}
      <div className="mt-6 overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
        {roles.isPending ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredRoles.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Aucun rôle ne correspond à votre recherche.
          </p>
        ) : (
          filteredRoles.map((role) => (
            <article
              key={role.id}
              className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-900 dark:text-white text-base">{role.name}</h2>
                  {role.is_system ? (
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      Système
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Personnalisé
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {role.description || 'Aucune description'} · <strong className="text-slate-700 dark:text-slate-300">{role.permissions.length}</strong> permission(s)
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm font-semibold">
                <button
                  type="button"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  onClick={() => handleDuplicate(role)}
                >
                  Dupliquer
                </button>
                <button
                  type="button"
                  className="text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  onClick={() => setEditing(role)}
                >
                  {role.is_system ? 'Consulter' : 'Modifier'}
                </button>
                {!role.is_system && (
                  <button
                    type="button"
                    className="text-red-700 dark:text-red-400 hover:underline cursor-pointer"
                    onClick={() => setConfirm(role)}
                  >
                    Supprimer
                  </button>
                )}
              </div>
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
        title={`Supprimer le rôle "${confirm?.name}" ?`}
        description="Cette action est définitive. Les utilisateurs liés à ce rôle perdron't leurs accès associés."
        danger
        pending={remove.isPending}
        confirmLabel="Supprimer"
        onCancel={() => setConfirm(null)}
        onConfirm={() => confirm && remove.mutate(confirm.id)}
      />
    </section>
  )
}

function RoleModal({
  role,
  permissionData,
  pending,
  onClose,
  onSave,
}: {
  role: Role
  permissionData: PermissionItem[]
  pending: boolean
  onClose: () => void
  onSave: (values: { name: string; description: string; permissions: string[] }) => void
}) {
  const [name, setName] = useState(role.name)
  const [description, setDescription] = useState(role.description || '')
  const [selected, setSelected] = useState(() => new Set(role.permissions.map((item) => item.code)))
  const [permSearch, setPermSearch] = useState('')

  const isReadOnly = role.is_system

  // Filtrage et groupement mémorisés
  const groupedFiltered = useMemo(() => {
    const query = permSearch.toLowerCase().trim()
    const filtered = permissionData.filter(
      (item) => item.label.toLowerCase().includes(query) || item.code.toLowerCase().includes(query)
    )

    return filtered.reduce<Record<string, PermissionItem[]>>((all, item) => {
      ;(all[item.category] ??= []).push(item)
      return all
    }, {})
  }, [permissionData, permSearch])

  const toggleSingle = (code: string) => {
    if (isReadOnly) return
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  const toggleCategory = (categoryItems: PermissionItem[]) => {
    if (isReadOnly) return
    const allCategoryCodes = categoryItems.map((i) => i.code)
    const isAllSelected = allCategoryCodes.every((code) => selected.has(code))

    setSelected((current) => {
      const next = new Set(current)
      allCategoryCodes.forEach((code) => {
        if (isAllSelected) next.delete(code)
        else next.add(code)
      })
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-slate-950/60 backdrop-blur-sm p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!isReadOnly) onSave({ name, description, permissions: Array.from(selected) })
        }}
        className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 p-6 md:p-7 shadow-2xl border border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              {role.id ? (isReadOnly ? 'Consulter le rôle' : 'Modifier le rôle') : 'Nouveau rôle'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {selected.size} permission(s) sélectionnée(s) au total.
            </p>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-semibold cursor-pointer"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Nom
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isReadOnly}
              maxLength={100}
              className="mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Description
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isReadOnly}
              maxLength={5000}
              className="mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
            />
          </label>
        </div>

        {/* Barre de recherche dans les permissions */}
        <div className="mt-5">
          <input
            type="text"
            placeholder="Filtrer les permissions par libellé ou code..."
            value={permSearch}
            onChange={(e) => setPermSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
          />
        </div>

        {/* Grille des permissions */}
        <div className="mt-4 space-y-4 max-h-[45vh] overflow-y-auto pr-2">
          {Object.entries(groupedFiltered).length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400">Aucune permission ne correspond au filtre.</p>
          ) : (
            Object.entries(groupedFiltered).map(([category, items]) => {
              const countSelected = items.filter((i) => selected.has(i.code)).length
              const isAllSelected = items.length > 0 && countSelected === items.length

              return (
                <fieldset
                  key={category}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4"
                >
                  <div className="flex items-center justify-between mb-2 px-1">
                    <legend className="font-bold text-slate-800 dark:text-slate-200 text-sm">{category}</legend>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => toggleCategory(items)}
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        {isAllSelected ? 'Tout décocher' : 'Tout cocher'} ({countSelected}/{items.length})
                      </button>
                    )}
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((permission) => {
                      const isChecked = selected.has(permission.code)
                      return (
                        <label
                          key={permission.code}
                          className={`flex items-center gap-2.5 rounded-xl p-2.5 text-xs border transition-colors cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-medium'
                              : 'bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isReadOnly}
                            onChange={() => toggleSingle(permission.code)}
                            className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                          />
                          <span className="select-none leading-tight">{permission.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              )
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {isReadOnly ? 'Fermer' : 'Annuler'}
          </button>
          {!isReadOnly && (
            <button
              disabled={pending}
              className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-800 transition disabled:opacity-50 cursor-pointer"
            >
              {pending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}