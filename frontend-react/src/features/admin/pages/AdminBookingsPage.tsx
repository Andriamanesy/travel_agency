import { useState } from 'react'
import { 
  Calendar, 
  Users, 
  CreditCard, 
  FileText, 
  Clock, 
  Plane, 
  Bed, 
  MapPin, 
  Lock, 
  Eye, 
  EyeOff, 
  Plus, 
  Send, 
  ShieldAlert, 
  RefreshCw, 
  Ban, 
  Download, 
  DollarSign, 
  UserCheck, 
  Utensils, 
  Phone, 
  Receipt,
  CheckCircle2,
  Tag
} from 'lucide-react'

// ==========================================
// 1. TYPES & ENUMS
// ==========================================

export type BookingStatus = 
  | 'demande'
  | 'en_attente'
  | 'confirmee'
  | 'paiement_partiel'
  | 'payee'
  | 'documents_envoyes'
  | 'en_cours'
  | 'terminee'
  | 'refusee'
  | 'annulee_client'
  | 'annulee_agence'

export interface Traveler {
  id: string
  first_name: string
  last_name: string
  type: 'Adulte' | 'Enfant' | 'Bébé'
  birth_date?: string
  nationality?: string
  passport_number?: string
  passport_expiry?: string
  dietary_requirements?: string
  special_needs?: string
  emergency_contact?: { name: string; phone: string }
}

export interface PaymentTransaction {
  id: string
  date: string
  amount: number
  method: 'CB' | 'Virement' | 'Chèque' | 'Espèces'
  status: 'payé' | 'en_attente' | 'échoué' | 'remboursé'
  reference: string
  note?: string
}

export interface ItineraryStep {
  id: string
  day: number
  title: string
  location: string
  type: 'vol' | 'transport' | 'hotel' | 'activite' | 'repas'
  provider_status: 'confirmé' | 'en_attente' | 'indisponible'
  details: string
}

export interface InternalNote {
  id: string
  author: string
  created_at: string
  content: string
  is_urgent?: boolean
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  author: string
  role: string
  action: string
  field_changed?: string
  old_value?: string
  new_value?: string
}

// ==========================================
// 2. COMPOSANT PRINCIPAL
// ==========================================

