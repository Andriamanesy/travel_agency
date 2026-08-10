import { Download, XCircle } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { Skeleton } from '@/components/feedback/Skeleton'
import { apiClient } from '@/lib/api-client'
import { useBackofficeActions, useBackofficeBookings } from '../hooks/useBackoffice'
import type { AdminBookingDetail } from '../services/backoffice.service'

const labels = { pending: 'En attente', confirmed: 'Confirmée', cancelled: 'Annulée' }
const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

export function AdminBookingsPage() {
  const [status, setStatus] = useState(''); const [q, setQ] = useState(''); const [selected, setSelected] = useState<AdminBookingDetail | null>(null); const [cancel, setCancel] = useState<AdminBookingDetail | null>(null); const [reason, setReason] = useState('')
  const params = new URLSearchParams(); if (status) params.set('status', status); if (q) params.set('q', q); params.set('limit', '100'); const query = `?${params}`
  const bookings = useBackofficeBookings(query); const actions = useBackofficeActions(); const rows = bookings.data?.bookings ?? []
  const active = selected ? rows.find((row) => row.id === selected.id) || selected : null
  const update = (booking: AdminBookingDetail, values: Partial<AdminBookingDetail>) => actions.updateBooking.mutate({ id: booking.id, values }, { onSuccess: () => setSelected(null) })

  return (
    <section className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-600 dark:text-emerald-400">Opérations</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Réservations</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Validez les départs, centralisez les notes et exportez les bons PDF.</p>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl bg-white dark:bg-[#121214] p-5 shadow-sm border border-slate-200/80 dark:border-slate-800/80 md:grid-cols-2 transition-colors">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 space-y-1">
          Statut
          <select className="field" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Tous les statuts</option>
            {Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 space-y-1">
          Rechercher
          <input className="field" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Client, e-mail ou circuit" />
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white dark:bg-[#121214] shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-colors">
        {bookings.isPending ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-200 text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-4 font-bold">Client / Circuit</th>
                  <th className="px-5 py-4 font-bold">Séjour</th>
                  <th className="px-5 py-4 font-bold">Montant</th>
                  <th className="px-5 py-4 font-bold">Statut</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {rows.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-5 py-4">
                      <b className="block text-slate-900 dark:text-white">{booking.customer_name || 'Client'}</b>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{booking.offer_title || booking.customer_email}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-700 dark:text-slate-300">
                      {booking.start_date}<br />{booking.end_date}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{money.format(Number(booking.total_price))}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                        booking.status === 'cancelled' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' : 
                        'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}>
                        {labels[booking.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => setSelected(booking)} className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline">Ouvrir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-6 text-sm text-slate-600 dark:text-slate-300">Aucune réservation ne correspond aux filtres.</p>
        )}
      </div>

      {active && (
        <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto bg-white dark:bg-[#121214] p-6 shadow-2xl border-l border-slate-200 dark:border-slate-800 transition-colors space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-600 dark:text-emerald-400">Réservation</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{active.offer_title || 'Détail du voyage'}</h2>
            </div>
            <button onClick={() => setSelected(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors">
              <XCircle size={22} />
            </button>
          </div>

          <div className="space-y-2 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 p-5 text-xs text-slate-700 dark:text-slate-300">
            <p><b>Client :</b> {active.customer_name} · {active.customer_email}</p>
            <p><b>Séjour :</b> {active.start_date} → {active.end_date}</p>
            <p><b>Participants :</b> {active.participants_count}</p>
            <p><b>Contact :</b> {String(active.contact_phone || 'Non renseigné')}</p>
          </div>

          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 space-y-1">
            Note interne
            <textarea 
              defaultValue={String(active.internal_notes || '')} 
              onBlur={(event) => { if (event.target.value !== (active.internal_notes || '')) update(active, { internal_notes: event.target.value }) }} 
              className="field min-h-24" 
              placeholder="Visible uniquement par l’équipe" 
            />
          </label>

          {active.status !== 'cancelled' && (
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 space-y-1">
              Motif d’annulation
              <textarea 
                value={reason} 
                onChange={(event) => setReason(event.target.value)} 
                className="field min-h-20" 
                placeholder="Obligatoire pour l’équipe" 
              />
            </label>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {active.status === 'pending' && (
              <button onClick={() => update(active, { status: 'confirmed' })} className="rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors">
                Confirmer
              </button>
            )}
            {active.status !== 'cancelled' && (
              <button onClick={() => setCancel(active)} className="rounded-xl bg-red-50 dark:bg-red-950/50 px-4 py-3 text-xs font-bold text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 hover:bg-red-100 transition-colors">
                Annuler
              </button>
            )}
            <button onClick={() => apiClient.download(`/v1/admin/bookings/${active.id}/export`)} className="flex items-center gap-2 rounded-xl bg-slate-950 dark:bg-slate-800 px-4 py-3 text-xs font-bold text-white hover:bg-slate-900 transition-colors">
              <Download size={16} /> PDF
            </button>
          </div>
        </aside>
      )}

      <ConfirmDialog 
        open={Boolean(cancel)} 
        title="Annuler la réservation ?" 
        description="Le motif renseigné sera enregistré dans le dossier client." 
        danger 
        confirmLabel="Annuler la réservation" 
        pending={actions.updateBooking.isPending} 
        onCancel={() => setCancel(null)} 
        onConfirm={() => cancel && update(cancel, { status: 'cancelled', cancellation_reason: reason || 'Annulation administrative' })} 
      />
    </section>
  )
}