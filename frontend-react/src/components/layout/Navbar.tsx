import { ChevronDown, LayoutDashboard, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { authService } from '@/features/auth/services/auth.service'
import { useSessionStore } from '@/features/auth/store/session.store'
import { clearSession } from '@/lib/session'
import { mediaUrl } from '@/lib/api-client'
import { useQueryClient } from '@tanstack/react-query'

export function Navbar({ onAuthenticate }: { onAuthenticate?: () => void }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const user = useSessionStore((state) => state.user)
  const authenticated = useSessionStore((state) => state.status === 'authenticated')
  const isAdmin = useSessionStore((state) => state.roles.includes('admin') || state.roles.includes('super_admin'))
  
  const catalogTarget = authenticated && !isAdmin ? '/' : '/catalog/circuits'
  const initials = user?.name?.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'TM'
  
  const close = () => setOpen(false)
  const openAuthentication = () => { if (onAuthenticate) onAuthenticate(); else navigate('/?auth=login') }

  // Fermer le menu dropdown si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function logout() { 
    try { 
      await authService.logout() 
    } catch { 
      /* Le local logout reste possible */ 
    } 
    clearSession()
    queryClient.clear() 
    useSessionStore.getState().showToast({ title: 'Déconnexion réussie', message: 'Vous avez été déconnecté avec succès.', tone: 'info' }) 
    close() 
    navigate('/', { replace: true }) 
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900">
          <span className="text-emerald-700">🌍</span>
          <span>Travel<span className="text-emerald-700">MS</span></span>
        </Link>

        {/* NAVIGATION DESKTOP */}
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
          <NavLink to={catalogTarget} className="transition hover:text-emerald-700">Catalogue</NavLink>
          
          {authenticated && !isAdmin && (
            <NavLink to="/bookings" className="transition hover:text-emerald-700">Mes réservations</NavLink>
          )}

          <a href="/#experiences" className="transition hover:text-emerald-700">Expériences</a>
          
          {/* Navigation vers la page contact dédiée */}
          <NavLink to="/contact" className="transition hover:text-emerald-700">
            Contact
          </NavLink>          
        </nav>

        {/* ACTIONS DROITE */}
        <div className="relative flex items-center gap-3" ref={dropdownRef}>
          {!authenticated ? (
            <button 
              type="button" 
              onClick={openAuthentication} 
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-emerald-600 hover:text-emerald-800 cursor-pointer"
            >
              Se connecter / S’inscrire
            </button>
          ) : (
            <>
              {isAdmin ? (
                <Link to="/admin" className="hidden items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:bg-emerald-700 sm:flex">
                  <ShieldCheck size={17} /> Back-Office Admin
                </Link>
              ) : (
                <Link to="/dashboard" className="hidden rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-400 sm:block">
                  Mon espace
                </Link>
              )}

              {/* BOUTON PROFIL / DROPDOWN */}
              <button 
                type="button" 
                aria-expanded={open} 
                onClick={() => setOpen(!open)} 
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 cursor-pointer"
              >
                <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-emerald-100 text-xs text-emerald-800 font-bold">
                  {user?.avatar_url ? <img src={mediaUrl(user.avatar_url)} alt="" className="h-full w-full object-cover" /> : initials}
                </span>
                <span className="hidden max-w-24 truncate sm:block">{user?.name}</span>
                <ChevronDown size={15} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
              </button>

              {/* MENU DEROULANT */}
              {open && (
                <div className="absolute right-0 top-14 z-50 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
                  <Link onClick={close} to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                    <LayoutDashboard size={16} />
                    {isAdmin ? 'Vue d’ensemble Admin' : 'Mon espace / Dashboard'}
                  </Link>

                  {isAdmin && (
                    <Link onClick={close} to="/admin/bookings" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                      <ShieldCheck size={16} />
                      Réservations Admin
                    </Link>
                  )}

                  <Link onClick={close} to="/profile" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                    <UserRound size={16} />
                    Mon profil
                  </Link>

                  <div className="my-1 border-t border-slate-100" />

                  <button type="button" onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer">
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </div>
              )}
            </>
          )}

          <Link to="/catalog/circuits" className="hidden rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800 md:block">
            Explorer
          </Link>
        </div>
      </div>
    </header>
  )
}