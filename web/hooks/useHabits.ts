/**
 * Custom hook for managing daily habit state with localStorage persistence.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Habit, HabitId, WeeklyHabitStats } from '@/types';
import { getHabitLogForDate, saveHabitLog, getWeeklyHabitLogs } from '@/lib/storage';

const DEFAULT_HABITS: Habit[] = [
  { id: 'hydration', label: 'Drink 8 glasses of water', emoji: '💧', target: '8 glasses', completed: false },
  { id: 'breakfast', label: 'Eat breakfast', emoji: '🌅', target: 'Before 10am', completed: false },
  { id: 'fruits', label: 'Eat 2+ fruits or veggies', emoji: '🍎', target: '2 servings', completed: false },
  { id: 'steps', label: 'Walk 7,500 steps', emoji: '👟', target: '7,500 steps', completed: false },
  { id: 'sleep', label: 'Sleep 7–8 hours', emoji: '😴', target: '7-8 hours', completed: false },
];

interface UseHabitsReturn {
  habits: Habit[];
  toggleHabit: (id: HabitId) => void;
  completedCount: number;
  weeklyStats: WeeklyHabitStats[];
  today: string;
}

/**
 * Manages habit state for the current day.
 * Persists to localStorage and computes weekly statistics.
 */
export function useHabits(): UseHabitsReturn {
  const today = new Date().toISOString().slice(0, 10);
  const [completedIds, setCompletedIds] = useState<HabitId[]>([]);

  useEffect(() => {
    const log = getHabitLogForDate(today);
    setCompletedIds(log.completed);
  }, [today]);

  const toggleHabit = useCallback((id: HabitId) => {
    setCompletedIds(prev => {
      const next = prev.includes(id)
        ? prev.filter(h => h !== id)
        : [...prev, id];
      saveHabitLog({ date: today, completed: next });
      return next;
    });
  }, [today]);

  const habits: Habit[] = DEFAULT_HABITS.map(h => ({
    ...h,
    completed: completedIds.includes(h.id),
  }));

  const weeklyLogs = getWeeklyHabitLogs();
  const weeklyStats: WeeklyHabitStats[] = DEFAULT_HABITS.map(habit => {
    const trend = weeklyLogs.map(log => log.completed.includes(habit.id) ? 1 : 0);
    return {
      habitId: habit.id,
      label: habit.label,
      completedDays: trend.reduce<number>((a, b) => a + b, 0),
      trend,
    };
  });

  return {
    habits,
    toggleHabit,
    completedCount: completedIds.length,
    weeklyStats,
    today,
  };
}
