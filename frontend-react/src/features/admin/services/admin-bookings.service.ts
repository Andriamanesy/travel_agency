import { apiClient } from '@/lib/api-client'
import type { AdminBooking } from '../types'

export const adminBookingsService = {
  list: () => apiClient.get<{ bookings: AdminBooking[] }>('/admin/bookings'),
  updateStatus: (id: string, status: AdminBooking['status']) => apiClient.put<{ booking: AdminBooking }>(`/admin/bookings/${id}`, { status }),
}
