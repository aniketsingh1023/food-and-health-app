'use client';

import { useState } from 'react';
import { WeeklyInsight } from '@/types';
import { getRecentFoodLog, getWeeklyHabitLogs, getDailyGoals } from '@/lib/storage';
import { getWeeklyInsights } from '@/services/insightsService';

function ScoreMeter({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color = score >= 8 ? '#16a34a' : score >= 5 ? '#f59e0b' : '#ef4444';
  const label = score >= 8 ? 'Great week' : score >= 5 ? 'Average week' : 'Needs work';
  return (
    <div className="flex items-center gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white shrink-0"
        style={{ backgroundColor: color }}
        aria-label={`Overall score: ${score} out of 10`}
      >
        <span className="text-2xl font-bold leading-none">{score}</span>
        <span className="text-[9px] font-medium opacity-80">/10</span>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <div className="mt-2 w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [insight, setInsight] = useState<WeeklyInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchInsights() {
    setLoading(true);
    setError(null);
    try {
      const data = await getWeeklyInsights({
        weeklyLogs: getRecentFoodLog(7),
        habitLogs: getWeeklyHabitLogs(),
        goals: getDailyGoals(),
      });
      setInsight(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error — check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 px-4 py-5 pb-24 md:pb-8 max-w-2xl mx-auto w-full space-y-5">

      <div>
        <h1 className="text-xl font-bold text-slate-800">Weekly Insights</h1>
        <p className="text-sm text-slate-400 mt-0.5">AI analysis of your last 7 days.</p>
      </div>

      {!insight ? (
        <div
          className="bg-white rounded-2xl border border-slate-100 p-8 text-center space-y-4"
          style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Ready to review your week?</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Gemini Pro will analyse your food logs, habits, and macro trends to give you actionable insights.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchInsights}
            disabled={loading}
            aria-busy={loading}
            className="bg-green-600 text-white font-semibold px-8 py-3 rounded-xl text-sm
              hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
              outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 transition-colors"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                Analysing…
              </span>
            ) : 'Generate Insights'}
          </button>
          {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
        </div>
      ) : (
        <div className="space-y-4" aria-live="polite">

          {/* Score card */}
          <section
            className="bg-white rounded-2xl border border-slate-100 p-5"
            style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
            aria-labelledby="score-heading"
          >
            <h2 id="score-heading" className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Overall score</h2>
            <ScoreMeter score={insight.overallScore} />
            <p className="text-sm text-slate-600 mt-4 leading-relaxed">{insight.summary}</p>
          </section>

          {/* Highlights */}
          <section
            className="bg-white rounded-2xl border border-slate-100 p-4"
            style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
            aria-labelledby="highlights-heading"
          >
            <h2 id="highlights-heading" className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3">
              What went well
            </h2>
            <ul className="space-y-2" aria-label="Weekly highlights">
              {insight.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                    <svg width="8" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </section>

          {/* Improvements */}
          <section
            className="bg-white rounded-2xl border border-slate-100 p-4"
            style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
            aria-labelledby="improvements-heading"
          >
            <h2 id="improvements-heading" className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3">
              Areas to improve
            </h2>
            <ul className="space-y-2" aria-label="Areas for improvement">
              {insight.improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="w-4 h-4 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                    </svg>
                  </span>
                  {imp}
                </li>
              ))}
            </ul>
          </section>

          {/* Actionable tip */}
          <section
            className="bg-green-600 rounded-2xl p-5"
            aria-labelledby="tip-heading"
          >
            <h2 id="tip-heading" className="text-xs font-semibold text-green-200 uppercase tracking-wider mb-2">
              This week&apos;s action
            </h2>
            <p className="text-sm text-white leading-relaxed font-medium">{insight.actionableTip}</p>
          </section>

          <button
            type="button"
            onClick={fetchInsights}
            disabled={loading}
            className="w-full border-2 border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm
              hover:border-green-400 hover:text-green-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-600"
          >
            Regenerate
          </button>
        </div>
      )}
    </main>
  );
}
