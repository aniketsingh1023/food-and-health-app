/**
 * Weekly insights service for mobile.
 * Mirrors web/services/insightsService.ts.
 */

import { apiUrl } from '../lib/config';
import type { WeeklyInsightsRequest, WeeklyInsight, ApiResponse } from '../types';

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
      if (parseErr instanceof Error && parseErr.message !== 'body already used') throw parseErr;
    }
    throw new Error('Failed to generate insights');
  }

  const { data, error } = (await res.json()) as ApiResponse<WeeklyInsight>;
  if (error || !data) throw new Error(error ?? 'Failed to generate insights');
  return data;
}
