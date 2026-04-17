/**
 * Meal suggestion service.
 * All calls to /api/suggest-meal go through here.
 */

import { apiUrl } from '@/lib/apiConfig';
import { SuggestMealRequest, MealSuggestion, ApiResponse } from '@/types';

/**
 * Fetches an AI-generated meal suggestion based on remaining macros.
 * Surfaces the backend's descriptive error messages including rate-limit text.
 */
export async function suggestMeal(
  request: SuggestMealRequest,
): Promise<MealSuggestion> {
  const res = await fetch(apiUrl('/api/suggest-meal'), {
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
          : 'Too many requests. Please slow down.',
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
    throw new Error('Failed to get meal suggestion');
  }

  const { data, error } = (await res.json()) as ApiResponse<MealSuggestion>;

  if (error || !data) {
    throw new Error(error ?? 'Failed to get meal suggestion');
  }

  return data;
}
