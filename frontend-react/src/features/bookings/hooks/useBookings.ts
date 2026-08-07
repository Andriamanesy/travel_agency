import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingsService } from '../services/bookings.service'
import type { BookingValues } from '../schemas/booking.schema'

export function useMyBookings() {
  return useQuery({ queryKey: ['bookings', 'me'], queryFn: bookingsService.mine })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ destinationId, values }: { destinationId: string; values: BookingValues }) => bookingsService.create(destinationId, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings', 'me'] }),
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: bookingsService.cancel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings', 'me'] }),
  })
}
