import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminBookingsService } from '../services/admin-bookings.service'
import type { AdminBooking } from '../types'

export function useAdminBookings() {
  return useQuery({ queryKey: ['admin', 'bookings'], queryFn: adminBookingsService.list })
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdminBooking['status'] }) => adminBookingsService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
  })
}
