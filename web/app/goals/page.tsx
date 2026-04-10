'use client';

import { useState, useEffect } from 'react';
import { DailyGoals } from '@/types';
import { getDailyGoals, saveDailyGoals } from '@/lib/storage';
import {
  calculateGoals,
  activityLabel,
  goalLabel,
  UserProfile,
  Sex,
  ActivityLevel,
  Goal,
} from '@/lib/tdee';

const ACTIVITY_LEVELS: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
const GOALS: Goal[] = ['lose', 'maintain', 'gain'];

export default function GoalsPage() {
  const [mode, setMode] = useState<'manual' | 'calculator'>('calculator');
  const [saved, setSaved] = useState(false);
  const [goals, setGoals] = useState<DailyGoals>(getDailyGoals());

  // Calculator form state
  const [profile, setProfile] = useState<UserProfile>({
    age: 25,
    weightKg: 70,
    heightCm: 175,
    sex: 'male',
    activity: 'moderate',
    goal: 'maintain',
  });

  useEffect(() => {
    setGoals(getDailyGoals());
  }, []);

  function applyCalculated() {
    const calculated = calculateGoals(profile);
    setGoals(calculated);
  }

  function handleSave() {
    saveDailyGoals(goals);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="flex-1 px-4 py-5 pb-24 md:pb-8 max-w-2xl mx-auto w-full space-y-5">

      <div>
        <h1 className="text-xl font-bold text-slate-800">My Goals</h1>
        <p className="text-sm text-slate-400 mt-0.5">Personalise your daily nutrition targets.</p>
      </div>

      {/* Mode tabs */}
      <div className="flex bg-slate-100 rounded-xl p-1 gap-1" role="tablist" aria-label="Goal setting mode">
        {(['calculator', 'manual'] as const).map(m => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-green-600 ${
              mode === m ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {m === 'calculator' ? 'TDEE Calculator' : 'Manual entry'}
          </button>
        ))}
      </div>

      {mode === 'calculator' ? (
        <section className="space-y-4" aria-label="TDEE calculator">

          {/* Sex */}
          <fieldset>
            <legend className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sex</legend>
            <div className="grid grid-cols-2 gap-2">
              {(['male', 'female'] as Sex[]).map(s => (
                <label key={s} className="cursor-pointer">
                  <input type="radio" name="sex" value={s} checked={profile.sex === s} onChange={() => setProfile(p => ({ ...p, sex: s }))} className="sr-only" />
                  <span className={`block text-center py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    profile.sex === s ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-slate-200 text-slate-500'
                  }`}>
                    {s === 'male' ? 'Male' : 'Female'}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Age / Weight / Height */}
          <div className="grid grid-cols-3 gap-3">
            {([
              { key: 'age',       label: 'Age',    unit: 'yrs', min: 16, max: 90  },
              { key: 'weightKg',  label: 'Weight', unit: 'kg',  min: 30, max: 250 },
              { key: 'heightCm',  label: 'Height', unit: 'cm',  min: 100, max: 250 },
            ] as const).map(({ key, label, unit, min, max }) => (
              <div key={key}>
                <label htmlFor={key} className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  {label}
                </label>
                <div className="relative">
                  <input
                    id={key}
                    type="number"
                    value={profile[key]}
                    min={min}
                    max={max}
                    onChange={e => setProfile(p => ({ ...p, [key]: Number(e.target.value) }))}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-green-500 transition-colors pr-10 tabular-nums"
                    aria-label={`${label} in ${unit}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">{unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Activity level */}
          <fieldset>
            <legend className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Activity level</legend>
            <div className="space-y-1.5">
              {ACTIVITY_LEVELS.map(level => (
                <label key={level} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="activity"
                    value={level}
                    checked={profile.activity === level}
                    onChange={() => setProfile(p => ({ ...p, activity: level }))}
                    className="w-4 h-4 accent-green-600"
                    aria-label={activityLabel(level)}
                  />
                  <span className="text-sm text-slate-700">{activityLabel(level)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Goal */}
          <fieldset>
            <legend className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Goal</legend>
            <div className="grid grid-cols-3 gap-2">
              {GOALS.map(g => (
                <label key={g} className="cursor-pointer">
                  <input type="radio" name="goal" value={g} checked={profile.goal === g} onChange={() => setProfile(p => ({ ...p, goal: g }))} className="sr-only" />
                  <span className={`block text-center py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                    profile.goal === g ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-slate-200 text-slate-500'
                  }`}>
                    {goalLabel(g)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={applyCalculated}
            className="w-full bg-slate-800 text-white font-semibold py-3 rounded-xl text-sm hover:bg-slate-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:ring-offset-2"
          >
            Calculate my targets
          </button>
        </section>
      ) : null}

      {/* Goals preview / manual edit */}
      <section
        className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3"
        style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
        aria-labelledby="targets-heading"
      >
        <h2 id="targets-heading" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Daily targets
        </h2>

        {([
          { key: 'calories', label: 'Calories', unit: 'kcal', color: '#ef4444' },
          { key: 'protein',  label: 'Protein',  unit: 'g',   color: '#3b82f6' },
          { key: 'carbs',    label: 'Carbs',    unit: 'g',   color: '#f59e0b' },
          { key: 'fat',      label: 'Fat',      unit: 'g',   color: '#8b5cf6' },
          { key: 'fiber',    label: 'Fiber',    unit: 'g',   color: '#10b981' },
        ] as const).map(({ key, label, unit, color }) => (
          <div key={key} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
            <label htmlFor={`goal-${key}`} className="text-sm font-medium text-slate-700 w-20 shrink-0">{label}</label>
            <div className="flex-1 relative">
              <input
                id={`goal-${key}`}
                type="number"
                value={goals[key]}
                min={0}
                onChange={e => setGoals(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-800 outline-none focus:border-green-500 transition-colors pr-12 tabular-nums"
                aria-label={`${label} goal in ${unit}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">{unit}</span>
            </div>
          </div>
        ))}
      </section>

      <button
        type="button"
        onClick={handleSave}
        className="w-full bg-green-600 text-white font-semibold py-3.5 rounded-xl text-sm
          hover:bg-green-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
      >
        {saved ? 'Saved!' : 'Save goals'}
      </button>
    </main>
  );
}