export function AdminBookingsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'travelers' | 'itinerary' | 'finances' | 'documents' | 'audit'>('overview')
  const [showSensitiveData, setShowSensitiveData] = useState(false)
  
  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)

  // Exemple de données de réservation
  const [booking] = useState({
    id: 'RES-2026-00125',
    status: 'confirmee' as BookingStatus,
    created_at: '2026-08-01 10:14',
    client: {
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      phone: '+33 6 12 34 56 78',
      address: '12 Rue de la Paix, 75002 Paris, France'
    },
    circuit: {
      id: 'CIR-MDG-001',
      title: 'Grand Tour Découverte de Madagascar',
      duration_days: 12,
      start_date: '2026-09-15',
      end_date: '2026-09-27'
    },
    financials: {
      base_price: 3500,
      options_price: 400,
      discounts: 150,
      total_amount: 3750,
      paid_amount: 1500,
      deposit_required: 1500,
      balance_due_date: '2026-08-15'
    },
    travelers: [
      {
        id: '1',
        first_name: 'Jean',
        last_name: 'Dupont',
        type: 'Adulte',
        birth_date: '1985-04-12',
        nationality: 'Française',
        passport_number: '14AA98765',
        passport_expiry: '2029-11-20',
        dietary_requirements: 'Sans gluten',
        emergency_contact: { name: 'Paul Dupont (Frère)', phone: '+33 6 99 88 77 66' }
      },
      {
        id: '2',
        first_name: 'Marie',
        last_name: 'Dupont',
        type: 'Adulte',
        birth_date: '1988-09-25',
        nationality: 'Française',
        passport_number: '16BB12345',
        passport_expiry: '2028-03-15'
      },
      {
        id: '3',
        first_name: 'Lucas',
        last_name: 'Dupont',
        type: 'Enfant',
        birth_date: '2016-01-10',
        nationality: 'Française'
      }
    ] as Traveler[],
    payments: [
      {
        id: 'PAY-1001',
        date: '2026-08-01 10:20',
        amount: 1500,
        method: 'CB',
        status: 'payé',
        reference: 'STRIPE_CH_3M8912',
        note: 'Paiement de l\'acompte en ligne'
      }
    ] as PaymentTransaction[],
    itinerary: [
      { id: '1', day: 1, title: 'Arrivée & Accueil', location: 'Antananarivo', type: 'vol', provider_status: 'confirmé', details: 'Aéroport → Le Palissandre Hotel' },
      { id: '2', day: 2, title: 'Route vers les Hautes Terres', location: 'Antsirabe', type: 'transport', provider_status: 'confirmé', details: 'Véhicule 4x4 privé avec chauffeur' },
      { id: '3', day: 3, title: 'Etape Thermale & Artisanat', location: 'Antsirabe', type: 'hotel', provider_status: 'confirmé', details: 'Hôtel Couleur Café (Suite Familiale)' },
      { id: '4', day: 4, title: 'Randonnée Parc National', location: 'Ranomafana', type: 'activite', provider_status: 'en_attente', details: 'Guide francophone local à confirmer' }
    ] as ItineraryStep[],
    internal_notes: [
      { id: 'n1', author: 'Claire (Agent)', created_at: '2026-08-02 11:30', content: 'Le client souhaite un siège enfant pour Lucas dans le 4x4.' },
      { id: 'n2', author: 'Marc (Admin)', created_at: '2026-08-05 09:15', content: 'Acompte bien reçu. Relancer le fournisseur hôtel J4.', is_urgent: true }
    ] as InternalNote[],
    audit_logs: [
      { id: 'l1', timestamp: '2026-08-01 10:14', author: 'Système', role: 'System', action: 'Création de la demande de réservation' },
      { id: 'l2', timestamp: '2026-08-01 10:20', author: 'Jean Dupont', role: 'Client', action: 'Paiement acompte de 1 500 € (CB)' },
      { id: 'l3', timestamp: '2026-08-02 11:30', author: 'Claire Martin', role: 'Agent de voyage', action: 'Passage du statut à "Confirmée"' }
    ] as AuditLogEntry[]
  })

  // Calculs financiers
  const balanceRemaining = booking.financials.total_amount - booking.financials.paid_amount
  const isPaidInFull = balanceRemaining <= 0

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* ==========================================
          HEADER PRINCIPAL : STATUS & ACTIONS
      ========================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-mono font-bold text-slate-400"># {booking.id}</span>
            <StatusBadge status={booking.status} />
            <span className="text-xs text-slate-400">Créée le {booking.created_at}</span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            {booking.circuit.title}
          </h1>
        </div>

        {/* Boutons d'action métier */}
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => setIsRescheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Reprogrammer</span>
          </button>

          <button 
            onClick={() => setIsPaymentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <DollarSign size={14} />
            <span>Enregistrer Paiement</span>
          </button>

          <button 
            onClick={() => setIsCancelModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900 dark:text-rose-300 transition cursor-pointer"
          >
            <Ban size={14} />
            <span>Annuler</span>
          </button>
        </div>
      </div>

      {/* ==========================================
          BANDEAU D'ALERTES COMPORTEMENTALES
      ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {!isPaidInFull && (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-medium">
            <Clock size={18} className="shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-bold">Solde restant : {balanceRemaining} €</p>
              <p className="text-[11px] opacity-80">Échéance de paiement : {booking.financials.balance_due_date}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-medium">
          <ShieldAlert size={18} className="shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="font-bold">Passeport(s) manquant(s)</p>
            <p className="text-[11px] opacity-80">Lucas Dupont (Enfant) n'a pas de passeport renseigné</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="font-bold">Acompte sécurisé</p>
            <p className="text-[11px] opacity-80">Paiement de {booking.financials.paid_amount} € validé</p>
          </div>
        </div>
      </div>

      {/* ==========================================
          NAVIGATION PAR ONGLETS (TAB BAR)
      ========================================== */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        <TabButton id="overview" label="Aperçu Général" icon={<FileText size={15} />} active={activeTab} onClick={setActiveTab} />
        <TabButton id="travelers" label={`Voyageurs (${booking.travelers.length})`} icon={<Users size={15} />} active={activeTab} onClick={setActiveTab} />
        <TabButton id="itinerary" label="Itinéraire & Prestations" icon={<MapPin size={15} />} active={activeTab} onClick={setActiveTab} />
        <TabButton id="finances" label="Finances & Paiements" icon={<CreditCard size={15} />} active={activeTab} onClick={setActiveTab} />
        <TabButton id="documents" label="Documents & E-mails" icon={<Send size={15} />} active={activeTab} onClick={setActiveTab} />
        <TabButton id="audit" label="Notes & Historique Log" icon={<Clock size={15} />} active={activeTab} onClick={setActiveTab} />
      </div>

      {/* ==========================================
          CONTENU DE L'ONGLET 1 : APERÇU GÉNÉRAL
      ========================================== */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <UserCheck size={16} className="text-emerald-600" />
                Client Principal
              </h2>
              <button className="text-xs font-bold text-emerald-600 hover:underline">Éditer</button>
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 dark:text-white">{booking.client.name}</p>
              <p className="text-xs text-slate-500">{booking.client.address}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Send size={14} className="text-slate-400" /> {booking.client.email}
              </p>
              <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Phone size={14} className="text-slate-400" /> {booking.client.phone}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={16} className="text-emerald-600" />
              Dates & Participant(s)
            </h2>
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Du {booking.circuit.start_date} au {booking.circuit.end_date}
              </p>
              <p className="text-xs text-slate-500">
                Durée : {booking.circuit.duration_days} jours / {booking.circuit.duration_days - 1} nuits
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">Composition :</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {booking.travelers.length} voyageurs (2 Adultes, 1 Enfant)
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Receipt size={16} className="text-emerald-600" />
              Règlement
            </h2>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Prix total :</span>
                <span className="font-bold text-slate-900 dark:text-white">{booking.financials.total_amount} €</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                <span>Déjà payé :</span>
                <span className="font-bold">{booking.financials.paid_amount} €</span>
              </div>
              <div className="flex justify-between text-xs text-rose-600 dark:text-rose-400 font-bold pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Reste à payer :</span>
                <span>{balanceRemaining} €</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all" 
                style={{ width: `${(booking.financials.paid_amount / booking.financials.total_amount) * 100}%` }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          CONTENU DE L'ONGLET 2 : VOYAGEURS
      ========================================== */}
      {activeTab === 'travelers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Liste des passagers déclarés</h2>
              <p className="text-xs text-slate-400">⚠️ Les informations de passeports sont chiffrées et confidentielles (RBAC).</p>
            </div>
            <button 
              onClick={() => setShowSensitiveData(!showSensitiveData)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              {showSensitiveData ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showSensitiveData ? 'Masquer pièces' : 'Révéler pièces'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {booking.travelers.map((t, idx) => (
              <div key={t.id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.first_name} {t.last_name}</h3>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {t.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nationalité</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{t.nationality || 'Non renseignée'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date de naissance</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{t.birth_date || 'Non renseignée'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">N° Passeport</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {showSensitiveData ? (t.passport_number || 'Manquant') : '•••••••••'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Expiration</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{t.passport_expiry || 'N/A'}</span>
                  </div>
                </div>

                {t.dietary_requirements && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                    <Utensils size={13} />
                    <span>Régime : {t.dietary_requirements}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          CONTENU DE L'ONGLET 3 : ITINÉRAIRE & PRESTATIONS
      ========================================== */}
      {activeTab === 'itinerary' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Statuts des réservations prestataires</h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {booking.itinerary.map((step) => (
              <div key={step.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-10">J{step.day}</span>
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {step.type === 'vol' && <Plane size={16} />}
                    {step.type === 'hotel' && <Bed size={16} />}
                    {step.type === 'transport' && <MapPin size={16} />}
                    {step.type === 'activite' && <Tag size={16} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{step.title} — {step.location}</p>
                    <p className="text-[11px] text-slate-500">{step.details}</p>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                  step.provider_status === 'confirmé'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900'
                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900'
                }`}>
                  {step.provider_status === 'confirmé' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                  {step.provider_status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          CONTENU DE L'ONGLET 4 : FINANCES & PAIEMENTS
      ========================================== */}
      {activeTab === 'finances' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Décomposition de la cotation</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Tarif de base du circuit :</span>
                <span className="font-bold text-slate-900 dark:text-white">{booking.financials.base_price} €</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Options & Suppléments :</span>
                <span className="font-bold text-slate-900 dark:text-white">+{booking.financials.options_price} €</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-rose-600">
                <span>Remise commerciale accordée :</span>
                <span className="font-bold">-{booking.financials.discounts} €</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-black text-slate-900 dark:text-white">
                <span>Total Facturé :</span>
                <span>{booking.financials.total_amount} €</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Paiements Encaissés</h2>
              <button 
                onClick={() => setIsPaymentModalOpen(true)}
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> Nouveau
              </button>
            </div>

            <div className="space-y-2">
              {booking.payments.map((p) => (
                <div key={p.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{p.amount} €</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {p.method}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{p.date} · Ref: {p.reference}</p>
                  </div>
                  <button className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer" title="Télécharger le reçu">
                    <Download size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          CONTENU DE L'ONGLET 5 : DOCUMENTS & E-MAILS
      ========================================== */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Documents officiels à générer</h2>
            <div className="space-y-2">
              <DocumentRow title="Confirmation de Réservation" status="Généré" date="01/08/2026" />
              <DocumentRow title="Facture d'Acompte (1 500 €)" status="Généré" date="01/08/2026" />
              <DocumentRow title="Carnet de Voyage (Vouchers)" status="En attente" />
              <DocumentRow title="Attestation d'assurance" status="Non requis" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Historique des e-mails envoyés</h2>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <p className="font-bold text-slate-900 dark:text-white">Confirmation & Accusé de réception</p>
                <p className="text-[11px] text-slate-400">Envoyé le 01/08/2026 à 10:21 · Statut: Ouvert</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          CONTENU DE L'ONGLET 6 : AUDIT & NOTES INTERNES
      ========================================== */}
      {activeTab === 'audit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-amber-500/5 rounded-3xl p-6 border border-amber-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <Lock size={15} /> Notes Internes Confidentielles
              </h2>
              <button 
                onClick={() => setIsNoteModalOpen(true)}
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
              >
                + Ajouter une note
              </button>
            </div>

            <div className="space-y-3">
              {booking.internal_notes.map((note) => (
                <div key={note.id} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-bold text-amber-800 dark:text-amber-400">{note.author}</span>
                    <span>{note.created_at}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{note.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Journal d'Audit & Traçabilité</h2>
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-2.5 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
              {booking.audit_logs.map((log) => (
                <div key={log.id} className="relative pl-7 text-xs space-y-0.5">
                  <div className="absolute left-1 top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                  <p className="font-bold text-slate-900 dark:text-white">{log.action}</p>
                  <p className="text-[11px] text-slate-400">{log.timestamp} · Par <strong className="text-slate-600 dark:text-slate-300">{log.author}</strong> ({log.role})</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODALS / DRAWERS DE GESTION MÉTIER
      ========================================== */}

      {/* Modal Reprogrammer */}
      {isRescheduleModalOpen && (
        <Modal title="Reprogrammer / Reporter le voyage" onClose={() => setIsRescheduleModalOpen(false)}>
          <form className="space-y-4 text-xs">
            <div>
              <label className="block font-bold mb-1">Nouvelle date de départ</label>
              <input type="date" defaultValue={booking.circuit.start_date} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none" />
            </div>
            <div>
              <label className="block font-bold mb-1">Impact sur le prix (€)</label>
              <input type="number" placeholder="Ex: +150" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none" />
            </div>
            <div>
              <label className="block font-bold mb-1">Raison du report</label>
              <textarea rows={3} placeholder="Ex: Demande client pour motifs médicaux..." className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none resize-none" />
            </div>
            <button type="button" onClick={() => setIsRescheduleModalOpen(false)} className="w-full py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold rounded-xl transition cursor-pointer">
              Confirmer la reprogrammation
            </button>
          </form>
        </Modal>
      )}

      {/* Modal Paiement */}
      {isPaymentModalOpen && (
        <Modal title="Enregistrer un Paiement" onClose={() => setIsPaymentModalOpen(false)}>
          <form className="space-y-4 text-xs">
            <div>
              <label className="block font-bold mb-1">Montant (€)</label>
              <input type="number" defaultValue={balanceRemaining} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none" />
            </div>
            <div>
              <label className="block font-bold mb-1">Moyen de paiement</label>
              <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none">
                <option value="CB">Carte Bancaire</option>
                <option value="Virement">Virement Bancaire</option>
                <option value="Espèces">Espèces</option>
                <option value="Chèque">Chèque</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Référence / N° transaction</label>
              <input type="text" placeholder="Ex: VIR-89210-BNP" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none" />
            </div>
            <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition cursor-pointer">
              Valider l'encaissement
            </button>
          </form>
        </Modal>
      )}

      {/* Modal Annulation */}
      {isCancelModalOpen && (
        <Modal title="Annuler la réservation" onClose={() => setIsCancelModalOpen(false)}>
          <form className="space-y-4 text-xs">
            <div>
              <label className="block font-bold mb-1 text-rose-600">Motif d'annulation</label>
              <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none">
                <option>Demande du client</option>
                <option>Impayé / Solde non réglé</option>
                <option>Force majeure / Météo</option>
                <option>Indisponibilité fournisseur</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Remboursement</label>
              <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none">
                <option>Aucun remboursement</option>
                <option>Remboursement partiel</option>
                <option>Remboursement intégral</option>
              </select>
            </div>
            <button type="button" onClick={() => setIsCancelModalOpen(false)} className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition cursor-pointer">
              Confirmer l'annulation
            </button>
          </form>
        </Modal>
      )}

      {/* Modal Note Internes */}
      {isNoteModalOpen && (
        <Modal title="Ajouter une note interne" onClose={() => setIsNoteModalOpen(false)}>
          <form className="space-y-4 text-xs">
            <div>
              <label className="block font-bold mb-1">Note (non visible par le client)</label>
              <textarea rows={4} placeholder="Notez une consigne de guidage, une particularité..." className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none resize-none" />
            </div>
            <button type="button" onClick={() => setIsNoteModalOpen(false)} className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition cursor-pointer">
              Enregistrer la note
            </button>
          </form>
        </Modal>
      )}

    </div>
  )
}

// Default export pour parer aux deux modes d'importation dans React Router
export default AdminBookingsPage

// ==========================================
// COMPOSANTS AUXILIAIRES DE L'UI
// ==========================================

function TabButton({ id, label, icon, active, onClick }: { id: string; label: string; icon: React.ReactNode; active: string; onClick: (id: any) => void }) {
  const isActive = active === id
  return (
    <button
      onClick={() => onClick(id)}
      className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition shrink-0 cursor-pointer ${
        isActive
          ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
          : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const map = {
    demande: { label: 'Demande', class: 'bg-slate-100 text-slate-700 border-slate-200' },
    en_attente: { label: 'En attente', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    confirmee: { label: 'Confirmée', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    paiement_partiel: { label: 'Paiement partiel', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    payee: { label: 'Payée', class: 'bg-emerald-600 text-white border-emerald-600' },
    documents_envoyes: { label: 'Docs envoyés', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    en_cours: { label: 'Voyage en cours', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    terminee: { label: 'Terminée', class: 'bg-slate-900 text-white border-slate-900' },
    refusee: { label: 'Refusée', class: 'bg-rose-50 text-rose-700 border-rose-200' },
    annulee_client: { label: 'Annulée (Client)', class: 'bg-rose-100 text-rose-800 border-rose-300' },
    annulee_agence: { label: 'Annulée (Agence)', class: 'bg-rose-100 text-rose-800 border-rose-300' }
  }

  const conf = map[status] || map.demande

  return (
    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${conf.class}`}>
      {conf.label}
    </span>
  )
}

function DocumentRow({ title, status, date }: { title: string; status: string; date?: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
      <div>
        <p className="font-bold text-slate-900 dark:text-white">{title}</p>
        <p className="text-[10px] text-slate-400">{date ? `Généré le ${date}` : 'Non disponible'}</p>
      </div>
      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
        {status}
      </span>
    </div>
  )
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-black text-sm text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}