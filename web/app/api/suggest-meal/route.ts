/**
 * POST /api/suggest-meal
 * Returns an AI-generated meal suggestion based on remaining daily macros.
 */

import { NextRequest, NextResponse } from 'next/server';
import { suggestMeal } from '@/lib/gemini';
import { SuggestMealRequest, MealSuggestion, ApiResponse } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<MealSuggestion>>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { consumed, goals, timeOfDay, preferences } = body as Partial<SuggestMealRequest>;

  if (!consumed || !goals || !timeOfDay) {
    return NextResponse.json(
      { data: null, error: 'consumed, goals, and timeOfDay are required' },
      { status: 400 },
    );
  }

  try {
    const suggestion = await suggestMeal(consumed, goals, timeOfDay, preferences);
    return NextResponse.json({ data: suggestion, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate meal suggestion';
    console.error('[suggest-meal]', message);
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
