import { useEffect } from 'react'
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import { useSessionStore } from '@/features/auth/store/session.store'

export function WelcomeToast() {
  const welcome = useSessionStore((state) => state.welcome)
  const dismiss = useSessionStore((state) => state.dismissWelcome)

  useEffect(() => {
    if (!welcome) return
    const timeout = window.setTimeout(dismiss, 5200)
    return () => window.clearTimeout(timeout)
  }, [welcome, dismiss])

  if (!welcome) return null
  const Icon = welcome.admin ? ShieldCheck : Sparkles
  return <div role="status" aria-live="polite" className="fixed right-4 top-24 z-[120] w-[min(23rem,calc(100vw-2rem))] animate-[toast-in_.45s_cubic-bezier(.16,1,.3,1)]">
    <div className="overflow-hidden rounded-3xl border border-white/20 bg-slate-950 p-1 shadow-2xl shadow-slate-950/30">
      <div className="flex gap-3 rounded-[1.35rem] bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-4 text-white">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-500/30"><Icon size={22} strokeWidth={2.5} /></span>
        <div className="min-w-0"><p className="font-black tracking-tight">{welcome.title}</p><p className="mt-1 text-sm leading-5 text-slate-300">{welcome.message}</p></div>
        <button onClick={dismiss} aria-label="Fermer la notification" className="ml-auto self-start rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white">×</button>
      </div>
      <div className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold uppercase tracking-[.18em] text-emerald-300"><CheckCircle2 size={13} /> Session sécurisée</div>
    </div>
  </div>
}
