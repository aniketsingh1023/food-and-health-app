/**
 * Suggest screen — AI meal suggestion based on remaining macros.
 * Mirrors web/app/suggest/page.tsx.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useToast } from '../components/Toast';
import { suggestMeal } from '../services/mealService';
import { analyzeFood } from '../services/foodService';
import { getFoodLogForDate, getDailyGoals, addFoodLogEntry, updateStreak } from '../lib/storage';
import { sumMacros, getTimeOfDay, remainingMacros } from '../lib/nutritionCalc';
import { DEFAULT_GOALS } from '../lib/storage';
import type { DailyGoals, FoodLogEntry, MealSuggestion, MealType, Macros } from '../types';

const PREFERENCE_CHIPS = [
  'High protein', 'Low carb', 'Vegetarian', 'Quick prep',
  'Light meal', 'Post-workout', 'Budget-friendly',
];

const MACRO_DISPLAY = [
  { key: 'calories' as const, label: 'Cal',    unit: 'kcal', color: '#ef4444' },
  { key: 'protein'  as const, label: 'Protein', unit: 'g',   color: '#3b82f6' },
  { key: 'carbs'    as const, label: 'Carbs',   unit: 'g',   color: '#f59e0b' },
  { key: 'fat'      as const, label: 'Fat',     unit: 'g',   color: '#8b5cf6' },
];

function guessMealType(): MealType {
  const h = new Date().getHours();
  if (h < 10) return 'breakfast';
  if (h < 14) return 'lunch';
  if (h < 20) return 'dinner';
  return 'snack';
}

export default function SuggestScreen() {
  const [consumed, setConsumed] = useState<Macros>({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  const [goals, setGoals] = useState<DailyGoals>(DEFAULT_GOALS);
  const [suggestion, setSuggestion] = useState<MealSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [logStatus, setLogStatus] = useState<'idle' | 'logging' | 'logged'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const { showToast, ToastView } = useToast();

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([getFoodLogForDate(today), getDailyGoals()]).then(([entries, savedGoals]) => {
      setConsumed(sumMacros(entries));
      setGoals(savedGoals);
    });
  }, []);

  const toggleChip = useCallback((chip: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  }, []);

  const fetchSuggestion = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);
    setLogStatus('idle');
    const allPrefs = [...selectedChips, preferences.trim()].filter(Boolean).join(', ');
    try {
      const data = await suggestMeal({
        consumed,
        goals,
        timeOfDay: getTimeOfDay(),
        preferences: allPrefs || undefined,
      });
      setSuggestion(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error — check your connection.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [consumed, goals, preferences, selectedChips, showToast]);

  const handleLogSuggestion = useCallback(async () => {
    if (!suggestion || logStatus !== 'idle') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLogStatus('logging');
    try {
      const desc = suggestion.name + (suggestion.description ? ` — ${suggestion.description}` : '');
      const entry = await analyzeFood(desc, guessMealType());
      await addFoodLogEntry(entry);
      await updateStreak();
      setLogStatus('logged');
      showToast('Meal logged!', 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setLogStatus('idle');
      showToast('Failed to log meal. Try again.', 'error');
    }
  }, [suggestion, logStatus, showToast]);

  const remaining = remainingMacros(consumed, goals);
  const timeOfDay = getTimeOfDay();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View>
          <Text style={styles.pageTitle}>What to Eat Next?</Text>
          <Text style={styles.pageSubtitle}>AI picks the best meal for your remaining macros.</Text>
        </View>

        {/* Remaining macros card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Remaining today · {timeOfDay}</Text>
          <View style={styles.macroGrid}>
            {MACRO_DISPLAY.map(m => {
              const rem = Math.round(remaining[m.key]);
              const pct = goals[m.key] > 0
                ? Math.round((consumed[m.key] / goals[m.key]) * 100)
                : 0;
              return (
                <View key={m.key} style={styles.macroCell}>
                  <View style={[styles.macroDot, { backgroundColor: m.color }]} />
                  <Text style={styles.macroValue}>{rem}</Text>
                  <Text style={styles.macroUnit}>{m.unit} left</Text>
                  <Text style={[styles.macroPct, { color: pct > 90 ? '#ef4444' : '#94a3b8' }]}>
                    {pct}%
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Preference chips */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preferences</Text>
          <View style={styles.chipRow}>
            {PREFERENCE_CHIPS.map(chip => (
              <TouchableOpacity
                key={chip}
                onPress={() => toggleChip(chip)}
                style={[styles.chip, selectedChips.includes(chip) && styles.chipActive]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selectedChips.includes(chip) }}
                accessibilityLabel={chip}
              >
                <Text
                  style={[styles.chipText, selectedChips.includes(chip) && styles.chipTextActive]}
                >
                  {chip}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            value={preferences}
            onChangeText={setPreferences}
            placeholder="Or describe any other preference..."
            placeholderTextColor="#94a3b8"
            style={styles.prefInput}
            accessibilityLabel="Custom food preference"
          />
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={fetchSuggestion}
          disabled={loading}
          style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
          accessibilityRole="button"
          accessibilityState={{ disabled: loading, busy: loading }}
          accessibilityLabel="Get meal suggestion"
        >
          {loading ? (
            <View style={styles.ctaContent}>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.ctaButtonText}>Thinking...</Text>
            </View>
          ) : (
            <Text style={styles.ctaButtonText}>Get Meal Suggestion</Text>
          )}
        </TouchableOpacity>

        {error && (
          <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>
        )}

        {/* Suggestion card */}
        {suggestion && !loading && (
          <View style={styles.suggestionCard} accessibilityLiveRegion="polite">
            {/* Green header */}
            <View style={styles.suggestionHeader}>
              <Text style={styles.suggestionHeaderLabel}>AI Recommendation</Text>
              <Text style={styles.suggestionName}>{suggestion.name}</Text>
              <Text style={styles.suggestionDesc}>{suggestion.description}</Text>
            </View>

            <View style={styles.suggestionBody}>
              {/* Estimated macros */}
              <Text style={styles.sectionLabel}>Estimated nutrition</Text>
              <View style={styles.macroGrid}>
                {[
                  { label: 'Cal',    value: suggestion.estimatedMacros.calories, unit: 'kcal', color: '#ef4444' },
                  { label: 'Protein', value: suggestion.estimatedMacros.protein,  unit: 'g',   color: '#3b82f6' },
                  { label: 'Carbs',  value: suggestion.estimatedMacros.carbs,    unit: 'g',   color: '#f59e0b' },
                  { label: 'Fat',    value: suggestion.estimatedMacros.fat,      unit: 'g',   color: '#8b5cf6' },
                  { label: 'Fiber',  value: suggestion.estimatedMacros.fiber,    unit: 'g',   color: '#10b981' },
                ].map(m => (
                  <View key={m.label} style={styles.macroCell}>
                    <View style={[styles.macroDot, { backgroundColor: m.color }]} />
                    <Text style={styles.macroValue}>{Math.round(m.value)}</Text>
                    <Text style={styles.macroUnit}>{m.label}</Text>
                  </View>
                ))}
              </View>

              {/* Why + prep time */}
              <View style={styles.reasonBox}>
                <Text style={styles.reasonText}>
                  <Text style={styles.reasonBold}>Why this meal: </Text>
                  {suggestion.reason}
                </Text>
              </View>
              <View style={styles.prepRow}>
                <Text style={styles.prepText}>
                  ⏱ Prep time: <Text style={styles.prepBold}>{suggestion.prepTime}</Text>
                </Text>
              </View>

              {/* Action buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  onPress={handleLogSuggestion}
                  disabled={logStatus !== 'idle'}
                  style={[
                    styles.logButton,
                    logStatus === 'logged' && styles.logButtonLogged,
                    logStatus === 'logging' && styles.logButtonLogging,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Log this meal"
                  accessibilityState={{ disabled: logStatus !== 'idle', busy: logStatus === 'logging' }}
                >
                  {logStatus === 'logged' ? (
                    <Text style={styles.logButtonTextLogged}>✓ Logged!</Text>
                  ) : logStatus === 'logging' ? (
                    <View style={styles.ctaContent}>
                      <ActivityIndicator color="#16a34a" size="small" />
                      <Text style={styles.logButtonTextLogging}>Logging...</Text>
                    </View>
                  ) : (
                    <Text style={styles.logButtonText}>Log this meal</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={fetchSuggestion}
                  disabled={loading}
                  style={styles.retryButton}
                  accessibilityRole="button"
                  accessibilityLabel="Try another suggestion"
                >
                  <Text style={styles.retryButtonText}>Try another</Text>
                </TouchableOpacity>
              </View>
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
  scrollContent: { padding: 16, gap: 16 },

  pageTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  pageSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 3 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  macroGrid: { flexDirection: 'row', gap: 6 },
  macroCell: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, padding: 8, alignItems: 'center', gap: 2 },
  macroDot: { width: 6, height: 6, borderRadius: 3 },
  macroValue: { fontSize: 13, fontWeight: '800', color: '#1e293b' },
  macroUnit: { fontSize: 9, color: '#94a3b8' },
  macroPct: { fontSize: 9, fontWeight: '600' },

  section: { gap: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  chipActive: { backgroundColor: '#f0fdf4', borderColor: '#16a34a' },
  chipText: { fontSize: 12, fontWeight: '500', color: '#64748b' },
  chipTextActive: { color: '#15803d', fontWeight: '600' },
  prefInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1e293b',
  },

  ctaButton: {
    backgroundColor: '#16a34a',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaButtonDisabled: { opacity: 0.5 },
  ctaContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  errorText: { fontSize: 12, color: '#ef4444', textAlign: 'center' },

  suggestionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestionHeader: { backgroundColor: '#16a34a', padding: 18 },
  suggestionHeaderLabel: { fontSize: 10, fontWeight: '600', color: '#bbf7d0', textTransform: 'uppercase', letterSpacing: 0.5 },
  suggestionName: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginTop: 4 },
  suggestionDesc: { fontSize: 13, color: '#dcfce7', marginTop: 4, lineHeight: 18 },
  suggestionBody: { padding: 16, gap: 12 },

  reasonBox: { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#bbf7d0' },
  reasonText: { fontSize: 12, color: '#15803d', lineHeight: 17 },
  reasonBold: { fontWeight: '700' },
  prepRow: { flexDirection: 'row', alignItems: 'center' },
  prepText: { fontSize: 12, color: '#94a3b8' },
  prepBold: { fontWeight: '600', color: '#64748b' },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  logButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logButtonLogged: { backgroundColor: '#f0fdf4', borderWidth: 2, borderColor: '#bbf7d0' },
  logButtonLogging: { backgroundColor: '#f0fdf4', borderWidth: 2, borderColor: '#bbf7d0' },
  logButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  logButtonTextLogged: { color: '#16a34a', fontWeight: '700', fontSize: 13 },
  logButtonTextLogging: { color: '#16a34a', fontWeight: '600', fontSize: 13 },
  retryButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  retryButtonText: { color: '#64748b', fontWeight: '600', fontSize: 13 },
});
