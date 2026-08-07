import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './api-client'
import { saveSession } from './session'
import { useSessionStore } from '@/features/auth/store/session.store'

function response(status: number, payload: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => payload } as Response
}

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear()
    useSessionStore.setState({ status: 'anonymous', user: null, roles: [] })
    vi.stubGlobal('fetch', vi.fn())
    saveSession('access-token', { id: 'u1', name: 'Admin', email: 'admin@example.test', role: 'admin' })
  })

  it('injects the bearer token on every request to the versioned admin API', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response(200, { kpis: {} }))

    await apiClient.get('/v1/admin/analytics')

    expect(fetch).toHaveBeenCalledWith('/api/v1/admin/analytics', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer access-token' }),
    }))
  })

  it('preserves the UI session when a secondary request and its refresh fail', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(response(401, { error: 'Token expiré' }))
      .mockResolvedValueOnce(response(401, { error: 'Refresh indisponible' }))

    await expect(apiClient.get('/v1/admin/analytics')).rejects.toMatchObject({ status: 401 })

    expect(useSessionStore.getState().status).toBe('authenticated')
  })
})
