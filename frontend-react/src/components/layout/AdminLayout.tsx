import { 
  BarChart3, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  ClipboardList, 
  ExternalLink, 
  LayoutDashboard, 
  Megaphone, 
  Menu, 
  Settings, 
  Star, 
  Users, 
  X,
  FileText,
  Home,
  Shield,
  type LucideIcon 
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useSessionStore } from '@/features/auth/store/session.store'

type NavigationItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

const navigationGroups: NavigationGroup[] = [
  {
    title: 'Général',
    items: [
      { to: '/admin', label: 'Vue d’ensemble', icon: LayoutDashboard, end: true },
    ],
  },
  {
    title: 'Catalogue & Activités',
    items: [
      { to: '/admin/circuits', label: 'Circuits & catalogue', icon: ClipboardList },
      { to: '/admin/bookings', label: 'Réservations', icon: BookOpen },
      { to: '/admin/reviews', label: 'Avis clients', icon: Star },
    ],
  },
  {
    title: 'Contenu & Site',
    items: [
      { to: '/admin/content', label: 'Contenu & blog', icon: FileText },
      { to: '/admin/content/home', label: 'Page d’accueil', icon: Home },
      { to: '/admin/marketing', label: 'Marketing & promos', icon: Megaphone },
    ],
  },
  {
    title: 'Administration',
    items: [
      { to: '/admin/users', label: 'Utilisateurs', icon: Users },
      { to: '/admin/users/roles', label: 'Rôles & permissions', icon: Shield },
      { to: '/admin/settings', label: 'Paramètres', icon: Settings },
    ],
  },
]

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(true) 
  const user = useSessionStore((state) => state.user)
  
  const sidebarWidth = collapsed ? 'w-20' : 'w-72'
  const sidebarClasses = `fixed inset-y-0 left-0 z-50 flex ${sidebarWidth} flex-col bg-[#0A0A0B] border-r border-slate-800/60 transition-all duration-300 ease-in-out lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? 'dark bg-[#0A0A0B] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Overlay Mobile */}
      {mobileOpen && (
        <button 
          aria-label="Fermer le menu" 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        {/* Header Sidebar (Logo) */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          <Link to="/admin" className="flex items-center gap-3 overflow-hidden outline-none ring-offset-2 ring-offset-[#0A0A0B] focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <span className="text-sm font-bold text-slate-950">T</span>
            </span>
            {!collapsed && (
              <span className="flex flex-col animate-in fade-in zoom-in duration-300">
                <span className="text-sm font-bold tracking-wide text-slate-100">TRAVELMS</span>
              </span>
            )}
          </Link>
          <button 
            className="text-slate-400 hover:text-white transition-colors lg:hidden" 
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigationGroups.map((group, idx) => (
            <div key={idx} className="mb-6 last:mb-0">
              {!collapsed ? (
                <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500/80">
                  {group.title}
                </div>
              ) : (
                <div className="mx-auto mb-2 mt-4 h-px w-8 bg-slate-800/60 first:mt-0 first:hidden" />
              )}

              <div className="space-y-1">
                {group.items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink 
                    key={to} 
                    to={to} 
                    end={end} 
                    onClick={() => setMobileOpen(false)} 
                    title={collapsed ? label : undefined}
                    className={({ isActive }) => `
                      group relative flex items-center ${collapsed ? 'justify-center px-0' : 'px-3 gap-3'} 
                      h-10 rounded-lg text-sm font-medium transition-all duration-200 outline-none
                      ${isActive 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-1/2 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                        )}
                        <Icon 
                          size={18} 
                          className={`shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} 
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                        {!collapsed && <span className="truncate">{label}</span>}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="shrink-0 space-y-2 border-t border-slate-800/60 p-4">
          <Link 
            to="/" 
            className={`group flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} h-10 rounded-lg text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-slate-200`}
            title={collapsed ? 'Voir le site' : undefined}
          >
            <ExternalLink size={18} className="group-hover:text-emerald-400 transition-colors" />
            {!collapsed && <span>Voir le site public</span>}
          </Link>
          
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className={`hidden lg:flex w-full items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} h-10 rounded-lg text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-slate-200`}
            title={collapsed ? 'Déployer' : 'Réduire'}
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span>Réduire le menu</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Contenu Principal */}
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        
        {/* Header Topbar */}
        <header className={`sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-8 backdrop-blur-md transition-colors duration-300 ${
          dark 
            ? 'border-slate-800/60 bg-[#0A0A0B]/80 text-white' 
            : 'border-slate-200 bg-white/80 text-slate-900'
        }`}>
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-500 hover:text-emerald-500 transition-colors" 
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="hidden items-center gap-2 text-xs font-medium tracking-wide text-slate-500 sm:flex uppercase">
              <BarChart3 size={15} className="text-emerald-500" />
              <span>Centre de contrôle</span>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setDark(!dark)} 
              className="group relative flex h-8 items-center justify-center rounded-md border border-slate-700 bg-slate-800/50 px-3 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white dark:border-slate-800 dark:bg-slate-900"
            >
              {dark ? 'Mode Clair' : 'Mode Sombre'}
            </button>
            
            <div className="h-6 w-px bg-slate-800"></div>

            {/* User Profile */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold leading-none">{user?.name || 'Admin Principal'}</span>
                <span className="text-xs text-slate-500 mt-1">Gérant</span>
              </div>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-800 border border-slate-700 text-sm font-bold text-slate-200 shadow-sm transition-all group-hover:border-emerald-500 group-hover:text-emerald-400">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Zone Outlet */}
        <main className="flex-1 w-full mx-auto max-w-[1600px] p-4 sm:p-8">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}