/**
 * API configuration for the mobile app.
 * Set EXPO_PUBLIC_API_URL to your GCP VM IP/domain in production.
 */

export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
