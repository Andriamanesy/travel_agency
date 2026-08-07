import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function MainLayout() {
  return <div className="min-h-screen bg-slate-50 text-slate-900"><Navbar /><main className="mx-auto max-w-7xl p-6 lg:p-8"><Outlet /></main></div>
}
