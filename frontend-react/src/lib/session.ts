const TOKEN_KEY = 'token'
const USER_KEY = 'travelms_user'

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveSession(token: string, user: unknown) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  // Cleans up the short-lived key written by the prior React prototype.
  localStorage.removeItem('travelms_token')
}
