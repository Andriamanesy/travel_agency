import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingsService } from '@/features/bookings/services/bookings.service'
import { useSessionStore } from '@/features/auth/store/session.store'

const bookingsKey = ['bookings', 'me'] as const

export const useCustomerBookings = (options?: { enabled?: boolean }) => useQuery({ queryKey: bookingsKey, queryFn: bookingsService.mine, ...options })

export function useCancelCustomerBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: bookingsService.cancel,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: bookingsKey }); useSessionStore.getState().showToast({ title: 'Réservation annulée', message: 'Votre demande a bien été annulée.' }) },
  })
}
