/**
 * Food analysis service.
 * All calls to /api/analyze-food go through here.
 */

import { apiUrl } from '@/lib/apiConfig';
import { AnalyzeFoodRequest, FoodLogEntry, ApiResponse } from '@/types';

/**
 * Extracts the error message from a non-ok API response.
 * Tries to parse ApiResponse<T>.error first; falls back to status text.
 */
async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as ApiResponse<unknown>;
    if (body.error) return body.error;
  } catch {
    // Body not JSON — fall through
  }
  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After');
    return retryAfter
      ? `Too many requests. Please wait ${retryAfter}s before trying again.`
      : 'Too many requests. Please slow down and try again.';
  }
  return fallback;
}

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
    throw new Error(await extractErrorMessage(res, 'Failed to analyse food'));
  }

  const { data, error } = (await res.json()) as ApiResponse<FoodLogEntry>;

  if (error || !data) {
    throw new Error(error ?? 'Failed to analyse food');
  }

  return data;
}
