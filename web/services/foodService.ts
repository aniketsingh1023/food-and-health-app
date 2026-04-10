/**
 * Food analysis service.
 * All calls to /api/analyze-food go through here.
 */

import { apiUrl } from '@/lib/apiConfig';
import { AnalyzeFoodRequest, FoodLogEntry, ApiResponse } from '@/types';

/**
 * Sends a meal description to the AI analysis API.
 * Returns a typed FoodLogEntry or throws with a descriptive message.
 */
export async function analyzeFood(
  request: AnalyzeFoodRequest,
): Promise<FoodLogEntry> {
  const res = await fetch(apiUrl('/api/analyze-food'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
  }

  const { data, error } = (await res.json()) as ApiResponse<FoodLogEntry>;

  if (error || !data) {
    throw new Error(error ?? 'Failed to analyse food');
  }

  return data;
}
