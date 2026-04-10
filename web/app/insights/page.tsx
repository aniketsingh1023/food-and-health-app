/**
 * Weekly Insights page — AI-generated health summary for the past 7 days.
 */

'use client';

import { useState } from 'react';
import { WeeklyInsight } from '@/types';
import { getRecentFoodLog, getWeeklyHabitLogs, getDailyGoals } from '@/lib/storage';

export default function InsightsPage() {
  const [insight, setInsight] = useState<WeeklyInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchInsights() {
    setIsLoading(true);
    setError(null);

    try {
      const weeklyLogs = getRecentFoodLog(7);
      const habitLogs = getWeeklyHabitLogs();
      const goals = getDailyGoals();

      const res = await fetch('/api/weekly-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklyLogs, habitLogs, goals }),
      });

      const { data, error: apiError } = await res.json() as {
        data: WeeklyInsight | null;
        error: string | null;
      };

      if (apiError || !data) {
        setError(apiError ?? 'Could not generate insights');
      } else {
        setInsight(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  }

  const scoreColor = insight
    ? insight.overallScore >= 8 ? '#00B894'
    : insight.overallScore >= 5 ? '#A8E6CF'
    : '#FF6B6B'
    : '#A8E6CF';

  return (
    <main className="flex-1 px-4 py-6 pb-24 md:pb-6 max-w-xl mx-auto w-full space-y-6">
      {/* Header */}
      <section aria-labelledby="insights-heading">
        <h1 id="insights-heading" className="text-xl font-bold text-slate-700">Weekly Insights</h1>
        <p className="text-sm text-slate-400 mt-0.5">AI summary of your last 7 days.</p>
      </section>

      {/* Generate button */}
      {!insight && (
        <div className="text-center space-y-4 py-8">
          <p className="text-5xl" role="img" aria-label="chart">📊</p>
          <p className="text-slate-500 text-sm">
            Let AI analyze your week and give you personalized health insights.
          </p>
          <button
            type="button"
            onClick={fetchInsights}
            disabled={isLoading}
            aria-busy={isLoading}
            className="bg-[#FF6B6B] text-white font-semibold px-8 py-3.5 rounded-2xl
              transition-all hover:bg-[#ff5252] disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF6B6B]"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                Analyzing your week…
              </span>
            ) : (
              '✨ Generate Insights'
            )}
          </button>
          {error && (
            <p className="text-sm text-[#FF6B6B]" role="alert">{error}</p>
          )}
        </div>
      )}

      {/* Insight display */}
      {insight && (
        <div className="space-y-4" aria-live="polite">
          {/* Score */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-sm"
              style={{ backgroundColor: scoreColor }}
              aria-label={`Overall score: ${insight.overallScore} out of 10`}
            >
              {insight.overallScore}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Overall Score</p>
              <p className="text-slate-600 text-sm mt-1 leading-relaxed">{insight.summary}</p>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-2">
            <h2 className="text-sm font-semibold text-[#00B894]">🏆 What went well</h2>
            <ul className="space-y-1.5" aria-label="Weekly highlights">
              {insight.highlights.map((h, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                  <span className="text-[#00B894] mt-0.5 flex-shrink-0" aria-hidden="true">✓</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-2">
            <h2 className="text-sm font-semibold text-[#FDCB6E]">📈 Areas to improve</h2>
            <ul className="space-y-1.5" aria-label="Areas for improvement">
              {insight.improvements.map((imp, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                  <span className="text-[#FDCB6E] mt-0.5 flex-shrink-0" aria-hidden="true">→</span>
                  {imp}
                </li>
              ))}
            </ul>
          </div>

          {/* Tip */}
          <div className="bg-[#A8E6CF]/15 border border-[#A8E6CF]/30 rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-slate-600 mb-1">💡 This week&apos;s tip</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{insight.actionableTip}</p>
          </div>

          {/* Regenerate */}
          <button
            type="button"
            onClick={fetchInsights}
            disabled={isLoading}
            className="w-full border-2 border-slate-200 text-slate-600 font-medium py-2.5 rounded-2xl
              hover:border-[#A8E6CF] transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8E6CF]"
          >
            Regenerate insights
          </button>
        </div>
      )}
    </main>
  );
}
