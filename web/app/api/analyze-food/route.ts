/**
 * POST /api/analyze-food
 * Analyzes a food description using Gemini and returns nutrition data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeFood } from '@/lib/gemini';
import { AnalyzeFoodRequest, FoodLogEntry, ApiResponse } from '@/types';
import { checkRateLimit, RATE_LIMITS, getClientIp } from '@/lib/rateLimiter';
import { logger } from '@/lib/logger';
import { randomUUID } from 'crypto';

const ROUTE = 'analyze-food';
const MAX_DESCRIPTION_LENGTH = 500;

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<FoodLogEntry>>> {
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

  const { description, mealType } = body as Partial<AnalyzeFoodRequest>;

  // ── Input validation ───────────────────────────────────────────────────────
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return NextResponse.json({ data: null, error: 'description is required' }, { status: 400 });
  }

  if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
    return NextResponse.json(
      { data: null, error: `description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer` },
      { status: 400 },
    );
  }

  if (!mealType || !['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType)) {
    return NextResponse.json(
      { data: null, error: 'mealType must be breakfast | lunch | dinner | snack' },
      { status: 400 },
    );
  }

  // ── Gemini call ────────────────────────────────────────────────────────────
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
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(ROUTE, error);
    return NextResponse.json({ data: null, error: 'Failed to analyze food' }, { status: 500 });
  }
}
