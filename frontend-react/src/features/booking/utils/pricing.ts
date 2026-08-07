import type { BookingOptions, PriceBreakdown } from '../types'

export const CANCELLATION_PROTECTION_PER_PERSON = 35
export const AIRPORT_TRANSFER_PRICE = 50

/** Estimation affichée au client ; le serveur recalcule et signe toujours le total final. */
export function calculateBookingPrice(unitPrice: number, participants: number, options: BookingOptions): PriceBreakdown {
  const safeParticipants = Math.max(1, Number.isFinite(participants) ? participants : 1)
  const base = unitPrice * safeParticipants
  const cancellationProtection = options.cancellation_protection ? CANCELLATION_PROTECTION_PER_PERSON * safeParticipants : 0
  const airportTransfer = options.airport_transfer ? AIRPORT_TRANSFER_PRICE : 0
  return { base, cancellationProtection, airportTransfer, total: base + cancellationProtection + airportTransfer }
}
