import { 
  BarChart3, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  ClipboardList, 
  ExternalLink, 
  FileText,
  Home,
  LayoutDashboard, 
  LogOut,
  Megaphone, 
  Menu, 
  Settings, 
  ShieldCheck, 
  Star, 
  UserCheck,
  Users, 
  X,
  type LucideIcon 
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
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
      { to: '/admin/roles', label: 'Rôles & permissions', icon: ShieldCheck },
      { to: '/admin/settings', label: 'Paramètres & Sécurité', icon: Settings },
    ],
  },
]

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(true) 
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const user = useSessionStore((state) => state.user)
  const clearSession = useSessionStore((state) => state.clear)
  const navigate = useNavigate()
  
  const handleLogout = () => {
    clearSession()
    navigate('/login')
  }

  // Gestion de la fermeture via clic extérieur et touche Échap
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileDropdownOpen(false)
        setMobileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
  
  const sidebarWidth = collapsed ? 'w-20' : 'w-72'
  
  const sidebarClasses = `fixed inset-y-0 left-0 z-50 flex ${sidebarWidth} flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
    mobileOpen ? 'translate-x-0' : '-translate-x-full'
  } ${
    dark 
      ? 'bg-[#0A0A0B] border-r border-slate-800/80 text-slate-300' 
      : 'bg-white border-r border-slate-200 text-slate-700 shadow-xl lg:shadow-none'
  }`

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? 'dark bg-[#0A0A0B] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Overlay Mobile */}
      {mobileOpen && (
        <div 
          role="button"
          tabIndex={0}
          aria-label="Fermer le menu" 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden" 
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => e.key === 'Enter' && setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        {/* Header Sidebar (Logo) */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-inherit/40">
          <Link to="/admin" className="flex items-center gap-3 overflow-hidden outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <span className="text-sm font-bold text-slate-950">T</span>
            </span>
            {!collapsed && (
              <span className="flex flex-col animate-in fade-in duration-200">
                <span className={`text-sm font-bold tracking-wide ${dark ? 'text-slate-100' : 'text-slate-900'}`}>TRAVELMS</span>
              </span>
            )}
          </Link>
          <button 
            type="button"
            aria-label="Fermer le menu latéral"
            className="p-1 rounded-lg hover:bg-slate-800/50 transition-colors lg:hidden text-slate-400 hover:text-slate-100" 
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
                <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/80">
                  {group.title}
                </div>
              ) : (
                <div className="mx-auto mb-2 mt-4 h-px w-8 bg-slate-300 dark:bg-slate-800/60 first:mt-0 first:hidden" />
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
                        ? 'bg-emerald-500/10 text-emerald-500 font-semibold' 
                        : dark 
                          ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' 
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
                          className={`shrink-0 transition-transform duration-200 ${isActive ? 'text-emerald-500' : 'group-hover:scale-110'}`} 
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
        <div className={`shrink-0 space-y-2 p-4 border-t ${dark ? 'border-slate-800/60' : 'border-slate-200'}`}>
          <Link 
            to="/" 
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} h-10 rounded-lg text-sm font-medium transition-colors ${
              dark ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title={collapsed ? 'Voir le site public' : undefined}
          >
            <ExternalLink size={18} className="group-hover:text-emerald-500 transition-colors shrink-0" />
            {!collapsed && <span>Voir le site public</span>}
          </Link>

          <button 
            type="button"
            onClick={handleLogout}
            className={`w-full group flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} h-10 rounded-lg text-sm font-medium transition-colors text-red-500 hover:bg-red-500/10`}
            title={collapsed ? 'Déconnexion' : undefined}
          >
            <LogOut size={18} className="shrink-0 transition-transform group-hover:scale-110" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
          
          <button 
            type="button"
            onClick={() => setCollapsed(!collapsed)} 
            className={`hidden lg:flex w-full items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} h-10 rounded-lg text-sm font-medium transition-colors ${
              dark ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title={collapsed ? 'Déployer le menu' : 'Réduire le menu'}
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
              type="button"
              aria-label="Ouvrir le menu"
              className="lg:hidden text-slate-500 hover:text-emerald-500 transition-colors p-1" 
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
              type="button"
              onClick={() => setDark(!dark)} 
              className={`group relative flex h-8 items-center justify-center rounded-md border px-3 text-xs font-semibold transition-colors ${
                dark 
                  ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white' 
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
              }`}
            >
              {dark ? 'Mode Clair' : 'Mode Sombre'}
            </button>
            
            <div className={`h-6 w-px ${dark ? 'bg-slate-800' : 'bg-slate-200'}`} />

            {/* User Profile Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button 
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 group focus:outline-none"
              >
                <div className="flex-col items-end hidden sm:flex">
                  <span className="text-sm font-semibold leading-none group-hover:text-emerald-400 transition-colors">
                    {user?.name || 'Admin Principal'}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">{user?.email || 'admin@travelms.com'}</span>
                </div>
                <div className={`grid h-9 w-9 place-items-center rounded-full border text-sm font-bold shadow-sm transition-all ${
                  dark ? 'bg-slate-800 border-slate-700 text-slate-200 group-hover:border-emerald-500' : 'bg-slate-100 border-slate-200 text-slate-700 group-hover:border-emerald-500'
                }`}>
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
              </button>

              {/* Dropdown Popover */}
              {profileDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-60 rounded-xl border shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  dark ? 'bg-[#121214] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <div className="px-4 py-2.5 border-b border-inherit/40 sm:hidden">
                    <p className="text-sm font-semibold truncate">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>

                  <Link 
                    to="/admin/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                      dark ? 'hover:bg-slate-800/60 hover:text-emerald-400' : 'hover:bg-slate-100 hover:text-emerald-600'
                    }`}
                  >
                    <UserCheck size={16} />
                    <span>Mon profil & paramètres</span>
                  </Link>

                  <Link 
                    to="/admin/settings?tab=security"
                    onClick={() => setProfileDropdownOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                      dark ? 'hover:bg-slate-800/60 hover:text-emerald-400' : 'hover:bg-slate-100 hover:text-emerald-600'
                    }`}
                  >
                    <ShieldCheck size={16} />
                    <span>Sécurité & 2FA</span>
                  </Link>

                  <div className={`my-1 h-px ${dark ? 'bg-slate-800' : 'bg-slate-100'}`} />

                  <button 
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      handleLogout()
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
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