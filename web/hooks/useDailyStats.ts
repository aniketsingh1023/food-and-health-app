/**
 * Custom hook that aggregates daily nutrition stats.
 * Goals are read reactively so changes on the Goals page reflect immediately.
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { DailyStats, FoodLogEntry, DailyGoals } from '@/types';
import { sumMacros, progressPercent } from '@/lib/nutritionCalc';
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
 * Goals are loaded fresh from storage and kept reactive via a storage event listener.
 */
export function useDailyStats(entries: FoodLogEntry[]): UseDailyStatsReturn {
  const today = new Date().toISOString().slice(0, 10);
  const [goals, setGoals] = useState<DailyGoals>(getDailyGoals);
  const [streak, setStreak] = useState<number>(getStreak);

  // Re-read goals/streak whenever localStorage changes (e.g. Goals page saves)
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'fh_goals') setGoals(getDailyGoals());
      if (e.key === 'fh_streak') setStreak(getStreak());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Also refresh on focus (same-tab navigation back from Goals page)
  useEffect(() => {
    function onFocus() {
      setGoals(getDailyGoals());
      setStreak(getStreak());
    }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const stats = useMemo<DailyStats>(() => ({
    date: today,
    consumed: sumMacros(entries),
    goals,
    streak,
    entries,
  }), [entries, goals, streak, today]);

  const caloriePercent = progressPercent(stats.consumed.calories, goals.calories);
  const proteinPercent = progressPercent(stats.consumed.protein, goals.protein);
  const carbsPercent   = progressPercent(stats.consumed.carbs,   goals.carbs);
  const fiberPercent   = progressPercent(stats.consumed.fiber,   goals.fiber);

  return { stats, caloriePercent, proteinPercent, carbsPercent, fiberPercent };
}
