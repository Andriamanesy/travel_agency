import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@testing-library/jest-dom'
import { LoginForm } from './LoginForm'
import { getAccessToken } from '@/lib/session'
import { useSessionStore } from '../store/session.store'

describe('LoginForm', () => {
  beforeEach(() => {
    localStorage.clear()
    useSessionStore.setState({ status: 'anonymous', user: null, roles: [] })
    vi.stubGlobal('fetch', vi.fn())
  })

  it('keeps the access token in memory and authenticates the shared session', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'abc123', user: { email: 'demo@example.com' } }),
    } as Response)

    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), {
      target: { value: 'demo@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(getAccessToken()).toBe('abc123')
      expect(useSessionStore.getState().status).toBe('authenticated')
      expect(useSessionStore.getState().user?.email).toBe('demo@example.com')
      expect(localStorage.getItem('token')).toBeNull()
    })
  })
})
