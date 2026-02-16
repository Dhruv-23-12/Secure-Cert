// API base URL configuration
// In development: Vite proxy handles /api → localhost:5000
// In production: VITE_API_URL points to the deployed backend
const raw = import.meta.env.VITE_API_URL || '';
const API_BASE_URL = raw.replace(/\/+$/, ''); // strip trailing slashes

/**
 * Build a full API URL from a relative path.
 * @param {string} path - e.g. '/api/cert/verify'
 * @returns {string} Full URL in production, relative path in development
 */
export function apiUrl(path) {
    return `${API_BASE_URL}${path}`;
}

export default API_BASE_URL;
