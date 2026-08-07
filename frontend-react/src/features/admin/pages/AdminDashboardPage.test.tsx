import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminDashboardPage } from './AdminDashboardPage'
import { useAnalytics, useBackofficeBookings } from '../hooks/useBackoffice'

vi.mock('../hooks/useBackoffice', () => ({
  useAnalytics: vi.fn(),
  useBackofficeBookings: vi.fn(),
}))

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.mocked(useAnalytics).mockReturnValue({
      data: { kpis: { revenue: 1200, bookings_month: 2, cancellation_rate: 0, new_customers: 1, popular_circuits: undefined } },
      isPending: false,
      isError: false,
    } as never)
    vi.mocked(useBackofficeBookings).mockReturnValue({
      data: { bookings: undefined },
      isPending: false,
      isError: false,
    } as never)
  })

  it('renders safely when optional API arrays are absent', () => {
    render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>)

    expect(screen.getByText('Pas encore de données.')).toBeInTheDocument()
    expect(screen.getByText('Aucune demande en attente.')).toBeInTheDocument()
  })
})
