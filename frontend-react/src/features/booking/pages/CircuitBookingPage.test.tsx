import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setAccessToken } from '@/lib/session'
import { useSessionStore } from '@/features/auth/store/session.store'
import { LegacyBookingRedirect } from '@/routes/LegacyBookingRedirect'
import { CircuitBookingPage } from './CircuitBookingPage'

const circuitId = '11111111-1111-4111-8111-111111111111'

function response(payload: unknown) {
  return { ok: true, json: async () => payload } as Response
}

function Location() {
  const location = useLocation()
  return <p>{location.pathname}{location.search}</p>
}

describe('CircuitBookingPage', () => {
  beforeEach(() => {
    localStorage.clear()
    setAccessToken('test-token')
    useSessionStore.setState({ status: 'authenticated', user: { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com', phone: '+261 34 00 000 00' }, roles: [] })
    vi.stubGlobal('fetch', vi.fn())
  })

  it('loads a circuit, pre-fills the contact and creates its booking', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce(response({ circuit: { id: circuitId, title: 'Nord sauvage', description: 'Circuit', price: 800, duration_days: 7, capacity: 12, destination: { id: 'd1', title: 'Diego', location: 'Antsiranana' } } }))
    mockFetch.mockResolvedValueOnce(response({ message: 'ok', booking: { id: 'booking-1', circuit_id: circuitId, start_date: '2027-01-10', end_date: '2027-01-17', participants_count: 2, total_price: 1720, status: 'pending', booking_options: { cancellation_protection: true, airport_transfer: true } } }))

    render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}><MemoryRouter initialEntries={[`/booking/${circuitId}`]}><Routes><Route path="/booking/:tourId" element={<CircuitBookingPage />} /></Routes></MemoryRouter></QueryClientProvider>)

    expect(await screen.findByRole('heading', { name: 'Préparez votre circuit' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('ada@example.com')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Date de départ'), { target: { value: '2027-01-10' } })
    fireEvent.change(screen.getByLabelText('Date de retour'), { target: { value: '2027-01-17' } })
    fireEvent.change(screen.getByLabelText('Nombre de voyageurs'), { target: { value: '2' } })
    fireEvent.click(screen.getByLabelText(/Protection annulation/))
    fireEvent.click(screen.getByLabelText(/Transfert aéroport/))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer la demande' }))

    expect(await screen.findByText(/Votre référence est booking-1/)).toBeInTheDocument()
    const [, request] = mockFetch.mock.calls[1]
    expect(String(request?.body)).toContain('"circuit_id":"11111111-1111-4111-8111-111111111111"')
    expect(String(request?.body)).toContain('"airport_transfer":true')
  })

  it('redirects a legacy tour URL while retaining its query string', async () => {
    render(<MemoryRouter initialEntries={['/booking.html?tour_id=abc&source=email']}><Routes><Route path="/booking.html" element={<LegacyBookingRedirect />} /><Route path="*" element={<Location />} /></Routes></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('/booking/abc?tour_id=abc&source=email')).toBeInTheDocument())
  })
})
