/**
 * Relative API paths only (no base URL). Vite proxy forwards /api to backend.
 * @param {string} path - Path starting with / (e.g. '/api/health')
 * @returns {string} The same path (relative)
 */
export function apiUrl(path) {
  return path
}
