/**
 * localStorage persistence helpers.
 * All operations are safe (SSR-compatible, no throws).
 */

import { FoodLogEntry, HabitLog, DailyGoals, ChatMessage, WeeklyInsight } from '@/types';
import { getDefaultGoals } from './nutritionCalc';

const KEYS = {
  FOOD_LOG:      'fh_food_log',
  HABIT_LOGS:    'fh_habit_logs',
  GOALS:         'fh_goals',
  STREAK:        'fh_streak',
  STREAK_DATE:   'fh_last_streak_date',
  CHAT_HISTORY:  'fh_chat_history',
  LAST_INSIGHT:  'fh_last_insight',
  INSIGHT_DATE:  'fh_insight_date',
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

/** Removes a food log entry by ID. */
export function removeFoodLogEntry(id: string): void {
  const log = getFoodLog().filter(e => e.id !== id);
  writeItem(KEYS.FOOD_LOG, log);
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

/**
 * Updates streak based on today's date.
 * - Same day: no change (idempotent).
 * - Consecutive day: increments streak.
 * - Gap of 2+ days: resets streak to 1.
 */
export function updateStreak(): number {
  if (!isBrowser()) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = localStorage.getItem(KEYS.STREAK_DATE);

  if (lastDate === today) return getStreak();

  let newStreak = 1;
  if (lastDate) {
    const last = new Date(lastDate);
    const curr = new Date(today);
    const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      newStreak = getStreak() + 1;
    }
    // diffDays >= 2 → reset to 1 (already set above)
  }

  writeItem(KEYS.STREAK, newStreak);
  localStorage.setItem(KEYS.STREAK_DATE, today);
  return newStreak;
}

// ─── Chat History ─────────────────────────────────────────────────────────────

/** Returns persisted chat messages. */
export function getChatHistory(): ChatMessage[] {
  return readItem<ChatMessage[]>(KEYS.CHAT_HISTORY, []);
}

/** Saves chat messages to localStorage. */
export function saveChatHistory(messages: ChatMessage[]): void {
  // Keep only the last 100 messages to avoid storage bloat
  writeItem(KEYS.CHAT_HISTORY, messages.slice(-100));
}

/** Clears the chat history. */
export function clearChatHistory(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(KEYS.CHAT_HISTORY);
}

// ─── Weekly Insight ──────────────────────────────────────────────────────────

export interface PersistedInsight {
  insight: WeeklyInsight;
  generatedAt: string; // ISO date string
}

/** Returns the last generated weekly insight. */
export function getLastInsight(): PersistedInsight | null {
  return readItem<PersistedInsight | null>(KEYS.LAST_INSIGHT, null);
}

/** Saves the generated weekly insight with timestamp. */
export function saveLastInsight(insight: WeeklyInsight): void {
  writeItem(KEYS.LAST_INSIGHT, {
    insight,
    generatedAt: new Date().toISOString(),
  });
}
