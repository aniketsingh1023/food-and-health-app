import Link from 'next/link';
import { HeroIllustration } from '@/components/illustrations/HeroIllustration';
import { AnalyseIllustration } from '@/components/illustrations/AnalyseIllustration';
import { HabitsIllustration } from '@/components/illustrations/HabitsIllustration';
import { InsightsIllustration } from '@/components/illustrations/InsightsIllustration';

const FEATURES = [
  {
    title: 'Instant food analysis',
    description: 'Describe any meal in plain English. Gemini AI breaks it down into calories, macros, a health grade, and a personalised tip — in under 2 seconds.',
    Illustration: AnalyseIllustration,
    badge: 'Gemini Flash',
    badgeColor: 'bg-green-50 text-green-700',
  },
  {
    title: 'Habit tracking that sticks',
    description: 'Five science-backed daily habits. One tap to check off. A weekly trend view shows exactly where you are consistent and where you slip.',
    Illustration: HabitsIllustration,
    badge: 'Daily streaks',
    badgeColor: 'bg-blue-50 text-blue-700',
  },
  {
    title: 'Weekly AI insights',
    description: 'Every week, Gemini Pro reviews your logs and habits, scores your week 1–10, highlights wins, and gives you one clear action to improve.',
    Illustration: InsightsIllustration,
    badge: 'Gemini Pro',
    badgeColor: 'bg-amber-50 text-amber-700',
  },
] as const;

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Set your goals',
    desc: 'Enter your age, weight, and activity level. We calculate your personalised calorie and macro targets using the Mifflin-St Jeor equation.',
  },
  {
    step: '02',
    title: 'Log what you eat',
    desc: 'Just describe your meal. No barcode scanning, no searching databases. AI understands "chicken rice bowl with avocado" instantly.',
  },
  {
    step: '03',
    title: 'Get smarter over time',
    desc: 'Your weekly insights become more relevant as you log more. The AI learns your patterns and adjusts suggestions to fit your real life.',
  },
] as const;

const STATS = [
  { value: '2s',   label: 'Average analysis time' },
  { value: 'A–F',  label: 'Nutrition grading system' },
  { value: '5',    label: 'Daily habits tracked' },
  { value: '100%', label: 'Private — stored locally' },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-800">NutriAI</span>
          </div>
          <nav aria-label="Site navigation" className="flex items-center gap-4">
            <a href="#features" className="hidden sm:block text-sm text-slate-500 hover:text-slate-800 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-600 rounded">
              Features
            </a>
            <a href="#how-it-works" className="hidden sm:block text-sm text-slate-500 hover:text-slate-800 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-600 rounded">
              How it works
            </a>
            <Link
              href="/dashboard"
              className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-green-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
            >
              Open app
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-5 pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
              Powered by Gemini AI
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Eat smarter.<br />
              <span className="text-green-600">Live better.</span>
            </h1>

            <p className="text-lg text-slate-500 leading-relaxed max-w-md">
              Describe any meal in plain English. Get instant nutrition analysis, a health grade, and personalised suggestions — all powered by Gemini AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-green-600 text-white font-semibold px-6 py-3.5 rounded-2xl hover:bg-green-700 transition-colors text-sm outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
                aria-label="Start tracking your nutrition"
              >
                Start tracking — it&apos;s free
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-600 font-semibold px-6 py-3.5 rounded-2xl hover:border-slate-300 transition-colors text-sm outline-none focus-visible:ring-2 focus-visible:ring-green-600"
              >
                See how it works
              </a>
            </div>

            <p className="text-xs text-slate-400">
              No account needed. Your data stays on your device.
            </p>
          </div>

          {/* Right — hero illustration */}
          <div className="flex items-center justify-center">
            <HeroIllustration className="w-full max-w-sm md:max-w-none" />
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-slate-900 py-8" aria-label="Key statistics">
        <div className="max-w-5xl mx-auto px-5">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <dt className="text-2xl font-extrabold text-white tabular-nums">{value}</dt>
                <dd className="text-xs text-slate-400 mt-1">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-5xl mx-auto px-5 py-16 md:py-24" aria-labelledby="features-heading">
        <div className="text-center mb-12">
          <h2 id="features-heading" className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Everything you need to eat better
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Built around AI from the ground up — not bolted on as a feature.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(({ title, description, Illustration, badge, badgeColor }) => (
            <article
              key={title}
              className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-5 hover:shadow-md transition-shadow"
              style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
            >
              <div className="bg-slate-50 rounded-2xl p-4 aspect-video flex items-center justify-center">
                <Illustration className="w-full h-full max-h-36" />
              </div>
              <div className="space-y-2">
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
                  {badge}
                </span>
                <h3 className="text-base font-bold text-slate-800">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-slate-50 py-16 md:py-24" aria-labelledby="how-heading">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 id="how-heading" className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Up and running in 60 seconds
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shrink-0" aria-hidden="true">
                  <span className="text-xs font-extrabold text-white">{step}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-5xl mx-auto px-5 py-16 md:py-24 text-center" aria-labelledby="cta-heading">
        <div className="bg-green-600 rounded-3xl px-8 py-12 space-y-6">
          <h2 id="cta-heading" className="text-3xl font-extrabold text-white tracking-tight">
            Ready to eat smarter?
          </h2>
          <p className="text-green-100 max-w-md mx-auto">
            Start logging your meals in under a minute. No account, no credit card, no friction.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-8 py-4 rounded-2xl hover:bg-green-50 transition-colors text-sm outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-green-600"
          >
            Open NutriAI
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 py-6" role="contentinfo">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-green-600 flex items-center justify-center" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <span className="text-xs font-bold text-slate-700">NutriAI</span>
          </div>
          <p className="text-xs text-slate-400">
            Built with Next.js · Gemini AI · Your data never leaves your device.
          </p>
        </div>
      </footer>
    </div>
  );
}
