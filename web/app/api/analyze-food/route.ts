/**
 * POST /api/analyze-food
 * Analyzes a food description using Gemini and returns nutrition data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeFood } from '@/lib/gemini';
import { AnalyzeFoodRequest, FoodLogEntry, ApiResponse } from '@/types';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<FoodLogEntry>>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { description, mealType } = body as Partial<AnalyzeFoodRequest>;

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return NextResponse.json({ data: null, error: 'description is required' }, { status: 400 });
  }

  if (!mealType || !['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType)) {
    return NextResponse.json({ data: null, error: 'mealType must be breakfast | lunch | dinner | snack' }, { status: 400 });
  }

  try {
    const analysis = await analyzeFood(description.trim());

    const entry: FoodLogEntry = {
      id: randomUUID(),
      description: description.trim(),
      analysis,
      loggedAt: new Date().toISOString(),
      mealType,
    };

    return NextResponse.json({ data: entry, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to analyze food';
    console.error('[analyze-food]', message);
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
