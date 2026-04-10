/**
 * Pure functions for nutrition calculations.
 * No side effects — fully testable.
 */

import { Macros, DailyGoals, FoodLogEntry } from '@/types';

/**
 * Sums macros from an array of food log entries.
 */
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

/**
 * Calculates percentage of goal achieved, capped at 100.
 */
export function progressPercent(value: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((value / goal) * 100));
}

/**
 * Returns remaining macros (floored at 0).
 */
export function remainingMacros(consumed: Macros, goals: DailyGoals): Macros {
  return {
    calories: Math.max(0, goals.calories - consumed.calories),
    protein: Math.max(0, goals.protein - consumed.protein),
    carbs: Math.max(0, goals.carbs - consumed.carbs),
    fat: Math.max(0, goals.fat - consumed.fat),
    fiber: Math.max(0, goals.fiber - consumed.fiber),
  };
}

/**
 * Calculates estimated calories from macros using Atwater factors.
 * Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
 */
export function estimateCaloriesFromMacros(
  protein: number,
  carbs: number,
  fat: number,
): number {
  return Math.round(protein * 4 + carbs * 4 + fat * 9);
}

/**
 * Returns a color class based on progress percentage.
 * Under 50%: amber, 50-90%: mint, 90-100%: green, over 100%: coral
 */
export function progressColor(percent: number): string {
  if (percent > 100) return '#FF6B6B';
  if (percent >= 90) return '#00B894';
  if (percent >= 50) return '#A8E6CF';
  return '#FDCB6E';
}

/**
 * Returns the default daily goals based on a standard 2000 kcal diet.
 */
export function getDefaultGoals(): DailyGoals {
  return {
    calories: 2000,
    protein: 50,
    carbs: 250,
    fat: 65,
    fiber: 25,
  };
}

/**
 * Calculates a health score (1–10) based on macro balance.
 * Penalizes excess calories and rewards adequate protein and fiber.
 */
export function calculateDayHealthScore(consumed: Macros, goals: DailyGoals): number {
  const calorieRatio = consumed.calories / goals.calories;
  const proteinRatio = consumed.protein / goals.protein;
  const fiberRatio = consumed.fiber / goals.fiber;

  let score = 7; // baseline

  // Penalize if calories are more than 20% over goal
  if (calorieRatio > 1.2) score -= 2;
  else if (calorieRatio > 1.1) score -= 1;

  // Reward hitting protein goal
  if (proteinRatio >= 0.9) score += 1;
  else if (proteinRatio < 0.5) score -= 1;

  // Reward hitting fiber goal
  if (fiberRatio >= 0.9) score += 1;
  else if (fiberRatio < 0.4) score -= 1;

  return Math.max(1, Math.min(10, score));
}

/**
 * Returns current time period as a human-readable string.
 */
export function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/**
 * Formats a macro value for display (rounds to 1 decimal for grams).
 */
export function formatMacro(value: number, unit: 'kcal' | 'g'): string {
  if (unit === 'kcal') return Math.round(value).toString();
  return value % 1 === 0 ? value.toString() : value.toFixed(1);
}
