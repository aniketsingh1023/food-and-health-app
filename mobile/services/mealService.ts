/**
 * Meal suggestion service for mobile.
 * Mirrors web/services/mealService.ts.
 */

import { apiUrl } from '../lib/config';
import type { SuggestMealRequest, MealSuggestion, ApiResponse } from '../types';

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
      if (parseErr instanceof Error && parseErr.message !== 'body already used') throw parseErr;
    }
    throw new Error('Failed to get meal suggestion');
  }

  const { data, error } = (await res.json()) as ApiResponse<MealSuggestion>;
  if (error || !data) throw new Error(error ?? 'Failed to get meal suggestion');
  return data;
}
