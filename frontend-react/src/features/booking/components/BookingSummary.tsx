import type { Circuit, PriceBreakdown } from '../types'

const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

export function BookingSummary({ circuit, participants, price }: { circuit: Circuit; participants: number; price: PriceBreakdown }) {
  return <aside className="h-fit rounded-3xl bg-slate-900 p-7 text-white"><p className="text-xs font-bold tracking-widest text-emerald-200">RÉCAPITULATIF</p><h2 className="mt-3 text-2xl font-black">{circuit.title}</h2><p className="mt-2 text-sm text-slate-300">{circuit.destination?.location ?? `${circuit.duration_days} jours`}</p><div className="my-6 border-t border-slate-700" /><Line label={`${money.format(circuit.price)} × ${participants} voyageur(s)`} amount={price.base} />{price.cancellationProtection > 0 && <Line label="Protection annulation" amount={price.cancellationProtection} />}{price.airportTransfer > 0 && <Line label="Transfert aéroport" amount={price.airportTransfer} />}<div className="mt-5 flex justify-between border-t border-slate-700 pt-5 text-lg font-bold"><span>Total estimé</span><span>{money.format(price.total)}</span></div><p className="mt-4 text-xs leading-5 text-slate-400">Le prix et la disponibilité sont recalculés par le serveur avant confirmation.</p></aside>
}

function Line({ label, amount }: { label: string; amount: number }) { return <div className="mt-3 flex justify-between gap-4 text-sm text-slate-300"><span>{label}</span><span>{money.format(amount)}</span></div> }
