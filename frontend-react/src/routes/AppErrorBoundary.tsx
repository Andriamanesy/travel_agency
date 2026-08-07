import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { SiteFooter } from '@/components/layout/SiteFooter'

interface State { failed: boolean }

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }
  static getDerivedStateFromError(): State { return { failed: true } }
  componentDidCatch(_error: Error, _info: ErrorInfo) { /* Le suivi d'erreur distant peut être branché ici. */ }
  render() {
    if (!this.state.failed) return this.props.children
    return <div className="flex min-h-screen flex-col bg-slate-50"><Navbar /><main className="grid flex-1 place-items-center p-6 text-center"><div><p className="text-6xl font-black text-emerald-700">500</p><h1 className="mt-3 text-2xl font-bold">Une erreur est survenue</h1><p className="mt-2 text-slate-500">Notre équipe peut vous aider ; vous pouvez reprendre votre exploration.</p><Link className="mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white" to="/catalog/circuits">Retourner au catalogue</Link></div></main><SiteFooter /></div>
  }
}
