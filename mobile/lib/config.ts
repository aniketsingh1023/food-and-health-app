/**
 * Mobile app configuration.
 * Points to the Next.js backend (BFF) for all AI API calls.
 */

// In production, replace with your Cloud Run URL
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
