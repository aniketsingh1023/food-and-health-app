/**
 * Weekly insights service.
 * All calls to /api/weekly-insights go through here.
 */

import { apiUrl } from '@/lib/apiConfig';
import { WeeklyInsightsRequest, WeeklyInsight, ApiResponse } from '@/types';

/**
 * Generates a Gemini-powered weekly health summary.
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
    throw new Error(`Server error: ${res.status}`);
  }

  const { data, error } = (await res.json()) as ApiResponse<WeeklyInsight>;

  if (error || !data) {
    throw new Error(error ?? 'Failed to generate insights');
  }

  return data;
}
