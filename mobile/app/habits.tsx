/**
 * Habits screen — 5 daily habits with persistence via AsyncStorage.
 * Habits reset each day; shows completion progress and haptic feedback.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useToast } from '../components/Toast';
import {
  getHabitLogForDate,
  saveHabitLog,
  getWeeklyHabitLogs,
} from '../lib/storage';
import type { Habit, HabitId, HabitLog, WeeklyHabitStats } from '../types';

const DEFAULT_HABITS: Omit<Habit, 'completed'>[] = [
  { id: 'hydration', label: 'Drink 8 glasses of water', emoji: '💧', target: '8 glasses' },
  { id: 'breakfast', label: 'Eat breakfast',            emoji: '🌅', target: 'Before 10am' },
  { id: 'fruits',    label: 'Eat 2+ fruits or veggies', emoji: '🍎', target: '2 servings' },
  { id: 'steps',     label: 'Walk 7,500 steps',         emoji: '👟', target: '7,500 steps' },
  { id: 'sleep',     label: 'Sleep 7–8 hours',          emoji: '😴', target: '7-8 hours' },
];

function buildHabits(completedIds: HabitId[]): Habit[] {
  return DEFAULT_HABITS.map(h => ({ ...h, completed: completedIds.includes(h.id) }));
}

function buildWeeklyStats(weeklyLogs: HabitLog[]): WeeklyHabitStats[] {
  return DEFAULT_HABITS.map(habit => {
    const trend = weeklyLogs.map(log =>
      log.completed.includes(habit.id) ? 1 : 0
    );
    return {
      habitId: habit.id,
      label: habit.label,
      completedDays: trend.reduce<number>((a, b) => a + b, 0),
      trend,
    };
  });
}

export default function HabitsScreen() {
  const today = new Date().toISOString().slice(0, 10);
  const [completedIds, setCompletedIds] = useState<HabitId[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyHabitStats[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast, ToastView } = useToast();

  const habits = buildHabits(completedIds);
  const completedCount = completedIds.length;

  const loadData = useCallback(async () => {
    const [log, weeklyLogs] = await Promise.all([
      getHabitLogForDate(today),
      getWeeklyHabitLogs(),
    ]);
    setCompletedIds(log.completed);
    setWeeklyStats(buildWeeklyStats(weeklyLogs));
    setRefreshing(false);
  }, [today]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const toggleHabit = useCallback(async (id: HabitId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const isCompleting = !completedIds.includes(id);

    setCompletedIds(prev => {
      const next = isCompleting
        ? [...prev, id]
        : prev.filter(h => h !== id);
      saveHabitLog({ date: today, completed: next });
      return next;
    });

    if (isCompleting) {
      const habit = DEFAULT_HABITS.find(h => h.id === id);
      showToast(`${habit?.emoji ?? ''} ${habit?.label ?? 'Habit'} completed!`, 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [completedIds, today, showToast]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#16a34a"
            colors={['#16a34a']}
          />
        }
      >
        {/* Progress card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionLabel}>Daily Habits</Text>
            <Text style={styles.progressCount}>
              {completedCount} / {DEFAULT_HABITS.length}
            </Text>
          </View>
          <View
            style={styles.progressTrack}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: DEFAULT_HABITS.length, now: completedCount }}
            accessibilityLabel={`${completedCount} of ${DEFAULT_HABITS.length} habits completed`}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(completedCount / DEFAULT_HABITS.length) * 100}%` as unknown as number,
                },
              ]}
            />
          </View>
          {completedCount === DEFAULT_HABITS.length && (
            <Text style={styles.allDoneText}>All habits done today! 🎉</Text>
          )}
        </View>

        {/* Habit list */}
        {habits.map(habit => (
          <TouchableOpacity
            key={habit.id}
            onPress={() => toggleHabit(habit.id)}
            style={[styles.habitCard, habit.completed && styles.habitCardDone]}
            accessibilityRole="checkbox"
            accessibilityLabel={habit.label}
            accessibilityState={{ checked: habit.completed }}
            activeOpacity={0.75}
          >
            <Text style={styles.habitEmoji}>{habit.emoji}</Text>
            <View style={styles.habitInfo}>
              <Text style={[styles.habitLabel, habit.completed && styles.habitLabelDone]}>
                {habit.label}
              </Text>
              <Text style={styles.habitTarget}>{habit.target}</Text>
            </View>
            <View style={[styles.checkCircle, habit.completed && styles.checkCircleDone]}>
              {habit.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))}

        {/* Weekly consistency mini-chart */}
        {weeklyStats.length > 0 && (
          <View style={styles.weeklyCard}>
            <Text style={styles.sectionLabel}>7-Day Consistency</Text>
            <View style={styles.weeklyGrid}>
              {weeklyStats.map(stat => (
                <View key={stat.habitId} style={styles.weeklyRow}>
                  <Text style={styles.weeklyHabitEmoji}>
                    {DEFAULT_HABITS.find(h => h.id === stat.habitId)?.emoji}
                  </Text>
                  <View style={styles.weeklyDots}>
                    {stat.trend.map((done, i) => (
                      <View
                        key={i}
                        style={[styles.dot, done ? styles.dotDone : styles.dotEmpty]}
                        accessibilityLabel={done ? 'completed' : 'missed'}
                      />
                    ))}
                  </View>
                  <Text style={styles.weeklyCount}>{stat.completedDays}/7</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {ToastView}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, gap: 10 },

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressCount: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  progressTrack: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#16a34a', borderRadius: 4 },
  allDoneText: { fontSize: 13, color: '#16a34a', fontWeight: '600', textAlign: 'center' },

  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  habitCardDone: { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' },
  habitEmoji: { fontSize: 22 },
  habitInfo: { flex: 1 },
  habitLabel: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  habitLabelDone: { color: '#16a34a' },
  habitTarget: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  checkmark: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  weeklyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 4,
  },
  weeklyGrid: { gap: 8 },
  weeklyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weeklyHabitEmoji: { fontSize: 16, width: 24, textAlign: 'center' },
  weeklyDots: { flex: 1, flexDirection: 'row', gap: 4 },
  dot: { flex: 1, height: 10, borderRadius: 5 },
  dotDone: { backgroundColor: '#16a34a' },
  dotEmpty: { backgroundColor: '#e2e8f0' },
  weeklyCount: { fontSize: 11, fontWeight: '700', color: '#64748b', width: 28, textAlign: 'right' },
});
