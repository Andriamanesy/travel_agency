import { useDestinations } from '@/features/destinations/hooks/useDestinations'

export function DashboardPage() {
  const { data, isPending, isError } = useDestinations()
  const latest = data?.destinations[0]
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-[.3em] text-emerald-600">Dashboard</p><h1 className="mt-2 text-3xl font-black">Vue d’ensemble</h1><p className="mt-2 text-slate-600">Données synchronisées avec l’API TravelMS.</p></div>
    {isError && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">Impossible de charger le tableau de bord.</p>}
    <div className="grid gap-6 md:grid-cols-3"><Metric label="Destinations disponibles" value={isPending ? '…' : String(data?.pagination.total ?? 0)} /><Metric label="Dernière destination" value={isPending ? '…' : latest?.title ?? 'Aucune'} /><Metric label="État" value={isError ? 'Indisponible' : 'API connectée'} success={!isError} /></div>
  </div>
}

function Metric({ label, value, success = false }: { label: string; value: string; success?: boolean }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold text-slate-500">{label}</p><p className={`mt-3 text-xl font-black ${success ? 'text-emerald-600' : 'text-slate-900'}`}>{value}</p></div>
}
