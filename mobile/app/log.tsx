/**
 * Log Food screen — text input with Gemini AI analysis.
 * Persists entries to AsyncStorage, shows haptic + toast feedback.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { FoodCardMobile } from '../components/FoodCardMobile';
import { useToast } from '../components/Toast';
import { analyzeFood } from '../services/foodService';
import { addFoodLogEntry, getFoodLogForDate, removeFoodLogEntry, updateStreak } from '../lib/storage';
import type { FoodLogEntry, MealType } from '../types';

const MEAL_TYPES: { value: MealType; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch',     label: 'Lunch',     emoji: '☀️' },
  { value: 'dinner',    label: 'Dinner',    emoji: '🌙' },
  { value: 'snack',     label: 'Snack',     emoji: '🍎' },
];

function guessMealType(): MealType {
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 14) return 'lunch';
  if (hour < 20) return 'dinner';
  return 'snack';
}

export default function LogScreen() {
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState<MealType>(guessMealType());
  const [isLogging, setIsLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<FoodLogEntry[]>([]);
  const inputRef = useRef<TextInput>(null);
  const { showToast, ToastView } = useToast();
  const today = new Date().toISOString().slice(0, 10);

  // Load today's entries from storage on mount
  useEffect(() => {
    getFoodLogForDate(today).then(setEntries);
  }, [today]);

  const handleLog = useCallback(async () => {
    const trimmed = description.trim();
    if (!trimmed || isLogging) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLogging(true);
    setError(null);

    try {
      const entry = await analyzeFood(trimmed, mealType);
      await addFoodLogEntry(entry);
      await updateStreak();
      setEntries(prev => [entry, ...prev]);
      setDescription('');
      showToast('Meal logged!', 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not reach the server.';
      setError(msg);
      showToast(msg, 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLogging(false);
    }
  }, [description, isLogging, mealType, showToast]);

  const handleDelete = useCallback(async (id: string) => {
    await removeFoodLogEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
    showToast('Entry removed', 'info');
  }, [showToast]);

  const canSubmit = description.trim().length > 0 && !isLogging;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Dismiss keyboard on tap outside input */}
        <Pressable style={styles.flex} onPress={() => inputRef.current?.blur()}>
          <FlatList
            data={entries}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <View style={styles.inputSection}>
                {/* Meal type pills */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Meal type</Text>
                  <View style={styles.pillRow} accessibilityRole="radiogroup">
                    {MEAL_TYPES.map(type => (
                      <TouchableOpacity
                        key={type.value}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setMealType(type.value);
                        }}
                        style={[styles.pill, mealType === type.value && styles.pillActive]}
                        accessibilityRole="radio"
                        accessibilityLabel={type.label}
                        accessibilityState={{ checked: mealType === type.value }}
                      >
                        <Text style={styles.pillEmoji}>{type.emoji}</Text>
                        <Text
                          style={[
                            styles.pillText,
                            mealType === type.value && styles.pillTextActive,
                          ]}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Description input */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel} nativeID="food-input-label">
                    What did you eat?
                  </Text>
                  <TextInput
                    ref={inputRef}
                    value={description}
                    onChangeText={text => {
                      setDescription(text);
                      if (error) setError(null);
                    }}
                    placeholder="e.g. 2 scrambled eggs with toast and orange juice..."
                    placeholderTextColor="#94a3b8"
                    multiline
                    numberOfLines={3}
                    style={styles.textInput}
                    accessibilityLabel="Food description"
                    accessibilityLabelledBy="food-input-label"
                    accessibilityHint="Describe your meal in detail for accurate nutrition analysis"
                    editable={!isLogging}
                    blurOnSubmit={false}
                  />
                  {error && (
                    <Text style={styles.errorText} accessibilityRole="alert">
                      {error}
                    </Text>
                  )}
                </View>

                {/* Submit button */}
                <TouchableOpacity
                  onPress={handleLog}
                  disabled={!canSubmit}
                  style={[styles.ctaButton, !canSubmit && styles.ctaButtonDisabled]}
                  accessibilityRole="button"
                  accessibilityLabel={isLogging ? 'Analyzing meal...' : 'Analyze and log meal'}
                  accessibilityState={{ disabled: !canSubmit, busy: isLogging }}
                >
                  {isLogging ? (
                    <View style={styles.ctaButtonContent}>
                      <ActivityIndicator color="white" size="small" />
                      <Text style={styles.ctaButtonText}>Analyzing...</Text>
                    </View>
                  ) : (
                    <Text style={styles.ctaButtonText}>{'Analyze & Log'}</Text>
                  )}
                </TouchableOpacity>

                {/* Section header for logged entries */}
                {entries.length > 0 && (
                  <View style={styles.logHeader}>
                    <Text style={styles.sectionLabel}>
                      Today's Log · {entries.length} {entries.length === 1 ? 'meal' : 'meals'}
                    </Text>
                  </View>
                )}
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyState} accessibilityLabel="No meals logged today">
                <Text style={styles.emptyEmoji}>🍽️</Text>
                <Text style={styles.emptyTitle}>Nothing logged yet</Text>
                <Text style={styles.emptyHint}>{'Describe your meal above and tap Analyze & Log.'}</Text>
              </View>
            }
            renderItem={({ item }) => (
              <FoodCardMobile entry={item} onDelete={handleDelete} />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListFooterComponent={<View style={{ height: 20 }} />}
          />
        </Pressable>
      </KeyboardAvoidingView>

      {/* Toast overlay */}
      {ToastView}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  flex: { flex: 1 },
  scrollContent: { padding: 16 },
  inputSection: { gap: 16, marginBottom: 16 },
  section: { gap: 8 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#FFFFFF',
  },
  pillActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  pillEmoji: { fontSize: 14 },
  pillText: { fontSize: 13, fontWeight: '500', color: '#64748b' },
  pillTextActive: { color: '#15803d', fontWeight: '600' },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: '#1e293b',
    minHeight: 88,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  errorText: { fontSize: 12, color: '#ef4444', marginTop: 4 },
  ctaButton: {
    backgroundColor: '#16a34a',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonDisabled: { opacity: 0.45 },
  ctaButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  logHeader: { marginTop: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: '#475569' },
  emptyHint: { fontSize: 12, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 16 },
});
