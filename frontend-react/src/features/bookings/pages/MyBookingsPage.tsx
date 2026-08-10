import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMyBookings } from '../hooks/useBookings'
import { 
  Calendar, 
  Users, 
  ArrowLeft, 
  Ticket, 
  ExternalLink, 
  AlertCircle, 
  FileText, 
  XCircle,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { 
    label: 'En attente', 
    className: 'bg-amber-50 text-amber-800 border-amber-200/60' 
  },
  confirmed: { 
    label: 'Confirmée', 
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200/60' 
  },
  cancelled: { 
    label: 'Annulée', 
    className: 'bg-rose-50 text-rose-800 border-rose-200/60' 
  }
}

const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

function formatDate(dateString?: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function MyBookingsPage() {
  const { data, isPending, isError } = useMyBookings()
  const bookings = data?.bookings ?? []

  // États pour la modale d'annulation
  const [cancelModalBooking, setCancelModalBooking] = useState<{ id: string; title: string } | null>(null)
  const [cancelledIds, setCancelledIds] = useState<string[]>([])
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  // Impression / Téléchargement du récapitulatif
  const handleDownloadPdf = (booking: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const offerTitle = booking.offer_title || 'Réservation'

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Récapitulatif - ${offerTitle}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; max-width: 600px; margin: 0 auto; }
          .header { border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 24px; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; }
          .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
          .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
          .label { font-weight: 600; color: #475569; }
          .value { font-weight: bold; color: #0f172a; }
          .total { font-size: 20px; font-weight: 900; color: #047857; margin-top: 24px; text-align: right; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Récapitulatif de Réservation</div>
          <div class="subtitle">N° de réservation : ${booking.id}</div>
        </div>
        <div class="row"><span class="label">Offre :</span><span class="value">${offerTitle}</span></div>
        <div class="row"><span class="label">Dates :</span><span class="value">${formatDate(booking.start_date)} au ${formatDate(booking.end_date)}</span></div>
        <div class="row"><span class="label">Participants :</span><span class="value">${booking.participants_count} personne(s)</span></div>
        <div class="row"><span class="label">Statut :</span><span class="value">${statusConfig[booking.status]?.label || booking.status}</span></div>
        <div class="total">Total : ${money.format(booking.total_price)}</div>
        <div class="footer">Merci d'avoir réservé avec nous. Document généré le ${new Date().toLocaleDateString('fr-FR')}.</div>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  // Confirmation de l'annulation
  const handleConfirmCancel = () => {
    if (!cancelModalBooking) return

    setCancelledIds((prev) => [...prev, cancelModalBooking.id])
    setFeedbackMessage(`La réservation "${cancelModalBooking.title}" a été annulée avec succès.`)
    setCancelModalBooking(null)

    setTimeout(() => {
      setFeedbackMessage(null)
    }, 4000)
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      {/* Navigation & En-tête */}
      <Link 
        to="/dashboard" 
        className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition"
      >
        <ArrowLeft size={16} />
        <span>Mon espace</span>
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Mes réservations
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Consultez et suivez l'état de vos réservations de circuits et séjours.
          </p>
        </div>
      </div>

      {/* Message de notification d'annulation */}
      {feedbackMessage && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800 border border-emerald-200/80 shadow-sm">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold">{feedbackMessage}</p>
        </div>
      )}

      {/* État de chargement */}
      {isPending && (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-200/70 animate-pulse" />
          ))}
        </div>
      )}

      {/* État d'erreur */}
      {isError && (
        <div role="alert" className="mt-8 flex items-center gap-3 rounded-2xl bg-rose-50 p-6 text-rose-700 border border-rose-100">
          <AlertCircle size={20} className="shrink-0" />
          <p className="font-medium text-sm">
            Impossible de charger vos réservations. Veuillez réessayer ultérieurement.
          </p>
        </div>
      )}

      {/* Liste des réservations */}
      {!isPending && !isError && (
        <div className="mt-8 space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Ticket size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Aucune réservation pour le moment</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                Vous n'avez pas encore effectué de réservation. Explorez notre catalogue pour trouver votre prochaine aventure !
              </p>
              <Link
                to="/catalog/circuits"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 transition shadow-md shadow-emerald-900/20"
              >
                Explorer le catalogue
              </Link>
            </div>
          ) : (
            bookings.map((booking: any) => {
              const isLocalCancelled = cancelledIds.includes(booking.id)
              const currentStatus = isLocalCancelled ? 'cancelled' : booking.status
              const status = statusConfig[currentStatus] ?? {
                label: currentStatus,
                className: 'bg-slate-100 text-slate-700 border-slate-200'
              }

              const offerTitle = booking.offer_title || 'Offre sans titre'
              const offerId = booking.offer_id || booking.circuit_id || booking.item_id

              return (
                <article 
                  key={booking.id} 
                  className="group rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition">
                        {offerTitle}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          {formatDate(booking.start_date)} → {formatDate(booking.end_date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users size={14} className="text-slate-400" />
                          {booking.participants_count} participant{booking.participants_count > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <span className={`self-start sm:self-center rounded-full border px-3.5 py-1 text-xs font-bold tracking-wide ${status.className}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Actions & Prix */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-1">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Prix total</span>
                      <p className="text-lg font-black text-emerald-700">
                        {money.format(booking.total_price)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Bouton Télécharger PDF */}
                      <button
                        onClick={() => handleDownloadPdf(booking)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        title="Télécharger ou imprimer la fiche"
                      >
                        <FileText size={14} className="text-slate-500" />
                        <span>Récapitulatif PDF</span>
                      </button>

                      {/* Bouton Annuler (si En attente) */}
                      {currentStatus === 'pending' && (
                        <button
                          onClick={() => setCancelModalBooking({ id: booking.id, title: offerTitle })}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                        >
                          <XCircle size={14} />
                          <span>Annuler</span>
                        </button>
                      )}

                      {/* Lien vers l'offre */}
                      {offerId && (
                        <Link
                          to={`/catalog/circuits/${offerId}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                        >
                          <span>Voir l'offre</span>
                          <ExternalLink size={13} />
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>
      )}

      {/* MODALE DE CONFIRMATION D'ANNULATION */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="p-3 rounded-2xl bg-rose-50">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Annuler la réservation ?</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Êtes-vous sûr de vouloir annuler votre demande de réservation pour <strong className="text-slate-900">"{cancelModalBooking.title}"</strong> ?
              Cette action est immédiate.
            </p>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Garder ma réservation
              </button>
              <button
                onClick={handleConfirmCancel}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-md shadow-rose-900/20 transition cursor-pointer"
              >
                Oui, annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}