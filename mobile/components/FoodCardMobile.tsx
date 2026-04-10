/**
 * Food entry card for React Native.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { FoodLogEntry } from '../types';

interface FoodCardMobileProps {
  entry: FoodLogEntry;
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: '🌅 Breakfast',
  lunch: '☀️ Lunch',
  dinner: '🌙 Dinner',
  snack: '🍎 Snack',
};

/** Renders a food log entry card with macros. */
export function FoodCardMobile({ entry }: FoodCardMobileProps) {
  const { analysis, mealType, loggedAt } = entry;
  const time = new Date(loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const score = Math.round(analysis.healthScore);
  const scoreColor = score >= 8 ? '#00B894' : score >= 6 ? '#A8E6CF' : score >= 4 ? '#FDCB6E' : '#FF6B6B';

  return (
    <View
      style={styles.card}
      accessible
      accessibilityRole="none"
      accessibilityLabel={`${analysis.name}, ${Math.round(analysis.macros.calories)} calories, health score ${score}`}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.mealLabel}>{MEAL_LABELS[mealType]} · {time}</Text>
          <Text style={styles.name} numberOfLines={1}>{analysis.name}</Text>
          <Text style={styles.serving}>{analysis.servingSize}</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]} accessibilityLabel={`Health score: ${score}/10`}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      {/* Macros row */}
      <View style={styles.macrosRow}>
        <MacroPill label="Cal" value={analysis.macros.calories} color="#FF6B6B" />
        <MacroPill label="Pro" value={analysis.macros.protein} color="#74B9FF" />
        <MacroPill label="Carb" value={analysis.macros.carbs} color="#FDCB6E" />
        <MacroPill label="Fat" value={analysis.macros.fat} color="#A29BFE" />
        <MacroPill label="Fiber" value={analysis.macros.fiber} color="#A8E6CF" />
      </View>

      {/* Tip */}
      {!!analysis.tip && (
        <Text style={styles.tip}>💡 {analysis.tip}</Text>
      )}
    </View>
  );
}

function MacroPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.pill} accessibilityLabel={`${label}: ${Math.round(value)}`}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>{Math.round(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  mealLabel: { fontSize: 11, color: '#B2BEC3' },
  name: { fontSize: 15, fontWeight: '700', color: '#2D3436', marginTop: 1 },
  serving: { fontSize: 11, color: '#B2BEC3' },
  scoreBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  scoreText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  macrosRow: { flexDirection: 'row', gap: 6 },
  pill: { flex: 1, backgroundColor: '#F8FAFB', borderRadius: 8, padding: 6, alignItems: 'center', gap: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  pillLabel: { fontSize: 9, color: '#636E72', fontWeight: '600' },
  pillValue: { fontSize: 11, color: '#2D3436', fontWeight: '700' },
  tip: { fontSize: 12, color: '#636E72', backgroundColor: '#F8FAFB', borderRadius: 10, padding: 8, lineHeight: 17 },
});
