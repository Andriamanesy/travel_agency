import { NavLink, Outlet } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authService } from '@/features/auth/services/auth.service'
import { clearSession } from '@/lib/session'
import { useSessionStore } from '@/features/auth/store/session.store'
import { mediaUrl } from '@/lib/api-client'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile', label: 'Profil' },
  { to: '/destinations', label: 'Destinations' },
  { to: '/catalog/circuits', label: 'Catalogue' },
  { to: '/bookings', label: 'Mes réservations' },
  { to: '/admin/bookings', label: 'Administration', admin: true },
  { to: '/admin/destinations', label: 'Admin destinations', admin: true },
  { to: '/admin/catalog/circuits', label: 'Admin catalogue', admin: true },
  { to: '/admin/access', label: 'Admin utilisateurs', admin: true },
]

export function MainLayout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isAdmin = useSessionStore((state) => state.roles.includes('admin'))
  const user = useSessionStore((state) => state.user)
  const [profileOpen, setProfileOpen] = useState(false)
  const initials = user?.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'TM'

  async function logout() {
    try { await authService.logout() } catch { /* Local logout must remain available offline. */ }
    clearSession()
    queryClient.clear()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white p-6 lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-black text-white">
            T
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">TravelMS</p>
            <p className="text-sm text-slate-500">Panel d’administration</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">État</p>
          <p className="mt-2 text-sm font-semibold text-slate-800">Interface React premium en cours de migration</p>
        </div>

        <nav className="mt-8 flex flex-col gap-2">
          {links.filter((link) => !link.admin || isAdmin).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-2xl px-4 py-3 font-semibold transition ${
                  isActive ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:ml-72">
        <header className="border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Nouvelle interface</p>
              <h1 className="text-xl font-black text-slate-900">TravelMS React</h1>
            </div>
            <div className="relative"><button type="button" aria-expanded={profileOpen} onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300"><span className="grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-emerald-100 text-xs text-emerald-800">{user?.avatar_url ? <img src={mediaUrl(user.avatar_url)} alt="" className="h-full w-full object-cover" /> : initials}</span><span className="hidden max-w-36 truncate sm:block">{user?.name || 'Mon compte'}</span><span aria-hidden="true" className="text-slate-400">⌄</span></button>{profileOpen && <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl"><NavLink onClick={() => setProfileOpen(false)} to="/dashboard" className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Tableau de bord</NavLink><NavLink onClick={() => setProfileOpen(false)} to="/profile" className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Mon profil</NavLink><button type="button" onClick={logout} className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-700 hover:bg-red-50">Déconnexion</button></div>}</div>
          </div>
        </header>

        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
