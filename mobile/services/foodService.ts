/**
 * Food analysis service for mobile — mirrors web/services/foodService.ts.
 */

import { apiUrl } from '../lib/config';
import type { FoodLogEntry, MealType, ApiResponse } from '../types';

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After');
    return retryAfter
      ? `Too many requests. Please wait ${retryAfter}s before trying again.`
      : 'Too many requests. Please slow down.';
  }
  try {
    const body = (await res.json()) as ApiResponse<unknown>;
    if (body.error) return body.error;
  } catch {
    // not JSON — fall through
  }
  return fallback;
}

export async function analyzeFood(description: string, mealType: MealType): Promise<FoodLogEntry> {
  const res = await fetch(apiUrl('/api/analyze-food'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, mealType }),
  });

  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Failed to analyse food'));
  }

  const { data, error } = (await res.json()) as ApiResponse<FoodLogEntry>;
  if (error || !data) throw new Error(error ?? 'Failed to analyse food');
  return data;
}
