/**
 * Pure functions for nutrition calculations.
 * Mirrors web/lib/nutritionCalc.ts
 */

import type { Macros, DailyGoals, FoodLogEntry } from '../types';

export function sumMacros(entries: FoodLogEntry[]): Macros {
  return entries.reduce<Macros>(
    (acc, entry) => ({
      calories: acc.calories + entry.analysis.macros.calories,
      protein: acc.protein + entry.analysis.macros.protein,
      carbs: acc.carbs + entry.analysis.macros.carbs,
      fat: acc.fat + entry.analysis.macros.fat,
      fiber: acc.fiber + entry.analysis.macros.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

export function progressPercent(value: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((value / goal) * 100));
}

export function remainingMacros(consumed: Macros, goals: DailyGoals): Macros {
  return {
    calories: Math.max(0, goals.calories - consumed.calories),
    protein: Math.max(0, goals.protein - consumed.protein),
    carbs: Math.max(0, goals.carbs - consumed.carbs),
    fat: Math.max(0, goals.fat - consumed.fat),
    fiber: Math.max(0, goals.fiber - consumed.fiber),
  };
}

export function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
