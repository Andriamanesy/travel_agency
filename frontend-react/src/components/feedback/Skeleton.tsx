export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-label="Chargement" className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`} />
}
