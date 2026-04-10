/**
 * API base URL — empty string means relative URLs (/api/...).
 * Works in the browser on any host (Cloud Run, custom domain, localhost).
 * Override with NEXT_PUBLIC_APP_URL only if you need cross-origin API calls
 * (e.g. from the mobile app).
 */
export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
