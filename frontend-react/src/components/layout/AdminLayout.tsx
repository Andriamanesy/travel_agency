import { BarChart3, BookOpen, ChevronLeft, ChevronRight, ClipboardList, ExternalLink, LayoutDashboard, Megaphone, Menu, Settings, Star, Users, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useSessionStore } from '@/features/auth/store/session.store'

const navigation = [
  { to: '/admin', label: 'Vue d’ensemble', icon: LayoutDashboard, end: true },
  { to: '/admin/circuits', label: 'Circuits & catalogue', icon: ClipboardList },
  { to: '/admin/bookings', label: 'Réservations', icon: BookOpen },
  { to: '/admin/content', label: 'Contenu & blog', icon: BookOpen },
  { to: '/admin/marketing', label: 'Marketing & promos', icon: Megaphone },
  { to: '/admin/reviews', label: 'Avis clients', icon: Star },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users },
  { to: '/admin/users/roles', label: 'Rôles & permissions', icon: Users },
  { to: '/admin/settings', label: 'Paramètres', icon: Settings },
]

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const user = useSessionStore((state) => state.user)
  const sidebar = `fixed inset-y-0 left-0 z-50 flex ${collapsed ? 'w-20' : 'w-72'} flex-col border-r border-slate-200 bg-slate-950 p-4 text-slate-100 transition-all duration-200 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
  return <div className={dark ? 'min-h-screen bg-slate-950' : 'min-h-screen bg-slate-100'}>
    {mobileOpen && <button aria-label="Fermer le menu" className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" onClick={() => setMobileOpen(false)} />}
    <aside className={sidebar}>
      <div className="flex items-center justify-between px-2 pb-7"><Link to="/admin" className="flex items-center gap-3 overflow-hidden"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500 text-lg font-black text-slate-950">T</span>{!collapsed && <span><b className="block text-sm tracking-wide">TRAVELMS</b><small className="text-slate-400">Administration</small></span>}</Link><button className="lg:hidden" onClick={() => setMobileOpen(false)}><X size={20} /></button></div>
      <nav className="space-y-1">{navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} title={collapsed ? label : undefined} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><Icon size={19} className="shrink-0" />{!collapsed && label}</NavLink>)}</nav>
      <div className="mt-auto space-y-3 border-t border-slate-800 pt-4"><Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"><ExternalLink size={18} />{!collapsed && 'Voir le site public'}</Link><button onClick={() => setCollapsed(!collapsed)} className="hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 lg:flex">{collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} />Réduire le menu</>}</button></div>
    </aside>
    <div className={`min-h-screen transition-all ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
      <header className={`sticky top-0 z-30 flex h-18 items-center justify-between border-b px-5 backdrop-blur lg:px-8 ${dark ? 'border-slate-800 bg-slate-950/90 text-white' : 'border-slate-200 bg-white/90 text-slate-900'}`}><button className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu /></button><div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex"><BarChart3 size={17} className="text-emerald-600" />Centre de contrôle opérationnel</div><div className="ml-auto flex items-center gap-3"><button onClick={() => setDark(!dark)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold dark:border-slate-700">{dark ? 'Clair' : 'Sombre'}</button><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 font-black text-emerald-800">{user?.name?.[0]?.toUpperCase() || 'A'}</span><span className="hidden text-right text-sm sm:block"><b className="block">{user?.name || 'Administrateur'}</b><small className="text-slate-500">Administrateur</small></span></div></div></header>
      <main className="mx-auto max-w-[1600px] p-5 lg:p-8"><Outlet /></main>
    </div>
  </div>
}
