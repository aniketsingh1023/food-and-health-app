/**
 * Mobile Dashboard screen — macro rings and today's food log.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MacroRingMobile } from '../components/MacroRingMobile';
import { FoodCardMobile } from '../components/FoodCardMobile';
import { API_BASE_URL } from '../lib/config';
import type { FoodLogEntry, Macros, DailyGoals } from '../types';

const DEFAULT_GOALS: DailyGoals = {
  calories: 2000,
  protein: 50,
  carbs: 250,
  fat: 65,
  fiber: 25,
};

function sumMacros(entries: FoodLogEntry[]): Macros {
  return entries.reduce<Macros>(
    (acc, e) => ({
      calories: acc.calories + e.analysis.macros.calories,
      protein: acc.protein + e.analysis.macros.protein,
      carbs: acc.carbs + e.analysis.macros.carbs,
      fat: acc.fat + e.analysis.macros.fat,
      fiber: acc.fiber + e.analysis.macros.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

export default function DashboardScreen() {
  const [entries, setEntries] = useState<FoodLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const consumed = sumMacros(entries);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  // In a real app, entries would come from shared state / AsyncStorage
  // For demo, they are kept in local state and populated by LogScreen

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        accessibilityRole="scrollview"
      >
        {/* Date header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{today}</Text>
          <View style={styles.streakBadge} accessibilityLabel="Streak badge">
            <Text style={styles.streakText}>🔥 0 day streak</Text>
          </View>
        </View>

        {/* Macro rings */}
        <View style={styles.card} accessibilityLabel="Daily macro progress">
          <Text style={styles.sectionTitle}>Daily Progress</Text>
          <View style={styles.ringsRow}>
            <MacroRingMobile label="Calories" value={consumed.calories} goal={DEFAULT_GOALS.calories} color="#FF6B6B" unit="kcal" />
            <MacroRingMobile label="Protein" value={consumed.protein} goal={DEFAULT_GOALS.protein} color="#74B9FF" unit="g" />
            <MacroRingMobile label="Carbs" value={consumed.carbs} goal={DEFAULT_GOALS.carbs} color="#FDCB6E" unit="g" />
            <MacroRingMobile label="Fiber" value={consumed.fiber} goal={DEFAULT_GOALS.fiber} color="#A8E6CF" unit="g" />
          </View>
        </View>

        {/* Today's log */}
        <View style={styles.logSection}>
          <Text style={styles.sectionTitle}>Today&apos;s Log</Text>
          {loading ? (
            <ActivityIndicator color="#A8E6CF" />
          ) : entries.length === 0 ? (
            <View style={styles.emptyState} accessibilityLabel="No meals logged">
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyText}>No meals logged yet.</Text>
              <Text style={styles.emptyHint}>Tap Log to add your first meal.</Text>
            </View>
          ) : (
            entries.slice().reverse().map(entry => (
              <FoodCardMobile key={entry.id} entry={entry} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFB' },
  scroll: { padding: 16, paddingBottom: 32, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  dateText: { fontSize: 20, fontWeight: '700', color: '#2D3436' },
  streakBadge: { backgroundColor: '#FF6B6B20', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  streakText: { fontSize: 12, color: '#FF6B6B', fontWeight: '600' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#636E72', marginBottom: 12 },
  ringsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  logSection: { gap: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#B2BEC3', fontWeight: '500' },
  emptyHint: { fontSize: 12, color: '#B2BEC3', marginTop: 4 },
});
