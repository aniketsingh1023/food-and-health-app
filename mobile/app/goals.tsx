/**
 * Goals screen — TDEE calculator and manual macro targets.
 * Persists goals to AsyncStorage. Mirrors web/app/goals/page.tsx.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import { getDailyGoals, saveDailyGoals, DEFAULT_GOALS } from '../lib/storage';
import { calculateGoals, activityLabel, goalLabel, ACTIVITY_LEVELS, GOALS } from '../lib/tdee';
import type { ActivityLevel, DailyGoals, GoalType, Sex, UserProfile } from '../types';

type Mode = 'calculator' | 'manual';

const GOAL_FIELDS: { key: keyof DailyGoals; label: string; unit: string; color: string }[] = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: '#ef4444' },
  { key: 'protein',  label: 'Protein',  unit: 'g',   color: '#3b82f6' },
  { key: 'carbs',    label: 'Carbs',    unit: 'g',   color: '#f59e0b' },
  { key: 'fat',      label: 'Fat',      unit: 'g',   color: '#8b5cf6' },
  { key: 'fiber',    label: 'Fiber',    unit: 'g',   color: '#10b981' },
];

export default function GoalsScreen() {
  const [mode, setMode] = useState<Mode>('calculator');
  const [goals, setGoals] = useState<DailyGoals>(DEFAULT_GOALS);
  const [profile, setProfile] = useState<UserProfile>({
    age: 25,
    weightKg: 70,
    heightCm: 175,
    sex: 'male',
    activity: 'moderate',
    goal: 'maintain',
  });
  const { showToast, ToastView } = useToast();

  useEffect(() => {
    getDailyGoals().then(setGoals);
  }, []);

  const handleModeSwitch = useCallback((m: Mode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(m);
  }, []);

  const applyCalculated = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const calculated = calculateGoals(profile);
    setGoals(calculated);
    showToast('Targets calculated!', 'info');
  }, [profile, showToast]);

  const handleSave = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveDailyGoals(goals);
    showToast('Goals saved!', 'success');
  }, [goals, showToast]);

  const updateGoalField = useCallback((key: keyof DailyGoals, text: string) => {
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= 0) {
      setGoals(prev => ({ ...prev, [key]: num }));
    } else if (text === '') {
      setGoals(prev => ({ ...prev, [key]: 0 }));
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <Pressable style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View>
              <Text style={styles.pageTitle}>My Goals</Text>
              <Text style={styles.pageSubtitle}>Personalise your daily nutrition targets.</Text>
            </View>

            {/* Mode tabs */}
            <View style={styles.tabs} accessibilityRole="tablist">
              {(['calculator', 'manual'] as Mode[]).map(m => (
                <TouchableOpacity
                  key={m}
                  onPress={() => handleModeSwitch(m)}
                  style={[styles.tab, mode === m && styles.tabActive]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: mode === m }}
                >
                  <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                    {m === 'calculator' ? 'TDEE Calculator' : 'Manual Entry'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* TDEE Calculator */}
            {mode === 'calculator' && (
              <View style={styles.section}>
                {/* Sex */}
                <View>
                  <Text style={styles.fieldLabel}>Sex</Text>
                  <View style={styles.pillRow}>
                    {(['male', 'female'] as Sex[]).map(s => (
                      <TouchableOpacity
                        key={s}
                        onPress={() => setProfile(p => ({ ...p, sex: s }))}
                        style={[styles.selPill, profile.sex === s && styles.selPillActive]}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: profile.sex === s }}
                      >
                        <Text style={[styles.selPillText, profile.sex === s && styles.selPillTextActive]}>
                          {s === 'male' ? 'Male' : 'Female'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Age / Weight / Height */}
                <View style={styles.numericRow}>
                  {([
                    { key: 'age',      label: 'Age',    unit: 'yrs' },
                    { key: 'weightKg', label: 'Weight', unit: 'kg'  },
                    { key: 'heightCm', label: 'Height', unit: 'cm'  },
                  ] as const).map(({ key, label, unit }) => (
                    <View key={key} style={styles.numericField}>
                      <Text style={styles.fieldLabel}>{label}</Text>
                      <View style={styles.numericInputWrapper}>
                        <TextInput
                          keyboardType="numeric"
                          value={String(profile[key])}
                          onChangeText={text => {
                            const n = parseInt(text, 10);
                            if (!isNaN(n)) setProfile(p => ({ ...p, [key]: n }));
                          }}
                          style={styles.numericInput}
                          accessibilityLabel={`${label} in ${unit}`}
                        />
                        <Text style={styles.numericUnit}>{unit}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Activity level */}
                <View>
                  <Text style={styles.fieldLabel}>Activity level</Text>
                  <View style={styles.activityList}>
                    {ACTIVITY_LEVELS.map(level => (
                      <TouchableOpacity
                        key={level}
                        onPress={() => setProfile(p => ({ ...p, activity: level }))}
                        style={[styles.activityRow, profile.activity === level && styles.activityRowActive]}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: profile.activity === level }}
                      >
                        <View style={[styles.radioCircle, profile.activity === level && styles.radioCircleActive]}>
                          {profile.activity === level && <View style={styles.radioInner} />}
                        </View>
                        <Text style={[styles.activityText, profile.activity === level && styles.activityTextActive]}>
                          {activityLabel(level)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Goal */}
                <View>
                  <Text style={styles.fieldLabel}>Goal</Text>
                  <View style={styles.pillRow}>
                    {GOALS.map(g => (
                      <TouchableOpacity
                        key={g}
                        onPress={() => setProfile(p => ({ ...p, goal: g }))}
                        style={[styles.selPill, profile.goal === g && styles.selPillActive, { flex: 1 }]}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: profile.goal === g }}
                      >
                        <Text style={[styles.selPillText, profile.goal === g && styles.selPillTextActive, { textAlign: 'center' }]}>
                          {goalLabel(g)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={applyCalculated}
                  style={styles.calcButton}
                  accessibilityRole="button"
                >
                  <Text style={styles.calcButtonText}>Calculate my targets</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Daily targets — shown in both modes */}
            <View style={styles.targetsCard}>
              <Text style={styles.sectionLabel}>Daily targets</Text>
              {GOAL_FIELDS.map(({ key, label, unit, color }) => (
                <View key={key} style={styles.targetRow}>
                  <View style={[styles.targetDot, { backgroundColor: color }]} />
                  <Text style={styles.targetLabel}>{label}</Text>
                  <View style={styles.targetInputWrapper}>
                    <TextInput
                      keyboardType="numeric"
                      value={String(goals[key])}
                      onChangeText={text => updateGoalField(key, text)}
                      style={styles.targetInput}
                      accessibilityLabel={`${label} goal in ${unit}`}
                    />
                    <Text style={styles.targetUnit}>{unit}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Save button */}
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveButton}
              accessibilityRole="button"
              accessibilityLabel="Save goals"
            >
              <Text style={styles.saveButtonText}>Save Goals</Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </Pressable>
      </KeyboardAvoidingView>

      {ToastView}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  flex: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },

  pageTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  pageSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 3 },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#1e293b' },

  section: { gap: 14 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  pillRow: { flexDirection: 'row', gap: 8 },
  selPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  selPillActive: { backgroundColor: '#f0fdf4', borderColor: '#16a34a' },
  selPillText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  selPillTextActive: { color: '#15803d' },

  numericRow: { flexDirection: 'row', gap: 10 },
  numericField: { flex: 1 },
  numericInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  numericInput: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1e293b' },
  numericUnit: { fontSize: 11, color: '#94a3b8' },

  activityList: { gap: 4 },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activityRowActive: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: { borderColor: '#16a34a' },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16a34a' },
  activityText: { flex: 1, fontSize: 13, color: '#475569' },
  activityTextActive: { color: '#15803d', fontWeight: '500' },

  calcButton: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  calcButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  targetsCard: {
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  targetRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  targetDot: { width: 8, height: 8, borderRadius: 4 },
  targetLabel: { fontSize: 13, fontWeight: '500', color: '#475569', width: 64 },
  targetInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  targetInput: { flex: 1, fontSize: 13, fontWeight: '700', color: '#1e293b' },
  targetUnit: { fontSize: 11, color: '#94a3b8' },

  saveButton: {
    backgroundColor: '#16a34a',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
