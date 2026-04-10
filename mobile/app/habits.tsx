/**
 * Mobile Habits screen — 5 daily habits with tap to complete.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Habit, HabitId } from '../types';

const DEFAULT_HABITS: Habit[] = [
  { id: 'hydration', label: 'Drink 8 glasses of water', emoji: '💧', target: '8 glasses', completed: false },
  { id: 'breakfast', label: 'Eat breakfast', emoji: '🌅', target: 'Before 10am', completed: false },
  { id: 'fruits', label: 'Eat 2+ fruits or veggies', emoji: '🍎', target: '2 servings', completed: false },
  { id: 'steps', label: 'Walk 7,500 steps', emoji: '👟', target: '7,500 steps', completed: false },
  { id: 'sleep', label: 'Sleep 7–8 hours', emoji: '😴', target: '7-8 hours', completed: false },
];

export default function HabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);

  const completedCount = habits.filter(h => h.completed).length;

  function toggleHabit(id: HabitId) {
    setHabits(prev =>
      prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h)
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress bar */}
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 5, now: completedCount }}
          accessibilityLabel={`${completedCount} of 5 habits completed`}
          style={styles.progressContainer}
        >
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(completedCount / 5) * 100}%` as unknown as number }]} />
          </View>
          <Text style={styles.progressText}>{completedCount} / 5 done</Text>
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
            activeOpacity={0.7}
          >
            <Text style={styles.habitEmoji}>{habit.emoji}</Text>
            <View style={styles.habitInfo}>
              <Text style={[styles.habitLabel, habit.completed && styles.habitLabelDone]}>
                {habit.label}
              </Text>
              <Text style={styles.habitTarget}>{habit.target}</Text>
            </View>
            <View style={[styles.check, habit.completed && styles.checkDone]}>
              {habit.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFB' },
  scroll: { padding: 16, paddingBottom: 40, gap: 12 },
  progressContainer: { marginBottom: 4, gap: 6 },
  progressTrack: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#A8E6CF', borderRadius: 3 },
  progressText: { fontSize: 12, color: '#636E72', fontWeight: '500' },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  habitCardDone: { borderColor: '#A8E6CF', backgroundColor: '#A8E6CF15' },
  habitEmoji: { fontSize: 24 },
  habitInfo: { flex: 1 },
  habitLabel: { fontSize: 14, fontWeight: '600', color: '#2D3436' },
  habitLabelDone: { color: '#00B894' },
  habitTarget: { fontSize: 12, color: '#B2BEC3', marginTop: 2 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: '#A8E6CF', borderColor: '#A8E6CF' },
  checkmark: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
