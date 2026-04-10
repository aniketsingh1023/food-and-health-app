'use client';

import { FoodLogEntry } from '@/types';
import { NutritionGrade } from './NutritionGrade';

interface FoodCardProps {
  entry: FoodLogEntry;
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const MACROS = [
  { key: 'calories' as const, label: 'Cal',    unit: 'kcal', color: '#ef4444' },
  { key: 'protein'  as const, label: 'Protein', unit: 'g',   color: '#3b82f6' },
  { key: 'carbs'    as const, label: 'Carbs',   unit: 'g',   color: '#f59e0b' },
  { key: 'fat'      as const, label: 'Fat',     unit: 'g',   color: '#8b5cf6' },
  { key: 'fiber'    as const, label: 'Fiber',   unit: 'g',   color: '#10b981' },
];

export function FoodCard({ entry }: FoodCardProps) {
  const { analysis, mealType, loggedAt } = entry;
  const time = new Date(loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <article
      className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      aria-label={`Food entry: ${analysis.name}`}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {MEAL_LABELS[mealType] ?? mealType}
            </span>
            <span className="text-[10px] text-slate-300">{time}</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-800 leading-snug">
            {analysis.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{analysis.servingSize}</p>
        </div>
        <NutritionGrade score={analysis.healthScore} size="md" />
      </div>

      {/* Macro row */}
      <div
        className="grid grid-cols-5 gap-1.5"
        role="list"
        aria-label="Nutrition breakdown"
      >
        {MACROS.map(m => (
          <div
            key={m.key}
            role="listitem"
            className="bg-slate-50 rounded-xl p-2 text-center"
            aria-label={`${m.label}: ${Math.round(analysis.macros[m.key])} ${m.unit}`}
          >
            <div
              className="w-1.5 h-1.5 rounded-full mx-auto mb-1"
              style={{ backgroundColor: m.color }}
              aria-hidden="true"
            />
            <p className="text-xs font-bold text-slate-700 tabular-nums leading-none">
              {Math.round(analysis.macros[m.key])}
            </p>
            <p className="text-[9px] text-slate-400 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* AI tip */}
      {analysis.tip && (
        <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2">
          <p className="text-[11px] text-green-800 leading-relaxed">
            <span className="font-semibold">AI tip: </span>{analysis.tip}
          </p>
        </div>
      )}
    </article>
  );
}
