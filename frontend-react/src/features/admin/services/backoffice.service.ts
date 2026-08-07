import { apiClient } from '@/lib/api-client'

export type BackofficeResource = 'posts' | 'banners' | 'coupons' | 'reviews'
export type AdminRecord = Record<string, unknown> & { id: string; created_at?: string; updated_at?: string }
export type Analytics = { kpis: { revenue: number; bookings_month: number; bookings_year: number; cancellation_rate: number; new_customers: number; popular_circuits: Array<{ title: string; bookings: number }> } }
export type AdminBookingDetail = AdminRecord & { status: 'pending' | 'confirmed' | 'cancelled'; customer_name?: string; customer_email?: string; offer_title?: string; start_date: string; end_date: string; participants_count: number; total_price: number; internal_notes?: string | null; cancellation_reason?: string | null }

const base = '/v1/admin'
export const backofficeService = {
  analytics: () => apiClient.get<Analytics>(`${base}/analytics`),
  bookings: (params = '') => apiClient.get<{ bookings: AdminBookingDetail[]; pagination: { page: number; limit: number; total: number; pages: number } }>(`${base}/bookings${params}`),
  updateBooking: (id: string, values: Partial<Pick<AdminBookingDetail, 'status' | 'internal_notes' | 'cancellation_reason'>>) => apiClient.put<{ booking: AdminBookingDetail }>(`${base}/bookings/${id}`, values),
  list: (resource: BackofficeResource) => apiClient.get<Record<BackofficeResource, AdminRecord[]>>(`${base}/${resource}`),
  create: (resource: BackofficeResource, values: Record<string, unknown>) => apiClient.post(`${base}/${resource}`, values),
  update: (resource: BackofficeResource, id: string, values: Record<string, unknown>) => apiClient.put(`${base}/${resource}/${id}`, values),
  remove: (resource: BackofficeResource, id: string) => apiClient.delete(`${base}/${resource}/${id}`),
  settings: () => apiClient.get<{ settings: Array<{ key: string; value: Record<string, unknown>; updated_at: string }> }>(`${base}/settings`),
  saveSetting: (key: string, value: Record<string, unknown>) => apiClient.put(`${base}/settings`, { key, value }),
}
