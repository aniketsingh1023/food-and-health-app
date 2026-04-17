'use client';

import { useState, useEffect, useCallback } from 'react';
import { FoodLogEntry, MealType } from '@/types';
import { getFoodLogForDate, addFoodLogEntry, removeFoodLogEntry, updateStreak } from '@/lib/storage';
import { analyzeFood } from '@/services/foodService';

interface LogFoodParams {
  description: string;
  mealType: MealType;
}

interface UseFoodLogReturn {
  entries: FoodLogEntry[];
  isLogging: boolean;
  error: string | null;
  logFood: (params: LogFoodParams) => Promise<FoodLogEntry | null>;
  removeEntry: (id: string) => void;
  refresh: () => void;
}

export function useFoodLog(): UseFoodLogReturn {
  const today = new Date().toISOString().slice(0, 10);
  const [entries, setEntries] = useState<FoodLogEntry[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setEntries(getFoodLogForDate(today));
  }, [today]);

  useEffect(() => { refresh(); }, [refresh]);

  const logFood = useCallback(async ({ description, mealType }: LogFoodParams): Promise<FoodLogEntry | null> => {
    setIsLogging(true);
    setError(null);
    try {
      const entry = await analyzeFood({ description, mealType });
      addFoodLogEntry(entry);
      updateStreak();
      refresh();
      return entry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setIsLogging(false);
    }
  }, [refresh]);

  const removeEntry = useCallback((id: string) => {
    removeFoodLogEntry(id);
    refresh();
  }, [refresh]);

  return { entries, isLogging, error, logFood, removeEntry, refresh };
}
