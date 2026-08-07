import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { userRoles, type ManagedUser } from '../types'
import { useUpdateUserRole } from '../hooks/useUsers'
import { userRoleSchema, type UserRoleValues } from '../schemas/user.schema'

export function UserRoleForm({ user }: { user: ManagedUser }) {
  const updateRole = useUpdateUserRole()
  const { register, handleSubmit, reset } = useForm<UserRoleValues>({
    resolver: zodResolver(userRoleSchema),
    defaultValues: { role: user.roles[0] ?? 'client' },
  })
  useEffect(() => reset({ role: user.roles[0] ?? 'client' }), [reset, user.id, user.roles])

  return <form onSubmit={handleSubmit(({ role }) => updateRole.mutate({ id: user.id, role }))} className="flex gap-2">
    <select {...register('role')} className="rounded-lg border border-slate-300 p-2" aria-label={`Rôle de ${user.email}`}>
      {userRoles.map((role) => <option key={role} value={role}>{role[0].toUpperCase() + role.slice(1)}</option>)}
    </select>
    <button disabled={updateRole.isPending} className="rounded-lg bg-emerald-700 px-3 font-semibold text-white disabled:opacity-70">Enregistrer</button>
  </form>
}
