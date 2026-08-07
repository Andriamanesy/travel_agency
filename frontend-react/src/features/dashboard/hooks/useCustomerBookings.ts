import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingsService } from '@/features/bookings/services/bookings.service'

const bookingsKey = ['bookings', 'me'] as const

export const useCustomerBookings = () => useQuery({ queryKey: bookingsKey, queryFn: bookingsService.mine })

export function useCancelCustomerBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: bookingsService.cancel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingsKey }),
  })
}
