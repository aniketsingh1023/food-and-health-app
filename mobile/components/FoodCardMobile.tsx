/**
 * Food entry card for React Native.
 * Features: macro pills, health score, AI tip, ingredients toggle, two-tap delete.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { FoodLogEntry } from '../types';

interface FoodCardMobileProps {
  entry: FoodLogEntry;
  onDelete?: (id: string) => void;
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: '🌅 Breakfast',
  lunch: '☀️ Lunch',
  dinner: '🌙 Dinner',
  snack: '🍎 Snack',
};

const MACROS = [
  { key: 'calories' as const, label: 'Cal',   unit: 'kcal', color: '#ef4444' },
  { key: 'protein'  as const, label: 'Pro',   unit: 'g',    color: '#3b82f6' },
  { key: 'carbs'    as const, label: 'Carb',  unit: 'g',    color: '#f59e0b' },
  { key: 'fat'      as const, label: 'Fat',   unit: 'g',    color: '#8b5cf6' },
  { key: 'fiber'    as const, label: 'Fiber', unit: 'g',    color: '#10b981' },
];

export function FoodCardMobile({ entry, onDelete }: FoodCardMobileProps) {
  const { analysis, mealType, loggedAt, id } = entry;
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const time = new Date(loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const score = Math.round(analysis.healthScore);
  const scoreColor =
    score >= 8 ? '#16a34a' : score >= 6 ? '#10b981' : score >= 4 ? '#f59e0b' : '#ef4444';

  const hasIngredients = analysis.ingredients && analysis.ingredients.length > 0;

  const handleDeletePress = useCallback(() => {
    if (confirming) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onDelete?.(id);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    }
  }, [confirming, id, onDelete]);

  const handleIngredientsToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(v => !v);
  }, []);

  return (
    <View
      style={styles.card}
      accessible
      accessibilityRole="none"
      accessibilityLabel={`${analysis.name}, ${Math.round(analysis.macros.calories)} calories, health score ${score} out of 10`}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.mealLabel}>{MEAL_LABELS[mealType] ?? mealType} · {time}</Text>
          <Text style={styles.name} numberOfLines={1}>{analysis.name}</Text>
          <Text style={styles.serving}>{analysis.servingSize}</Text>
        </View>
        <View style={styles.headerRight}>
          <View
            style={[styles.scoreBadge, { backgroundColor: scoreColor }]}
            accessibilityLabel={`Health score: ${score} out of 10`}
          >
            <Text style={styles.scoreText}>{score}</Text>
          </View>
          {onDelete && (
            <TouchableOpacity
              onPress={handleDeletePress}
              style={[styles.deleteBtn, confirming && styles.deleteBtnConfirm]}
              accessibilityRole="button"
              accessibilityLabel={confirming ? 'Confirm delete' : 'Delete entry'}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {confirming ? (
                <Text style={styles.deleteBtnIcon}>✓</Text>
              ) : (
                <Text style={styles.deleteBtnIcon}>✕</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Macro row */}
      <View style={styles.macrosRow} accessibilityLabel="Nutrition breakdown">
        {MACROS.map(m => (
          <View
            key={m.key}
            style={styles.macroPill}
            accessibilityLabel={`${m.label}: ${Math.round(analysis.macros[m.key])} ${m.unit}`}
          >
            <View style={[styles.macroDot, { backgroundColor: m.color }]} />
            <Text style={styles.macroLabel}>{m.label}</Text>
            <Text style={styles.macroValue}>{Math.round(analysis.macros[m.key])}</Text>
          </View>
        ))}
      </View>

      {/* AI tip */}
      {!!analysis.tip && (
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            <Text style={styles.tipBold}>AI tip: </Text>
            {analysis.tip}
          </Text>
        </View>
      )}

      {/* Ingredients toggle */}
      {hasIngredients && (
        <View>
          <TouchableOpacity
            onPress={handleIngredientsToggle}
            style={styles.ingredientsToggle}
            accessibilityRole="button"
            aria-expanded={expanded}
            accessibilityLabel={expanded ? 'Hide ingredients' : `Show ${analysis.ingredients.length} ingredients`}
          >
            <Text style={styles.ingredientsChevron}>{expanded ? '▾' : '▸'}</Text>
            <Text style={styles.ingredientsToggleText}>
              {expanded ? 'Hide' : 'Show'} ingredients ({analysis.ingredients.length})
            </Text>
          </TouchableOpacity>
          {expanded && (
            <View style={styles.ingredientsList} accessibilityLabel="Ingredients list">
              {analysis.ingredients.map((ing, i) => (
                <View key={i} style={styles.ingredientTag}>
                  <Text style={styles.ingredientText}>{ing}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
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
    borderColor: '#f1f5f9',
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  headerText: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  mealLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
  name: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginTop: 2 },
  serving: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  scoreBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnConfirm: { backgroundColor: '#ef4444' },
  deleteBtnIcon: { fontSize: 10, color: '#64748b', fontWeight: '700' },
  macrosRow: { flexDirection: 'row', gap: 5 },
  macroPill: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    gap: 2,
  },
  macroDot: { width: 5, height: 5, borderRadius: 3 },
  macroLabel: { fontSize: 9, color: '#64748b', fontWeight: '600' },
  macroValue: { fontSize: 11, color: '#1e293b', fontWeight: '700' },
  tipBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  tipText: { fontSize: 11, color: '#15803d', lineHeight: 16 },
  tipBold: { fontWeight: '700' },
  ingredientsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  ingredientsChevron: { fontSize: 10, color: '#94a3b8' },
  ingredientsToggleText: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
  ingredientsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 },
  ingredientTag: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ingredientText: { fontSize: 10, color: '#475569' },
});
