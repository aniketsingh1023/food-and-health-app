/**
 * POST /api/suggest-meal
 * Returns an AI-generated meal suggestion based on remaining daily macros.
 */

import { NextRequest, NextResponse } from 'next/server';
import { suggestMeal } from '@/lib/gemini';
import { SuggestMealRequest, MealSuggestion, ApiResponse } from '@/types';
import { checkRateLimit, RATE_LIMITS, getClientIp } from '@/lib/rateLimiter';
import { logger } from '@/lib/logger';

const ROUTE = 'suggest-meal';
const VALID_TIMES = ['morning', 'afternoon', 'evening'];
const MAX_PREFERENCES_LENGTH = 200;

function isValidMacros(obj: unknown): obj is { calories: number; protein: number; carbs: number; fat: number; fiber: number } {
  if (typeof obj !== 'object' || obj === null) return false;
  const m = obj as Record<string, unknown>;
  return (
    typeof m.calories === 'number' &&
    typeof m.protein  === 'number' &&
    typeof m.carbs    === 'number' &&
    typeof m.fat      === 'number' &&
    typeof m.fiber    === 'number'
  );
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<MealSuggestion>>> {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ip = getClientIp(req);
  const rl = checkRateLimit(`${ROUTE}:${ip}`, RATE_LIMITS[ROUTE]);
  if (!rl.allowed) {
    logger.warn(ROUTE, 'Rate limit exceeded', { ip, retryAfterMs: rl.retryAfterMs });
    return NextResponse.json(
      { data: null, error: 'Too many requests. Please try again shortly.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) },
      },
    );
  }

  // ── Body parsing ───────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { consumed, goals, timeOfDay, preferences } = body as Partial<SuggestMealRequest>;

  // ── Input validation ───────────────────────────────────────────────────────
  if (!isValidMacros(consumed)) {
    return NextResponse.json(
      { data: null, error: 'consumed must be a Macros object with numeric calories, protein, carbs, fat, fiber' },
      { status: 400 },
    );
  }

  if (!isValidMacros(goals)) {
    return NextResponse.json(
      { data: null, error: 'goals must be a Macros object with numeric calories, protein, carbs, fat, fiber' },
      { status: 400 },
    );
  }

  if (!timeOfDay || typeof timeOfDay !== 'string' || !VALID_TIMES.includes(timeOfDay)) {
    return NextResponse.json(
      { data: null, error: 'timeOfDay must be morning | afternoon | evening' },
      { status: 400 },
    );
  }

  if (preferences !== undefined) {
    if (typeof preferences !== 'string') {
      return NextResponse.json(
        { data: null, error: 'preferences must be a string' },
        { status: 400 },
      );
    }
    if (preferences.length > MAX_PREFERENCES_LENGTH) {
      return NextResponse.json(
        { data: null, error: `preferences must be ${MAX_PREFERENCES_LENGTH} characters or fewer` },
        { status: 400 },
      );
    }
  }

  // ── Gemini call ────────────────────────────────────────────────────────────
  try {
    const suggestion = await suggestMeal(consumed, goals, timeOfDay, preferences);
    return NextResponse.json({ data: suggestion, error: null });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(ROUTE, error);
    return NextResponse.json({ data: null, error: 'Failed to generate meal suggestion' }, { status: 500 });
  }
}
