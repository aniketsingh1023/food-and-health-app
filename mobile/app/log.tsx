/**
 * Mobile Food Logger screen — text input with AI analysis.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FoodCardMobile } from '../components/FoodCardMobile';
import { analyzeFood } from '../services/foodService';
import type { FoodLogEntry, MealType } from '../types';

const MEAL_TYPES: { value: MealType; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', label: 'Lunch', emoji: '☀️' },
  { value: 'dinner', label: 'Dinner', emoji: '🌙' },
  { value: 'snack', label: 'Snack', emoji: '🍎' },
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
  const [logged, setLogged] = useState<FoodLogEntry[]>([]);

  async function handleLog() {
    if (!description.trim() || isLogging) return;
    setIsLogging(true);

    try {
      const entry = await analyzeFood(description.trim(), mealType);
      setLogged(prev => [entry, ...prev]);
      setDescription('');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not reach the server.');
    } finally {
      setIsLogging(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Meal type pills */}
          <View style={styles.section}>
            <Text style={styles.label}>Meal type</Text>
            <View style={styles.pillRow} accessibilityRole="radiogroup">
              {MEAL_TYPES.map(type => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => setMealType(type.value)}
                  style={[styles.pill, mealType === type.value && styles.pillActive]}
                  accessibilityRole="radio"
                  accessibilityLabel={type.label}
                  accessibilityState={{ checked: mealType === type.value }}
                >
                  <Text style={styles.pillEmoji}>{type.emoji}</Text>
                  <Text style={[styles.pillText, mealType === type.value && styles.pillTextActive]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description input */}
          <View style={styles.section}>
            <Text style={styles.label} nativeID="food-input-label">What did you eat?</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. 2 scrambled eggs with toast…"
              placeholderTextColor="#B2BEC3"
              multiline
              numberOfLines={3}
              style={styles.textInput}
              accessibilityLabel="Food description"
              accessibilityLabelledBy="food-input-label"
              accessibilityHint="Describe your meal in detail for accurate nutrition analysis"
              editable={!isLogging}
            />
          </View>

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleLog}
            disabled={isLogging || !description.trim()}
            style={[
              styles.ctaButton,
              (isLogging || !description.trim()) && styles.ctaButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={isLogging ? 'Analyzing meal' : 'Analyze and log meal'}
            accessibilityState={{ disabled: isLogging || !description.trim(), busy: isLogging }}
          >
            {isLogging ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.ctaButtonText}>Analyze & Log</Text>
            )}
          </TouchableOpacity>

          {/* Logged entries */}
          {logged.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Just logged</Text>
              {logged.map(entry => (
                <FoodCardMobile key={entry.id} entry={entry} />
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFB' },
  scroll: { padding: 16, paddingBottom: 40, gap: 20 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#636E72' },
  label: { fontSize: 13, fontWeight: '600', color: '#636E72' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  pillActive: {
    borderColor: '#A8E6CF',
    backgroundColor: '#A8E6CF20',
  },
  pillEmoji: { fontSize: 14 },
  pillText: { fontSize: 13, fontWeight: '500', color: '#636E72' },
  pillTextActive: { color: '#2D3436' },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: '#2D3436',
    minHeight: 88,
    textAlignVertical: 'top',
  },
  ctaButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonDisabled: { opacity: 0.5 },
  ctaButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
