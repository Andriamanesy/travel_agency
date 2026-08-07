export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Booking {
  id: string
  offer_title?: string
  destination_id: string | null
  circuit_id: string | null
  start_date: string
  end_date: string
  participants_count: number
  total_price: number
  status: BookingStatus
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  booking_options?: { cancellation_protection?: boolean; airport_transfer?: boolean }
}

export interface CreateBookingResponse { message: string; booking: Booking }
