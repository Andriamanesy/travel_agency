import { 
  Download, 
  X, 
  Search, 
  Filter, 
  CalendarDays, 
  Users, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Clock, 
  XCircle,
  FileText
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { Skeleton } from '@/components/feedback/Skeleton'
import { apiClient } from '@/lib/api-client'
import { useBackofficeActions, useBackofficeBookings } from '../hooks/useBackoffice'
import type { AdminBookingDetail } from '../services/backoffice.service'

const STATUS_CONFIG = {
  pending: { label: 'En attente', icon: Clock, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  confirmed: { label: 'Confirmée', icon: CheckCircle2, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  cancelled: { label: 'Annulée', icon: XCircle, color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' }
}

const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

export function AdminBookingsPage() {
  // 1. Nettoyage de la déclaration des états pour une meilleure lisibilité
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<AdminBookingDetail | null>(null)
  const [cancel, setCancel] = useState<AdminBookingDetail | null>(null)
  const [reason, setReason] = useState('')

  // Reset du motif d'annulation quand on change de réservation (UX)
  useEffect(() => {
    setReason('')
  }, [selected])

  // 2. Construction propre de la query
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (q) params.set('q', q)
  params.set('limit', '100')
  const query = `?${params.toString()}`

  const bookings = useBackofficeBookings(query)
  const actions = useBackofficeActions()
  const rows = bookings.data?.bookings ?? []
  
  const active = selected ? rows.find((row) => row.id === selected.id) || selected : null

  const update = (booking: AdminBookingDetail, values: Partial<AdminBookingDetail>) => {
    actions.updateBooking.mutate(
      { id: booking.id, values }, 
      { onSuccess: () => setSelected(null) }
    )
  }

  // Helper pour générer des initiales (UI)
const getInitials = (name?: string) => name ? name.substring(0, 2).toUpperCase() : '?'
  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Opérations
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Réservations
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gérez les dossiers clients, validez les départs et centralisez vos notes.
          </p>
        </div>
      </header>

      {/* FILTRES & RECHERCHE */}
      <div className="flex flex-col sm:flex-row gap-4 rounded-2xl bg-white dark:bg-slate-900 p-2 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-500 outline-none focus:ring-0" 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            placeholder="Rechercher par client, e-mail ou circuit..." 
          />
        </div>
        <div className="hidden sm:block w-px bg-slate-200 dark:bg-slate-800 my-2" />
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            className="w-full h-full bg-transparent pl-11 pr-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer appearance-none" 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        {bookings.isPending ? (
          <div className="p-4 space-y-4">
             {/* UX : Squelette qui ressemble à un vrai tableau */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            ))}
          </div>
        ) : rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Client & Voyage</th>
                  <th className="px-6 py-4">Dates du séjour</th>
                  <th className="px-6 py-4">Montant</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((booking) => {
                  const statusData = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
                  const StatusIcon = statusData.icon

                  return (
                    <tr key={booking.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* UI : Avatar générique pour identifier les clients plus vite */}
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                            {getInitials(booking.customer_name)}
                          </div>
                          <div>
                            <b className="block text-slate-900 dark:text-white font-semibold">
                              {booking.customer_name || 'Client Inconnu'}
                            </b>
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] block">
                              {booking.offer_title || booking.customer_email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs text-slate-600 dark:text-slate-300 gap-1">
                          <span className="flex items-center gap-1.5"><CalendarDays size={13}/> {booking.start_date}</span>
                          <span className="flex items-center gap-1.5 text-slate-400">au {booking.end_date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {money.format(Number(booking.total_price))}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusData.bg} ${statusData.color}`}>
                          <StatusIcon size={14} />
                          {statusData.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelected(booking)} 
                          className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/50 transition-colors"
                        >
                          Gérer
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
              <FileText size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Aucune réservation trouvée</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">Essayez de modifier vos filtres ou de chercher un autre nom de client.</p>
          </div>
        )}
      </div>

      {/* SIDE PANEL (DRAWER) */}
      {active && (
        <>
          {/* UX : Backdrop pour fermer le panel en cliquant à côté et concentrer l'attention */}
          <div 
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm dark:bg-black/40 transition-opacity" 
            onClick={() => setSelected(null)} 
            aria-hidden="true"
          />
          
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-950 shadow-2xl border-l border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out flex flex-col">
            
            {/* Header du Panel */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/60">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Détail du dossier</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white line-clamp-1">{active.offer_title || 'Voyage sur mesure'}</h2>
              </div>
              <button 
                onClick={() => setSelected(null)} 
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenu Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Carte d'information client */}
              <div className="space-y-4 rounded-2xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200/50 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Informations Client</h3>
                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  <p className="flex items-center gap-3"><Users size={16} className="text-slate-400"/> <b>{active.customer_name}</b> ({active.participants_count} pax)</p>
                  <p className="flex items-center gap-3"><Mail size={16} className="text-slate-400"/> {active.customer_email}</p>
                  <p className="flex items-center gap-3"><Phone size={16} className="text-slate-400"/> {String(active.contact_phone || 'Non renseigné')}</p>
                  <div className="h-px w-full bg-slate-200 dark:bg-slate-800 my-2" />
                  <p className="flex items-center gap-3"><CalendarDays size={16} className="text-slate-400"/> Du {active.start_date} au {active.end_date}</p>
                </div>
              </div>

              {/* Note interne */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Note interne (Équipe)
                </label>
                <textarea 
                  defaultValue={String(active.internal_notes || '')} 
                  onBlur={(event) => { 
                    if (event.target.value !== (active.internal_notes || '')) {
                      update(active, { internal_notes: event.target.value }) 
                    }
                  }} 
                  className="w-full min-h-[120px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-y" 
                  placeholder="Ajoutez une information utile pour l'équipe (ex: Allergies, demande spéciale...)" 
                />
              </div>

              {/* UX : Motif d'annulation mieux séparé visuellement */}
              {active.status !== 'cancelled' && (
                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                  <label className="text-xs font-bold uppercase tracking-wider text-red-500 dark:text-red-400">
                    Zone de danger
                  </label>
                  <textarea 
                    value={reason} 
                    onChange={(event) => setReason(event.target.value)} 
                    className="w-full min-h-[80px] rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-red-300 dark:placeholder-red-800 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none" 
                    placeholder="Motif d'annulation (requis si vous annulez)" 
                  />
                </div>
              )}
            </div>

            {/* Footer fixe avec actions */}
            <div className="border-t border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex flex-col gap-3">
                {active.status === 'pending' && (
                  <button 
                    onClick={() => update(active, { status: 'confirmed' })} 
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                  >
                    <CheckCircle2 size={18} /> Confirmer la réservation
                  </button>
                )}
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => apiClient.download(`/v1/admin/bookings/${active.id}/export`)} 
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Download size={18} /> Télécharger PDF
                  </button>
                  
                  {active.status !== 'cancelled' && (
                    <button 
                      onClick={() => setCancel(active)} 
                      disabled={!reason.trim()}
                      title={!reason.trim() ? "Veuillez renseigner un motif d'annulation" : ""}
                      className="flex items-center justify-center rounded-xl bg-white dark:bg-transparent px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      <ConfirmDialog 
        open={Boolean(cancel)} 
        title="Confirmer l'annulation ?" 
        description={`Le motif suivant sera enregistré : "${reason}". Cette action informera potentiellement le client selon vos paramètres.`} 
        danger 
        confirmLabel="Oui, annuler la réservation" 
        pending={actions.updateBooking.isPending} 
        onCancel={() => setCancel(null)} 
        onConfirm={() => cancel && update(cancel, { status: 'cancelled', cancellation_reason: reason })} 
      />
    </section>
  )
}