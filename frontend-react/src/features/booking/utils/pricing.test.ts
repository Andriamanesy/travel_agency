import { describe, expect, it } from 'vitest'
import { calculateBookingPrice } from './pricing'

describe('calculateBookingPrice', () => {
  it('adds only the selected extras to the circuit price', () => {
    expect(calculateBookingPrice(800, 2, { cancellation_protection: true, airport_transfer: true })).toEqual({
      base: 1600,
      cancellationProtection: 70,
      airportTransfer: 50,
      total: 1720,
    })
  })
})
