import { NavLink, Outlet } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { authService } from '@/features/auth/services/auth.service'
import { clearSession } from '@/lib/session'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile', label: 'Profil' },
  { to: '/destinations', label: 'Destinations' },
  { to: '/catalog/circuits', label: 'Catalogue' },
  { to: '/bookings', label: 'Mes réservations' },
  { to: '/admin/bookings', label: 'Administration' },
  { to: '/admin/destinations', label: 'Admin destinations' },
  { to: '/admin/catalog/circuits', label: 'Admin catalogue' },
  { to: '/admin/access', label: 'Admin utilisateurs' },
]

export function MainLayout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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
          {links.map((link) => (
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
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              onClick={logout}
            >
              Déconnexion
            </button>
          </div>
        </header>

        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
