/**
 * Single source for backend API base URL.
 * When unset, use empty string so requests are relative (e.g. /api/...) and Vite proxy can forward to backend.
 * When set (e.g. Codespaces), use that URL; non-http(s) values get https:// prepended.
 */
const raw = import.meta.env.VITE_API_URL ?? ''
export const baseUrl = raw && !/^https?:\/\//i.test(raw) ? 'https://' + raw : raw

/**
 * @param {string} path - Path starting with / (e.g. '/api/health')
 * @returns {string} Full URL or relative path
 */
export function apiUrl(path) {
  return baseUrl ? `${baseUrl}${path}` : path
}
