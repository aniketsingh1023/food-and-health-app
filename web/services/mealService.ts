/**
 * Meal suggestion service.
 * All calls to /api/suggest-meal go through here.
 */

import { apiUrl } from '@/lib/apiConfig';
import { SuggestMealRequest, MealSuggestion, ApiResponse } from '@/types';

/**
 * Fetches an AI-generated meal suggestion based on remaining macros.
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
    throw new Error(`Server error: ${res.status}`);
  }

  const { data, error } = (await res.json()) as ApiResponse<MealSuggestion>;

  if (error || !data) {
    throw new Error(error ?? 'Failed to get meal suggestion');
  }

  return data;
}
