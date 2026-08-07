const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

/** Empty in production when the SPA and API share the same origin. */
export const API_URL = apiUrl ?? ''
