import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSessionStore } from '@/features/auth/store/session.store'
import { ProfilePage } from './ProfilePage'

const response = (payload: unknown) => ({ ok: true, json: async () => payload } as Response)

describe('ProfilePage', () => {
  beforeEach(() => {
    useSessionStore.setState({ status: 'authenticated', user: { id: 'user-1', name: 'Ada', email: 'ada@example.com' }, roles: [] })
    vi.stubGlobal('fetch', vi.fn())
  })

  it('submits the complete profile and synchronizes the session user', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce(response({ id: 'user-1', name: 'Ada', email: 'ada@example.com', phone: '', preferredLang: 'fr' }))
    mockFetch.mockResolvedValueOnce(response({ success: true, message: 'ok', user: { id: 'user-1', name: 'Ada Byron', email: 'ada@example.com', phone: '+261 34', preferredLang: 'fr' } }))
    render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}><MemoryRouter><ProfilePage /></MemoryRouter></QueryClientProvider>)

    expect(await screen.findByDisplayValue('Ada')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Nom complet'), { target: { value: 'Ada Byron' } })
    fireEvent.change(screen.getByLabelText('Téléphone'), { target: { value: '+261 34' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer mes informations' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Profil mis à jour.')
    const [, request] = mockFetch.mock.calls[1]
    expect((request!.body as FormData).get('name')).toBe('Ada Byron')
    expect(useSessionStore.getState().user?.name).toBe('Ada Byron')
  })
})
