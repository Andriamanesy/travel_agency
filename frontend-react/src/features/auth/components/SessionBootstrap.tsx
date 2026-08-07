import type { ReactNode } from 'react'
import { useSessionBootstrap } from '../hooks/useSessionBootstrap'
import { useSessionStore } from '../store/session.store'

export function SessionBootstrap({ children }: { children: ReactNode }) {
  useSessionBootstrap()
  const status = useSessionStore((state) => state.status)

  if (status === 'restoring') {
    return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-slate-600">Restauration de la session…</main>
  }
  return <>{children}</>
}
