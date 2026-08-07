import { apiClient } from '@/lib/api-client'
import type { CircuitBookingValues } from '../schemas/booking.schema'
import type { Circuit, CreatedBooking } from '../types'

export const bookingService = {
  getCircuit: (id: string) => apiClient.get<{ circuit: Circuit }>(`/circuits/${id}`),
  createCircuitBooking: (circuitId: string, values: CircuitBookingValues) =>
    apiClient.post<{ message: string; booking: CreatedBooking }>('/bookings', { circuit_id: circuitId, ...values }),
}
