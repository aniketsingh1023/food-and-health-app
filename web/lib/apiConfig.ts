/**
 * API base URL configuration.
 * - Dev: http://localhost:3000
 * - Prod: NEXT_PUBLIC_APP_URL env variable (set to your GCP VM IP/domain)
 *
 * Using an absolute URL ensures API routes work when called from
 * server components, the mobile app, or external clients.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

/**
 * Builds a full API URL from a path.
 * @example apiUrl('/api/analyze-food') → 'https://yourdomain.com/api/analyze-food'
 */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
