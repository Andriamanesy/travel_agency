import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingService } from '../services/booking.service'
import type { CircuitBookingValues } from '../schemas/booking.schema'

export const useCircuit = (circuitId: string) => useQuery({
  queryKey: ['circuits', circuitId],
  queryFn: () => bookingService.getCircuit(circuitId),
  enabled: Boolean(circuitId),
})

export function useCreateCircuitBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ circuitId, values }: { circuitId: string; values: CircuitBookingValues }) => bookingService.createCircuitBooking(circuitId, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings', 'me'] }),
  })
}
