export interface Destination {
  id: string
  title: string
  location: string
  price: number
  description: string
  image_url?: string | null
  category_name?: string | null
}

export interface Pagination { page: number; limit: number; total: number; pages: number }
export interface DestinationsResponse { destinations: Destination[]; pagination: Pagination }
export interface DestinationDetails extends Destination {
  gallery: Array<{ id: string; image_url: string }>
}
