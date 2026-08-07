import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardPage } from './DashboardPage'

const response = (payload: unknown) => ({ ok: true, json: async () => payload } as Response)

describe('DashboardPage', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))

  it('shows a future booking and lets its pending request be cancelled', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce(response({ bookings: [{ id: '11111111-1111-4111-8111-111111111111', offer_title: 'Nord sauvage', start_date: '2099-01-10', end_date: '2099-01-17', participants_count: 2, total_price: 1600, status: 'pending', destination_id: null, circuit_id: 'c1', booking_options: { airport_transfer: true } }] }))
    mockFetch.mockResolvedValueOnce(response({ booking: { id: '11111111-1111-4111-8111-111111111111', status: 'cancelled' } }))
    mockFetch.mockResolvedValueOnce(response({ bookings: [] }))
    render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}><MemoryRouter><DashboardPage /></MemoryRouter></QueryClientProvider>)

    expect(await screen.findByText('Nord sauvage')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Annuler la demande' }))
    fireEvent.click(screen.getByRole('button', { name: 'Annuler la réservation' }))
    await waitFor(() => expect(mockFetch.mock.calls.some(([url]) => String(url).includes('/api/bookings/11111111-1111-4111-8111-111111111111/cancel'))).toBe(true))
  })
})
