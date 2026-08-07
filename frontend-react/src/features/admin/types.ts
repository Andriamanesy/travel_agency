import type { BookingStatus } from '@/features/bookings/types'

export interface AdminBooking {
  id: string
  offer_title: string
  customer_name: string
  customer_email: string
  start_date: string
  end_date: string
  participants_count: number
  total_price: number
  status: BookingStatus
}
