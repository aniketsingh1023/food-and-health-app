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

  if (!res.ok) throw new Error(`Server error: ${res.status}`);

  const { data, error } = (await res.json()) as ApiResponse<WeeklyInsight>;
  if (error || !data) throw new Error(error ?? 'Failed to generate insights');
  return data;
}
