import { Link } from 'react-router-dom'
import { Mail, Phone, MessageSquare, MapPin, Globe, Send } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 px-6 py-16 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
        {/* Colonne 1 : À propos */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">TravelMS</p>
          <h3 className="mt-2 text-2xl font-black">Votre agence de voyages à Madagascar</h3>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">
            Spécialistes du sur-mesure, nous concevons des voyages d'exception pour vous faire vivre l'authentique beauté de la Grande Île en toute sérénité.
          </p>
        </div>

        {/* Colonne 2 : Coordonnées Directes */}
        <div className="space-y-4">
          <h4 className="text-base font-bold uppercase tracking-wider text-emerald-300">Contactez-nous</h4>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Mail size={18} className="text-emerald-400 shrink-0" />
            <span>contact@travelms.mg</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Phone size={18} className="text-emerald-400 shrink-0" />
            <span>+261 20 22 000 00 / +261 34 00 000 00</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <MessageSquare size={18} className="text-emerald-400 shrink-0" />
            <span>WhatsApp : +261 34 00 000 00</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <MapPin size={18} className="text-emerald-400 shrink-0" />
            <span>Antananarivo, Madagascar</span>
          </div>
        </div>

        {/* Colonne 3 : Liens & CGU */}
        <div className="space-y-4">
          <h4 className="text-base font-bold uppercase tracking-wider text-emerald-300">Informations & Légal</h4>
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-slate-300 transition hover:bg-emerald-600 hover:text-white">
              <Globe size={18} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-slate-300 transition hover:bg-emerald-600 hover:text-white">
              <Send size={18} />
            </a>
          </div>
          <div className="pt-2 flex flex-col gap-2 text-sm">
            <Link to="/catalog/circuits" className="text-slate-400 hover:text-emerald-400">Catalogue des circuits</Link>
            <Link to="/cgu" className="font-semibold text-emerald-400 hover:underline">Conditions Générales d'Utilisation & Confidentialité</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} TravelMS. Tous droits réservés.
      </div>
    </footer>
  )
}