const rawApiUrl = import.meta.env.VITE_API_URL || '';

const normalizedApiUrl = rawApiUrl.endsWith('/')
  ? rawApiUrl.slice(0, -1)
  : rawApiUrl;

export const API_BASE_URL = normalizedApiUrl;

export function apiUrl(path) {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_BASE_URL) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseEndsWithApi = /\/api$/i.test(API_BASE_URL);
  const pathStartsWithApi = /^\/api(\/|$)/i.test(normalizedPath);
  const joinedPath = baseEndsWithApi && pathStartsWithApi
    ? normalizedPath.replace(/^\/api/i, '')
    : normalizedPath;

  return `${API_BASE_URL}${joinedPath}`;
}
