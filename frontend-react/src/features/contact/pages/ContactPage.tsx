import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { Mail, MapPin, Phone, Send, CheckCircle2, Globe, AlertCircle, Check } from 'lucide-react'

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // États pour chaque champ du formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  // Gestion des changements de valeur avec filtrage en direct pour le téléphone
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === 'phone') {
      // Bloque et filtre les caractères non désirés en temps réel
      const sanitizedPhone = value.replace(/[^+\d\s\-().]/g, '')
      setFormData((prev) => ({ ...prev, [name]: sanitizedPhone }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    if (errorMsg) setErrorMsg('')
  }

  // --- FONCTIONS DE VALIDATION EN DIRECT POUR CHAQUE CHAMP ---

  // 1. Nom : Valide si au moins 2 caractères
  const getNameStatus = () => {
    const val = formData.name.trim()
    if (val.length === 0) return null
    if (val.length < 2) return { valid: false, text: "Nom trop court (minimum 2 caractères)." }
    return { valid: true, text: "Nom valide." }
  }

  // 2. Email : Valide avec la regex standard
  const getEmailStatus = () => {
    const val = formData.email.trim()
    if (val.length === 0) return null
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(val)) return { valid: false, text: "Format d'email invalide (ex: exemple@domaine.com)." }
    return { valid: true, text: "Adresse email valide." }
  }

  // 3. Téléphone : Optionnel, mais si rempli, vérifie la longueur/format
  const getPhoneStatus = () => {
    const val = formData.phone.trim()
    if (val.length === 0) return null // Optionnel
    const phoneRegex = /^[+]?[\d\s\-().]{8,20}$/
    if (!phoneRegex.test(val)) return { valid: false, text: "Numéro de téléphone invalide (8 à 20 caractères requis)." }
    return { valid: true, text: "Numéro de téléphone valide." }
  }

  // 4. Sujet : Doit être sélectionné
  const getSubjectStatus = () => {
    if (!formData.subject) return null
    return { valid: true, text: "Sujet sélectionné." }
  }

  // 5. Message : Minimum 10 caractères
  const getMessageStatus = () => {
    const val = formData.message.trim()
    if (val.length === 0) return null
    if (val.length < 10) return { valid: false, text: `Encore ${10 - val.length} caractère(s) minimum...` }
    return { valid: true, text: "Message valide." }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const cleanedData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      subject: formData.subject,
      message: formData.message.trim()
    }

    // Vérification finale globale avant envoi
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (cleanedData.name.length < 2 || !emailRegex.test(cleanedData.email) || cleanedData.message.length < 10 || !cleanedData.subject) {
      setErrorMsg("Veuillez corriger les erreurs signalées dans le formulaire avant d'envoyer.")
      setLoading(false)
      return
    }

    if (cleanedData.phone) {
      const phoneRegex = /^[+]?[\d\s\-().]{8,20}$/
      if (!phoneRegex.test(cleanedData.phone)) {
        setErrorMsg("Veuillez saisir un numéro de téléphone valide.")
        setLoading(false)
        return
      }
    }

    // Simulation d'envoi sécurisé du message au backend
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1000)
  }

  const nameStatus = getNameStatus()
  const emailStatus = getEmailStatus()
  const phoneStatus = getPhoneStatus()
  const subjectStatus = getSubjectStatus()
  const messageStatus = getMessageStatus()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-1">
        {/* En-tête de page */}
        <section className="bg-slate-900 py-16 text-white md:py-24">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
              Service Client & Sur-mesure
            </span>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Contactez nos experts du voyage</h1>
            <p className="mx-auto mt-4 max-w-2xl text-slate-300 text-base sm:text-lg">
              Une question sur un circuit, besoin d’un devis personnalisé ou d’assistance pour votre prochaine réservation ? Notre équipe vous répond sous 24h.
            </p>
          </div>
        </section>

        {/* Contenu principal : Formulaire & Coordonnées */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            
            {/* Colonne de gauche : Informations de contact */}
            <div className="space-y-6 lg:col-span-1">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">Nos coordonnées</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Préférez un contact direct ? Retrouvez-nous via les canaux ci-dessous.
                </p>

                <div className="mt-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <Phone size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Téléphone</p>
                      <p className="mt-1 font-bold text-slate-800">+261 20 22 000 00</p>
                      <p className="text-xs text-slate-500">Lun - Sam : 9h00 - 19h00</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <Mail size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Email</p>
                      <p className="mt-1 font-bold text-slate-800">contact@travelms.mg</p>
                      <p className="text-xs text-slate-500">Réponse garantie sous 24h</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Agence principale</p>
                      <p className="mt-1 font-bold text-slate-800">Antaninarenina</p>
                      <p className="text-xs text-slate-500">Antananarivo, Madagascar</p>
                    </div>
                  </div>
                </div>

                {/* Badge de réassurance */}
                <div className="mt-8 rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-center gap-3">
                  <Globe className="text-emerald-600 shrink-0" size={24} />
                  <div className="text-xs text-slate-600">
                    <strong className="text-slate-900 block font-semibold">Agence agréée & sécurisée</strong>
                    Paiements cryptés et protection des données garantis.
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne de droite : Formulaire de contact */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-2 sm:p-10">
              {submitted ? (
                <div className="py-16 text-center">
                  <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Message envoyé avec succès !</h3>
                  <p className="mt-2 text-slate-600 max-w-md mx-auto">
                    Merci pour votre message. Un conseiller expert de TravelMS va l'analyser et reviendra vers vous très rapidement.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false)
                      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
                    }}
                    className="mt-8 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 cursor-pointer"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Envoyez-nous un message</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Remplissez ce formulaire pour toute demande de renseignement ou de devis sur-mesure.
                    </p>
                  </div>

                  {/* Message global si tentative d'envoi avec erreurs */}
                  {errorMsg && (
                    <div className="rounded-xl bg-red-50 p-4 border border-red-200 flex items-center gap-3 text-red-700 text-sm">
                      <AlertCircle size={20} className="shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Nom complet */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        maxLength={100}
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ex: Jean Dupont"
                        className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                          nameStatus
                            ? nameStatus.valid
                              ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-600/10'
                              : 'border-red-500 focus:border-red-600 focus:ring-red-600/10'
                            : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-600/10'
                        }`}
                      />
                      {nameStatus && (
                        <p className={`mt-1.5 text-xs flex items-center gap-1 font-medium ${nameStatus.valid ? 'text-emerald-600' : 'text-red-500'}`}>
                          {nameStatus.valid ? <Check size={14} /> : <AlertCircle size={14} />}
                          {nameStatus.text}
                        </p>
                      )}
                    </div>

                    {/* Adresse Email */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Adresse Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        maxLength={150}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Ex: jean.dupont@example.com"
                        className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                          emailStatus
                            ? emailStatus.valid
                              ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-600/10'
                              : 'border-red-500 focus:border-red-600 focus:ring-red-600/10'
                            : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-600/10'
                        }`}
                      />
                      {emailStatus && (
                        <p className={`mt-1.5 text-xs flex items-center gap-1 font-medium ${emailStatus.valid ? 'text-emerald-600' : 'text-red-500'}`}>
                          {emailStatus.valid ? <Check size={14} /> : <AlertCircle size={14} />}
                          {emailStatus.text}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Téléphone */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        maxLength={25}
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Ex: +261 34 00 000 00"
                        className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                          phoneStatus
                            ? phoneStatus.valid
                              ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-600/10'
                              : 'border-red-500 focus:border-red-600 focus:ring-red-600/10'
                            : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-600/10'
                        }`}
                      />
                      {phoneStatus && (
                        <p className={`mt-1.5 text-xs flex items-center gap-1 font-medium ${phoneStatus.valid ? 'text-emerald-600' : 'text-red-500'}`}>
                          {phoneStatus.valid ? <Check size={14} /> : <AlertCircle size={14} />}
                          {phoneStatus.text}
                        </p>
                      )}
                    </div>

                    {/* Sujet de la demande */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Sujet de la demande *
                      </label>
                      <select
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                          subjectStatus
                            ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-600/10'
                            : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-600/10'
                        }`}
                      >
                        <option value="">Sélectionnez un sujet</option>
                        <option value="circuit">Réservation ou info sur un circuit</option>
                        <option value="sur_mesure">Projet de voyage sur-mesure</option>
                        <option value="suivi">Suivi de réservation existant</option>
                        <option value="autre">Autre demande</option>
                      </select>
                      {subjectStatus && (
                        <p className="mt-1.5 text-xs flex items-center gap-1 font-medium text-emerald-600">
                          <Check size={14} /> {subjectStatus.text}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Votre Message */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Votre Message *
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      maxLength={1000}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Précisez vos dates souhaitées, le nombre de voyageurs ou vos attentes particulières... (Min. 10 caractères)"
                      className={`w-full rounded-xl border p-4 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                        messageStatus
                          ? messageStatus.valid
                            ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-600/10'
                            : 'border-red-500 focus:border-red-600 focus:ring-red-600/10'
                          : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-600/10'
                      }`}
                    />
                    {messageStatus && (
                      <p className={`mt-1.5 text-xs flex items-center gap-1 font-medium ${messageStatus.valid ? 'text-emerald-600' : 'text-red-500'}`}>
                        {messageStatus.valid ? <Check size={14} /> : <AlertCircle size={14} />}
                        {messageStatus.text}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:opacity-50 cursor-pointer w-full sm:w-auto"
                  >
                    {loading ? (
                      'Validation en cours...'
                    ) : (
                      <>
                        <Send size={16} /> Envoyer le message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}