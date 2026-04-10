/**
 * Food analysis service for mobile — mirrors the web service.
 */

import { apiUrl } from '../lib/config';
import type { FoodLogEntry, MealType } from '../types';

export async function analyzeFood(description: string, mealType: MealType): Promise<FoodLogEntry> {
  const res = await fetch(apiUrl('/api/analyze-food'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, mealType }),
  });

  if (!res.ok) throw new Error(`Server error: ${res.status}`);

  const { data, error } = await res.json() as { data: FoodLogEntry | null; error: string | null };
  if (error || !data) throw new Error(error ?? 'Failed to analyse food');

  return data;
}
