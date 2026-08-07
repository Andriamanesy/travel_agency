export interface Circuit {
  id: string
  title: string
  description: string
  price: number
  duration_days: number
  capacity: number
  cover_image?: string | null
  destination?: { id: string; title: string; location: string; cover_image?: string | null } | null
}

export interface BookingOptions {
  cancellation_protection: boolean
  airport_transfer: boolean
}

export interface BookingContact {
  contact_name: string
  contact_email: string
  contact_phone: string
}

export interface PriceBreakdown {
  base: number
  cancellationProtection: number
  airportTransfer: number
  total: number
}

export interface CreatedBooking {
  id: string
  circuit_id: string
  start_date: string
  end_date: string
  participants_count: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled'
  booking_options: BookingOptions
}
