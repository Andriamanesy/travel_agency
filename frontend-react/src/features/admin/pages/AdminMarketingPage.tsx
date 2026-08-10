import { useState } from 'react'
import { ResourceManager } from '../components/ResourceManager'
import { Image, Ticket, Megaphone } from 'lucide-react'

type MarketingTab = 'banners' | 'coupons'

export function AdminMarketingPage() { 
  const [tab, setTab] = useState<MarketingTab>('banners')

  return (
    <section className="space-y-7">
      {/* En-tête de page */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.22em] text-emerald-600 dark:text-emerald-400 mb-1">
          <Megaphone size={16} />
          <span>Administration</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Marketing & Promotions
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Gérez l'affichage des bannières d'accueil et vos offres de codes promo.
        </p>
      </div>

      {/* Onglets de navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button 
          onClick={() => setTab('banners')} 
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            tab === 'banners' 
              ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-md shadow-emerald-900/20' 
              : 'bg-white dark:bg-[#121214] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Image size={16} />
          <span>Bannières Hero</span>
        </button>

        <button 
          onClick={() => setTab('coupons')} 
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            tab === 'coupons' 
              ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-md shadow-emerald-900/20' 
              : 'bg-white dark:bg-[#121214] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Ticket size={16} />
          <span>Codes promo</span>
        </button>
      </div>

      {/* Contenu du gestionnaire de ressources */}
      <div className="pt-2">
        <ResourceManager resource={tab} />
      </div>
    </section>
  ) 
}