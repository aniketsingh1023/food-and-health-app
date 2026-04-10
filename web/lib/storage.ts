/**
 * localStorage persistence helpers.
 * All operations are safe (SSR-compatible, no throws).
 */

import { FoodLogEntry, HabitLog, DailyGoals } from '@/types';
import { getDefaultGoals } from './nutritionCalc';

const KEYS = {
  FOOD_LOG: 'fh_food_log',
  HABIT_LOGS: 'fh_habit_logs',
  GOALS: 'fh_goals',
  STREAK: 'fh_streak',
} as const;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function readItem<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage might be full — silently skip
  }
}

// ─── Food Log ─────────────────────────────────────────────────────────────────

/** Returns all food log entries. */
export function getFoodLog(): FoodLogEntry[] {
  return readItem<FoodLogEntry[]>(KEYS.FOOD_LOG, []);
}

/** Returns food log entries for a specific date (YYYY-MM-DD). */
export function getFoodLogForDate(date: string): FoodLogEntry[] {
  return getFoodLog().filter(e => e.loggedAt.startsWith(date));
}

/** Appends a new food log entry. */
export function addFoodLogEntry(entry: FoodLogEntry): void {
  const log = getFoodLog();
  writeItem(KEYS.FOOD_LOG, [...log, entry]);
}

/** Returns entries for the last N days. */
export function getRecentFoodLog(days: number): FoodLogEntry[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return getFoodLog().filter(e => new Date(e.loggedAt) >= cutoff);
}

// ─── Habit Logs ───────────────────────────────────────────────────────────────

/** Returns all habit logs. */
export function getHabitLogs(): HabitLog[] {
  return readItem<HabitLog[]>(KEYS.HABIT_LOGS, []);
}

/** Returns habit log for a specific date. */
export function getHabitLogForDate(date: string): HabitLog {
  return getHabitLogs().find(l => l.date === date) ?? { date, completed: [] };
}

/** Saves habit log for a date (upserts). */
export function saveHabitLog(log: HabitLog): void {
  const logs = getHabitLogs().filter(l => l.date !== log.date);
  writeItem(KEYS.HABIT_LOGS, [...logs, log]);
}

/** Returns habit logs for the last 7 days. */
export function getWeeklyHabitLogs(): HabitLog[] {
  const logs: HabitLog[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    logs.push(getHabitLogForDate(date));
  }
  return logs;
}

// ─── Goals ────────────────────────────────────────────────────────────────────

/** Returns user's daily goals. */
export function getDailyGoals(): DailyGoals {
  return readItem<DailyGoals>(KEYS.GOALS, getDefaultGoals());
}

/** Saves user's daily goals. */
export function saveDailyGoals(goals: DailyGoals): void {
  writeItem(KEYS.GOALS, goals);
}

// ─── Streak ───────────────────────────────────────────────────────────────────

/** Returns current streak count. */
export function getStreak(): number {
  return readItem<number>(KEYS.STREAK, 0);
}

/** Increments streak if today hasn't been counted. */
export function updateStreak(): number {
  const today = new Date().toISOString().slice(0, 10);
  const lastKey = 'fh_last_streak_date';
  const lastDate = isBrowser() ? localStorage.getItem(lastKey) : null;

  if (lastDate === today) return getStreak();

  const streak = getStreak() + 1;
  writeItem(KEYS.STREAK, streak);
  if (isBrowser()) localStorage.setItem(lastKey, today);
  return streak;
}
