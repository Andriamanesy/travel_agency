const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

/**
 * La SPA et l'API partagent l'origine Nginx en production. Une valeur absolue
 * reste possible pour le développement, mais la valeur par défaut évite CORS.
 */
export const API_URL = !configuredApiUrl
  ? '/api/v1'
  : configuredApiUrl.endsWith('/api/v1')
    ? configuredApiUrl
    : configuredApiUrl.endsWith('/api')
      ? `${configuredApiUrl}/v1`
      : `${configuredApiUrl}/api/v1`
export const API_ROOT_URL = API_URL.replace(/\/v1$/, '')
