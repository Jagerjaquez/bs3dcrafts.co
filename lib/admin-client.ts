const CSRF_KEY = 'adminCsrfToken'

export function setAdminCsrfToken(token: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(CSRF_KEY, token)
}

export function getAdminCsrfToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(CSRF_KEY)
}

export function adminJsonHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const t = getAdminCsrfToken()
  if (t) headers['x-csrf-token'] = t
  return headers
}

/** For FormData uploads — do not set Content-Type */
export function adminMultipartHeaders(): HeadersInit {
  const t = getAdminCsrfToken()
  return t ? { 'x-csrf-token': t } : {}
}
