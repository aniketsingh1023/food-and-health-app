/**
 * POST /api/weekly-insights
 * Generates a Gemini-powered weekly health summary.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyInsights } from '@/lib/gemini';
import { WeeklyInsightsRequest, WeeklyInsight, ApiResponse, FoodLogEntry, HabitLog, DailyGoals } from '@/types';
import { checkRateLimit, RATE_LIMITS, getClientIp } from '@/lib/rateLimiter';
import { logger } from '@/lib/logger';

const ROUTE = 'weekly-insights';

function isValidGoals(obj: unknown): obj is DailyGoals {
  if (typeof obj !== 'object' || obj === null) return false;
  const g = obj as Record<string, unknown>;
  return (
    typeof g.calories === 'number' &&
    typeof g.protein  === 'number' &&
    typeof g.carbs    === 'number' &&
    typeof g.fat      === 'number' &&
    typeof g.fiber    === 'number'
  );
}

function isValidFoodLogEntry(entry: unknown): entry is FoodLogEntry {
  if (typeof entry !== 'object' || entry === null) return false;
  const e = entry as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.description === 'string' &&
    typeof e.loggedAt === 'string' &&
    typeof e.mealType === 'string' &&
    typeof e.analysis === 'object' &&
    e.analysis !== null &&
    typeof (e.analysis as Record<string, unknown>).macros === 'object'
  );
}

function isValidHabitLog(log: unknown): log is HabitLog {
  if (typeof log !== 'object' || log === null) return false;
  const l = log as Record<string, unknown>;
  return typeof l.date === 'string' && Array.isArray(l.completed);
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<WeeklyInsight>>> {
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

  const { weeklyLogs, habitLogs, goals } = body as Partial<WeeklyInsightsRequest>;

  // ── Input validation ───────────────────────────────────────────────────────
  if (!Array.isArray(weeklyLogs) || !weeklyLogs.every(isValidFoodLogEntry)) {
    return NextResponse.json(
      { data: null, error: 'weeklyLogs must be an array of FoodLogEntry objects' },
      { status: 400 },
    );
  }

  if (!Array.isArray(habitLogs) || !habitLogs.every(isValidHabitLog)) {
    return NextResponse.json(
      { data: null, error: 'habitLogs must be an array of HabitLog objects' },
      { status: 400 },
    );
  }

  if (!isValidGoals(goals)) {
    return NextResponse.json(
      { data: null, error: 'goals must include numeric calories, protein, carbs, fat, fiber' },
      { status: 400 },
    );
  }

  // ── Gemini call ────────────────────────────────────────────────────────────
  try {
    const insights = await generateWeeklyInsights(weeklyLogs, habitLogs, goals);
    return NextResponse.json({ data: insights, error: null });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(ROUTE, error);
    return NextResponse.json({ data: null, error: 'Failed to generate weekly insights' }, { status: 500 });
  }
}
