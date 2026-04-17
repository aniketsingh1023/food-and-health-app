/**
 * AsyncStorage persistence helpers for React Native.
 * Mirrors web/lib/storage.ts — all operations are async and safe (no throws).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  FoodLogEntry,
  HabitLog,
  DailyGoals,
  ChatMessage,
  WeeklyInsight,
} from '../types';

export const STORAGE_KEYS = {
  FOOD_LOG: 'fh_food_log',
  HABIT_LOGS: 'fh_habit_logs',
  GOALS: 'fh_goals',
  STREAK: 'fh_streak',
  STREAK_DATE: 'fh_last_streak_date',
  CHAT_HISTORY: 'fh_chat_history',
  LAST_INSIGHT: 'fh_last_insight',
} as const;

export const DEFAULT_GOALS: DailyGoals = {
  calories: 2000,
  protein: 50,
  carbs: 250,
  fat: 65,
  fiber: 25,
};

async function readItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage might be full or unavailable — silently skip
  }
}

// ─── Food Log ────────────────────────────────────────────────────────────────

export async function getFoodLog(): Promise<FoodLogEntry[]> {
  return readItem<FoodLogEntry[]>(STORAGE_KEYS.FOOD_LOG, []);
}

export async function getFoodLogForDate(date: string): Promise<FoodLogEntry[]> {
  const log = await getFoodLog();
  return log.filter(e => e.loggedAt.startsWith(date));
}

export async function addFoodLogEntry(entry: FoodLogEntry): Promise<void> {
  const log = await getFoodLog();
  await writeItem(STORAGE_KEYS.FOOD_LOG, [...log, entry]);
}

export async function removeFoodLogEntry(id: string): Promise<void> {
  const log = await getFoodLog();
  await writeItem(STORAGE_KEYS.FOOD_LOG, log.filter(e => e.id !== id));
}

export async function getRecentFoodLog(days: number): Promise<FoodLogEntry[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const log = await getFoodLog();
  return log.filter(e => new Date(e.loggedAt) >= cutoff);
}

// ─── Habit Logs ──────────────────────────────────────────────────────────────

export async function getHabitLogs(): Promise<HabitLog[]> {
  return readItem<HabitLog[]>(STORAGE_KEYS.HABIT_LOGS, []);
}

export async function getHabitLogForDate(date: string): Promise<HabitLog> {
  const logs = await getHabitLogs();
  return logs.find(l => l.date === date) ?? { date, completed: [] };
}

export async function saveHabitLog(log: HabitLog): Promise<void> {
  const logs = await getHabitLogs();
  const filtered = logs.filter(l => l.date !== log.date);
  await writeItem(STORAGE_KEYS.HABIT_LOGS, [...filtered, log]);
}

export async function getWeeklyHabitLogs(): Promise<HabitLog[]> {
  const logs: HabitLog[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const log = await getHabitLogForDate(date);
    logs.push(log);
  }
  return logs;
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export async function getDailyGoals(): Promise<DailyGoals> {
  return readItem<DailyGoals>(STORAGE_KEYS.GOALS, DEFAULT_GOALS);
}

export async function saveDailyGoals(goals: DailyGoals): Promise<void> {
  await writeItem(STORAGE_KEYS.GOALS, goals);
}

// ─── Streak ──────────────────────────────────────────────────────────────────

export async function getStreak(): Promise<number> {
  return readItem<number>(STORAGE_KEYS.STREAK, 0);
}

/**
 * Updates streak based on today's date.
 * - Same day: no change (idempotent).
 * - Consecutive day: increments streak.
 * - Gap of 2+ days: resets streak to 1.
 */
export async function updateStreak(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_DATE);

  if (lastDate === today) return getStreak();

  let newStreak = 1;
  if (lastDate) {
    const last = new Date(lastDate);
    const curr = new Date(today);
    const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      const current = await getStreak();
      newStreak = current + 1;
    }
    // diffDays >= 2 → reset to 1 (already set above)
  }

  await writeItem(STORAGE_KEYS.STREAK, newStreak);
  await AsyncStorage.setItem(STORAGE_KEYS.STREAK_DATE, today);
  return newStreak;
}

// ─── Chat History ─────────────────────────────────────────────────────────────

export async function getChatHistory(): Promise<ChatMessage[]> {
  return readItem<ChatMessage[]>(STORAGE_KEYS.CHAT_HISTORY, []);
}

export async function saveChatHistory(messages: ChatMessage[]): Promise<void> {
  // Keep only the last 100 messages to avoid storage bloat
  await writeItem(STORAGE_KEYS.CHAT_HISTORY, messages.slice(-100));
}

export async function clearChatHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
}

// ─── Weekly Insight ───────────────────────────────────────────────────────────

export interface PersistedInsight {
  insight: WeeklyInsight;
  generatedAt: string;
}

export async function getLastInsight(): Promise<PersistedInsight | null> {
  return readItem<PersistedInsight | null>(STORAGE_KEYS.LAST_INSIGHT, null);
}

export async function saveLastInsight(insight: WeeklyInsight): Promise<void> {
  await writeItem(STORAGE_KEYS.LAST_INSIGHT, {
    insight,
    generatedAt: new Date().toISOString(),
  });
}
