import { API_ROOT_URL, API_URL } from '@/lib/env'
import { getAccessToken, setAccessToken } from '@/lib/session'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type ApiOptions = Omit<RequestInit, 'body'> & { body?: unknown; skipRefresh?: boolean }
let refreshRequest: Promise<string> | null = null

function apiUrl(path: string) {
  // Les endpoints versionnés utilisent /api/v1 ; les endpoints historiques
  // d'authentification restent sous /api. Les deux chemins restent relatifs
  // lorsqu'ils sont servis derrière Nginx.
  return path.startsWith('/v1/') ? `${API_URL}${path.slice(3)}` : `${API_ROOT_URL}${path}`
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message = typeof payload === 'object' && payload && 'error' in payload
      ? String(payload.error)
      : `Erreur HTTP ${response.status}`
    throw new ApiError(message, response.status)
  }
  return payload as T
}

async function refreshToken() {
  refreshRequest ??= fetch(apiUrl('/refresh'), {
    method: 'POST', credentials: 'include',
  }).then((response) => parseResponse<{ token: string }>(response)).then(({ token }) => {
    setAccessToken(token)
    return token
  }).finally(() => { refreshRequest = null })
  return refreshRequest
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers, skipRefresh = false, ...init } = options
  const send = async (token = getAccessToken()) => fetch(apiUrl(path), {
    ...init,
    credentials: 'include',
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  let response = await send()
  if (response.status === 401 && !skipRefresh && path !== '/refresh' && getAccessToken()) {
    try {
      response = await send(await refreshToken())
    } catch { /* Une requête métier ne doit jamais déconnecter la session. */ }
  }
  return parseResponse<T>(response)
}

async function requestForm<T>(path: string, method: 'POST' | 'PUT', body: FormData): Promise<T> {
  const send = async (token = getAccessToken()) => fetch(apiUrl(path), { method, body, credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : {} })
  let response = await send()
  if (response.status === 401 && getAccessToken()) {
    try { response = await send(await refreshToken()) } catch { /* Voir request(): conserver la session UI. */ }
  }
  return parseResponse<T>(response)
}

export const apiClient = {
  get: <T>(path: string, options?: ApiOptions) => request<T>(path, options),
  post: <T>(path: string, body?: unknown, options?: ApiOptions) => request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: ApiOptions) => request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: ApiOptions) => request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: ApiOptions) => request<T>(path, { ...options, method: 'DELETE' }),
  form: <T>(path: string, method: 'POST' | 'PUT', body: FormData) => requestForm<T>(path, method, body),
  download: async (path: string) => {
    const response = await fetch(apiUrl(path), { credentials: 'include', headers: getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {} })
    if (!response.ok) return parseResponse(response)
    const url = URL.createObjectURL(await response.blob()); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'reservation.pdf'; anchor.click(); URL.revokeObjectURL(url)
  },
}

export function mediaUrl(path?: string | null) {
  if (!path) return undefined
  return path.startsWith('http') ? path : `${API_ROOT_URL}${path}`
}
