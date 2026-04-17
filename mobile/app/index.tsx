/**
 * Dashboard screen — macro summary and today's food log.
 * Reads from AsyncStorage, supports pull-to-refresh, shows real streak.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { MacroRingMobile } from '../components/MacroRingMobile';
import { FoodCardMobile } from '../components/FoodCardMobile';
import { SkeletonCard } from '../components/SkeletonCard';
import {
  getFoodLogForDate,
  removeFoodLogEntry,
  getDailyGoals,
  getStreak,
} from '../lib/storage';
import { sumMacros } from '../lib/nutritionCalc';
import { DEFAULT_GOALS } from '../lib/storage';
import type { DailyGoals, FoodLogEntry, Macros } from '../types';

const MACRO_RINGS = [
  { key: 'calories' as const, label: 'Calories', color: '#ef4444', unit: 'kcal' },
  { key: 'protein'  as const, label: 'Protein',  color: '#3b82f6', unit: 'g'    },
  { key: 'carbs'    as const, label: 'Carbs',    color: '#f59e0b', unit: 'g'    },
  { key: 'fiber'    as const, label: 'Fiber',    color: '#10b981', unit: 'g'    },
];

function CalorieSummaryBar({
  consumed,
  goals,
}: {
  consumed: Macros;
  goals: DailyGoals;
}) {
  const pct = goals.calories > 0
    ? Math.min(100, Math.round((consumed.calories / goals.calories) * 100))
    : 0;
  const remaining = Math.max(0, goals.calories - consumed.calories);
  const overGoal = consumed.calories > goals.calories;

  return (
    <View style={styles.calCard}>
      <View style={styles.calCardHeader}>
        <Text style={styles.sectionLabel}>Calories</Text>
        <View
          style={[
            styles.calBadge,
            { backgroundColor: overGoal ? '#fef2f2' : pct >= 80 ? '#f0fdf4' : '#f8fafc' },
          ]}
        >
          <Text
            style={[
              styles.calBadgeText,
              { color: overGoal ? '#ef4444' : pct >= 80 ? '#16a34a' : '#64748b' },
            ]}
          >
            {pct}% of goal
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View
        style={styles.progressTrack}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: goals.calories, now: Math.round(consumed.calories) }}
        accessibilityLabel={`Calorie progress: ${Math.round(consumed.calories)} of ${goals.calories} kcal`}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${pct}%` as unknown as number,
              backgroundColor: overGoal ? '#ef4444' : '#16a34a',
            },
          ]}
        />
      </View>

      <View style={styles.calStats}>
        <View>
          <Text style={styles.calBigNumber}>{Math.round(consumed.calories).toLocaleString()}</Text>
          <Text style={styles.calSubLabel}>kcal consumed</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.calBigNumber, { color: overGoal ? '#ef4444' : '#16a34a', fontSize: 20 }]}>
            {remaining.toLocaleString()}
          </Text>
          <Text style={styles.calSubLabel}>kcal remaining</Text>
        </View>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<FoodLogEntry[]>([]);
  const [goals, setGoals] = useState<DailyGoals>(DEFAULT_GOALS);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const consumed = sumMacros(entries);

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const loadData = useCallback(async () => {
    try {
      const [todayEntries, savedGoals, savedStreak] = await Promise.all([
        getFoodLogForDate(today),
        getDailyGoals(),
        getStreak(),
      ]);
      setEntries(todayEntries);
      setGoals(savedGoals);
      setStreak(savedStreak);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [today]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
  }, [loadData]);

  const handleDelete = useCallback(async (id: string) => {
    await removeFoodLogEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleLogPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/log');
  }, [router]);

  // Skeleton while initial load
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.scrollContent}>
          <SkeletonCard lines={2} />
          <SkeletonCard lines={4} />
          <SkeletonCard lines={3} />
        </View>
      </SafeAreaView>
    );
  }

  const reversedEntries = entries.slice().reverse();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={reversedEntries}
        keyExtractor={item => item.id}
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
        ListHeaderComponent={
          <>
            {/* Date + streak header */}
            <View style={styles.pageHeader}>
              <View>
                <Text style={styles.dateLabelSmall}>{todayLabel}</Text>
                <Text style={styles.pageTitle}>Today's Overview</Text>
              </View>
              {streak > 0 && (
                <View
                  style={styles.streakBadge}
                  accessibilityRole="text"
                  accessibilityLabel={`${streak} day streak`}
                >
                  <Text style={styles.streakNumber}>{streak}</Text>
                  <Text style={styles.streakLabel}>day streak 🔥</Text>
                </View>
              )}
            </View>

            {/* Calorie bar card */}
            <CalorieSummaryBar consumed={consumed} goals={goals} />

            {/* Macro rings */}
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Macronutrients</Text>
              <View style={styles.ringsRow}>
                {MACRO_RINGS.map(ring => (
                  <MacroRingMobile
                    key={ring.key}
                    label={ring.label}
                    value={consumed[ring.key]}
                    goal={goals[ring.key]}
                    color={ring.color}
                    unit={ring.unit}
                  />
                ))}
              </View>
            </View>

            {/* Quick actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.primaryAction}
                onPress={handleLogPress}
                accessibilityRole="button"
                accessibilityLabel="Log a meal"
              >
                <Text style={styles.primaryActionText}>+ Log a meal</Text>
                <Text style={styles.primaryActionSub}>{entries.length} logged today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryAction}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/suggest');
                }}
                accessibilityRole="button"
                accessibilityLabel="Get a meal suggestion"
              >
                <Text style={styles.secondaryActionText}>✨ What to eat?</Text>
                <Text style={styles.secondaryActionSub}>AI suggestion</Text>
              </TouchableOpacity>
            </View>

            {/* Today's log heading */}
            <View style={styles.logHeader}>
              <Text style={styles.sectionLabel}>Today's Log</Text>
              <TouchableOpacity onPress={handleLogPress} accessibilityRole="button">
                <Text style={styles.addLink}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState} accessibilityLabel="No meals logged yet">
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>No meals logged yet</Text>
            <Text style={styles.emptyHint}>Start tracking your nutrition today.</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleLogPress}
              accessibilityRole="button"
            >
              <Text style={styles.emptyButtonText}>Log first meal</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <FoodCardMobile entry={item} onDelete={handleDelete} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListFooterComponent={<View style={{ height: 20 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, gap: 12 },

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dateLabelSmall: { fontSize: 11, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  pageTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginTop: 2 },
  streakBadge: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  streakNumber: { fontSize: 16, fontWeight: '800', color: '#ea580c', lineHeight: 18 },
  streakLabel: { fontSize: 9, color: '#f97316', fontWeight: '600', marginTop: 1 },

  // Calorie card
  calCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  calCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  calBadgeText: { fontSize: 11, fontWeight: '600' },
  progressTrack: {
    height: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  calStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  calBigNumber: { fontSize: 26, fontWeight: '800', color: '#1e293b', lineHeight: 30 },
  calSubLabel: { fontSize: 11, color: '#94a3b8', marginTop: 2 },

  // Macros card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  ringsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },

  // Quick actions
  quickActions: { flexDirection: 'row', gap: 10 },
  primaryAction: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  primaryActionText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  primaryActionSub: { fontSize: 11, color: '#bbf7d0' },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  secondaryActionText: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  secondaryActionSub: { fontSize: 11, color: '#94a3b8' },

  // Log section
  logHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addLink: { fontSize: 12, fontWeight: '700', color: '#16a34a' },

  // Empty state
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 6,
  },
  emptyEmoji: { fontSize: 36, marginBottom: 4 },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  emptyHint: { fontSize: 12, color: '#94a3b8', textAlign: 'center' },
  emptyButton: {
    marginTop: 12,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
