/**
 * Insights screen — weekly AI analysis of food logs and habits.
 * Persists last-generated insight; shows "generated X ago" label.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useToast } from '../components/Toast';
import { getWeeklyInsights } from '../services/insightsService';
import {
  getRecentFoodLog,
  getWeeklyHabitLogs,
  getDailyGoals,
  getLastInsight,
  saveLastInsight,
} from '../lib/storage';
import type { WeeklyInsight } from '../types';

function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  return `${diffDays} days ago`;
}

function ScoreMeter({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color = score >= 8 ? '#16a34a' : score >= 5 ? '#f59e0b' : '#ef4444';
  const label = score >= 8 ? 'Great week' : score >= 5 ? 'Average week' : 'Needs work';
  return (
    <View style={styles.scoreMeter} accessibilityLabel={`Overall score: ${score} out of 10`}>
      <View style={[styles.scoreCircle, { backgroundColor: color }]}>
        <Text style={styles.scoreNumber}>{score}</Text>
        <Text style={styles.scoreMax}>/10</Text>
      </View>
      <View style={styles.scoreRight}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <View style={styles.scoreBarTrack}>
          <View style={[styles.scoreBarFill, { width: `${pct}%` as unknown as number, backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

export default function InsightsScreen() {
  const [insight, setInsight] = useState<WeeklyInsight | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast, ToastView } = useToast();

  // Restore persisted insight on mount
  useEffect(() => {
    getLastInsight().then(persisted => {
      if (persisted) {
        setInsight(persisted.insight);
        setGeneratedAt(persisted.generatedAt);
      }
    });
  }, []);

  const fetchInsights = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);
    try {
      const [weeklyLogs, habitLogs, goals] = await Promise.all([
        getRecentFoodLog(7),
        getWeeklyHabitLogs(),
        getDailyGoals(),
      ]);
      const data = await getWeeklyInsights({ weeklyLogs, habitLogs, goals });
      await saveLastInsight(data);
      setInsight(data);
      setGeneratedAt(new Date().toISOString());
      showToast('Insights generated!', 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error — check your connection.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View>
          <Text style={styles.pageTitle}>Weekly Insights</Text>
          <Text style={styles.pageSubtitle}>AI analysis of your last 7 days.</Text>
        </View>

        {!insight ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconBox}>
              <Text style={{ fontSize: 28 }}>📊</Text>
            </View>
            <Text style={styles.emptyTitle}>Ready to review your week?</Text>
            <Text style={styles.emptyHint}>
              Gemini will analyse your food logs, habits, and macro trends to give you actionable insights.
            </Text>
            <TouchableOpacity
              onPress={fetchInsights}
              disabled={loading}
              style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
              accessibilityRole="button"
              accessibilityState={{ disabled: loading, busy: loading }}
            >
              {loading ? (
                <View style={styles.ctaContent}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.ctaButtonText}>Analysing...</Text>
                </View>
              ) : (
                <Text style={styles.ctaButtonText}>Generate Insights</Text>
              )}
            </TouchableOpacity>
            {error && <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>}
          </View>
        ) : (
          <View accessibilityLiveRegion="polite">
            {/* Score card */}
            <View style={[styles.card, { marginBottom: 12 }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionLabel}>Overall score</Text>
                {generatedAt && (
                  <Text style={styles.generatedAt}>Generated {formatRelativeDate(generatedAt)}</Text>
                )}
              </View>
              <ScoreMeter score={insight.overallScore} />
              <Text style={styles.summaryText}>{insight.summary}</Text>
            </View>

            {/* Highlights */}
            <View style={[styles.card, { marginBottom: 12 }]}>
              <Text style={[styles.sectionLabel, { color: '#16a34a' }]}>What went well</Text>
              <View style={styles.listItems} accessibilityLabel="Weekly highlights">
                {insight.highlights.map((h, i) => (
                  <View key={i} style={styles.listItem}>
                    <View style={styles.listDotGreen} />
                    <Text style={styles.listItemText}>{h}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Improvements */}
            <View style={[styles.card, { marginBottom: 12 }]}>
              <Text style={[styles.sectionLabel, { color: '#d97706' }]}>Areas to improve</Text>
              <View style={styles.listItems} accessibilityLabel="Areas for improvement">
                {insight.improvements.map((imp, i) => (
                  <View key={i} style={styles.listItem}>
                    <View style={styles.listDotAmber} />
                    <Text style={styles.listItemText}>{imp}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Actionable tip */}
            <View style={[styles.actionTipCard, { marginBottom: 12 }]}>
              <Text style={styles.actionTipLabel}>This week's action</Text>
              <Text style={styles.actionTipText}>{insight.actionableTip}</Text>
            </View>

            {/* Regenerate */}
            <TouchableOpacity
              onPress={fetchInsights}
              disabled={loading}
              style={[styles.outlineButton, loading && { opacity: 0.5 }]}
              accessibilityRole="button"
            >
              {loading ? (
                <View style={styles.ctaContent}>
                  <ActivityIndicator color="#64748b" size="small" />
                  <Text style={styles.outlineButtonText}>Regenerating...</Text>
                </View>
              ) : (
                <Text style={styles.outlineButtonText}>Regenerate</Text>
              )}
            </TouchableOpacity>
            {error && <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>}
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  generatedAt: { fontSize: 10, color: '#94a3b8' },
  summaryText: { fontSize: 13, color: '#475569', lineHeight: 19 },

  scoreMeter: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', lineHeight: 26 },
  scoreMax: { fontSize: 9, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  scoreRight: { flex: 1, gap: 6 },
  scoreLabel: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  scoreBarTrack: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 3 },

  listItems: { gap: 8 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  listDotGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16a34a', marginTop: 4, flexShrink: 0 },
  listDotAmber: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#d97706', marginTop: 4, flexShrink: 0 },
  listItemText: { flex: 1, fontSize: 13, color: '#475569', lineHeight: 19 },

  actionTipCard: {
    backgroundColor: '#16a34a',
    borderRadius: 18,
    padding: 18,
    gap: 6,
  },
  actionTipLabel: { fontSize: 10, fontWeight: '600', color: '#bbf7d0', textTransform: 'uppercase', letterSpacing: 0.5 },
  actionTipText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600', lineHeight: 20 },

  outlineButton: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineButtonText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  ctaContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b', textAlign: 'center' },
  emptyHint: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 8,
  },
  ctaButton: {
    backgroundColor: '#16a34a',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 13,
    marginTop: 4,
  },
  ctaButtonDisabled: { opacity: 0.5 },
  ctaButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  errorText: { fontSize: 12, color: '#ef4444', textAlign: 'center' },
});
