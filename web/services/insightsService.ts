/**
 * Weekly insights service.
 * All calls to /api/weekly-insights go through here.
 */

import { apiUrl } from '@/lib/apiConfig';
import { WeeklyInsightsRequest, WeeklyInsight, ApiResponse } from '@/types';

/**
 * Generates a Gemini-powered weekly health summary.
 * Surfaces the backend's descriptive error messages including rate-limit text.
 */
export async function getWeeklyInsights(
  request: WeeklyInsightsRequest,
): Promise<WeeklyInsight> {
  const res = await fetch(apiUrl('/api/weekly-insights'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After');
      throw new Error(
        retryAfter
          ? `Too many requests. Please wait ${retryAfter}s before trying again.`
          : 'You can generate insights up to 5 times per minute.',
      );
    }
    try {
      const body = (await res.json()) as ApiResponse<unknown>;
      if (body.error) throw new Error(body.error);
    } catch (parseErr) {
      if (parseErr instanceof Error && parseErr.message !== 'body already used') {
        throw parseErr;
      }
    }
    throw new Error('Failed to generate insights');
  }

  const { data, error } = (await res.json()) as ApiResponse<WeeklyInsight>;

  if (error || !data) {
    throw new Error(error ?? 'Failed to generate insights');
  }

  return data;
}
