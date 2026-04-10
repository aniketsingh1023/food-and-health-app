/**
 * Card component displaying a logged food entry with its nutrition summary.
 */

'use client';

import { FoodLogEntry } from '@/types';

interface FoodCardProps {
  entry: FoodLogEntry;
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: '🌅 Breakfast',
  lunch: '☀️ Lunch',
  dinner: '🌙 Dinner',
  snack: '🍎 Snack',
};

const SCORE_COLOR: Record<number, string> = {
  1: '#FF6B6B', 2: '#FF6B6B', 3: '#FF6B6B',
  4: '#FDCB6E', 5: '#FDCB6E', 6: '#FDCB6E',
  7: '#A8E6CF', 8: '#A8E6CF', 9: '#00B894', 10: '#00B894',
};

/**
 * Renders a food log entry card with macros and health score.
 */
export function FoodCard({ entry }: FoodCardProps) {
  const { analysis, mealType, loggedAt } = entry;
  const time = new Date(loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const scoreColor = SCORE_COLOR[Math.round(analysis.healthScore)] ?? '#A8E6CF';

  return (
    <article
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3"
      aria-label={`Food entry: ${analysis.name}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400">{MEAL_LABELS[mealType] ?? mealType} · {time}</p>
          <h3 className="text-base font-semibold text-slate-700 truncate">{analysis.name}</h3>
          <p className="text-xs text-slate-400">{analysis.servingSize}</p>
        </div>
        {/* Health score badge */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
          style={{ backgroundColor: scoreColor }}
          aria-label={`Health score: ${analysis.healthScore} out of 10`}
        >
          {analysis.healthScore}
        </div>
      </div>

      {/* Macro pills */}
      <div className="flex flex-wrap gap-2" role="list" aria-label="Nutrition breakdown">
        <MacroPill label="Cal" value={analysis.macros.calories} unit="kcal" color="#FF6B6B" />
        <MacroPill label="Protein" value={analysis.macros.protein} unit="g" color="#74B9FF" />
        <MacroPill label="Carbs" value={analysis.macros.carbs} unit="g" color="#FDCB6E" />
        <MacroPill label="Fat" value={analysis.macros.fat} unit="g" color="#A29BFE" />
        <MacroPill label="Fiber" value={analysis.macros.fiber} unit="g" color="#A8E6CF" />
      </div>

      {/* Tip */}
      {analysis.tip && (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2 leading-relaxed">
          💡 {analysis.tip}
        </p>
      )}
    </article>
  );
}

interface MacroPillProps {
  label: string;
  value: number;
  unit: string;
  color: string;
}

function MacroPill({ label, value, unit, color }: MacroPillProps) {
  return (
    <div
      role="listitem"
      className="flex items-center gap-1 bg-slate-50 rounded-full px-2.5 py-1"
      aria-label={`${label}: ${Math.round(value)} ${unit}`}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="text-xs text-slate-600 font-medium">{label}</span>
      <span className="text-xs text-slate-500">{Math.round(value)}{unit}</span>
    </div>
  );
}
