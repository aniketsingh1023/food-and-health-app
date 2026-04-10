/**
 * Custom hook that aggregates daily nutrition stats.
 */

'use client';

import { useMemo } from 'react';
import { DailyStats, FoodLogEntry, DailyGoals } from '@/types';
import { sumMacros, progressPercent, getDefaultGoals } from '@/lib/nutritionCalc';
import { getDailyGoals, getStreak } from '@/lib/storage';

interface UseDailyStatsReturn {
  stats: DailyStats;
  caloriePercent: number;
  proteinPercent: number;
  carbsPercent: number;
  fiberPercent: number;
}

/**
 * Computes today's nutrition stats from food log entries.
 * Memoized for performance — only recalculates when entries change.
 */
export function useDailyStats(entries: FoodLogEntry[]): UseDailyStatsReturn {
  const goals: DailyGoals = getDailyGoals();
  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo<DailyStats>(() => ({
    date: today,
    consumed: sumMacros(entries),
    goals,
    streak: getStreak(),
    entries,
  }), [entries, goals, today]);

  const caloriePercent = progressPercent(stats.consumed.calories, goals.calories);
  const proteinPercent = progressPercent(stats.consumed.protein, goals.protein);
  const carbsPercent = progressPercent(stats.consumed.carbs, goals.carbs);
  const fiberPercent = progressPercent(stats.consumed.fiber, goals.fiber);

  return { stats, caloriePercent, proteinPercent, carbsPercent, fiberPercent };
}
