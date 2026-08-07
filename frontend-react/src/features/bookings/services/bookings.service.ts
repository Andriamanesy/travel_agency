import { apiClient } from '@/lib/api-client'
import type { CreateBookingResponse, Booking } from '../types'
import type { BookingValues } from '../schemas/booking.schema'

export const bookingsService = {
  create: (destinationId: string, values: BookingValues) => apiClient.post<CreateBookingResponse>('/bookings', { destination_id: destinationId, ...values }),
  mine: () => apiClient.get<{ bookings: Booking[] }>('/bookings/me'),
}
