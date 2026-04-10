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
    badgeColor: 'bg-green-50 text-green-700 border-green-100',
  },
  {
    title: 'Habit tracking that sticks',
    description: 'Five science-backed daily habits. One tap to check off. A weekly trend view shows exactly where you are consistent and where you slip.',
    Illustration: HabitsIllustration,
    badge: 'Daily streaks',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  {
    title: 'Weekly AI insights',
    description: 'Every week, Gemini Pro reviews your logs and habits, scores your week 1–10, highlights wins, and gives you one clear action to improve.',
    Illustration: InsightsIllustration,
    badge: 'Gemini Pro',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-100',
  },
] as const;

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Set your goals',
    desc: 'Enter your age, weight, and activity level. We calculate personalised calorie and macro targets using the Mifflin-St Jeor equation.',
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
  { value: '< 2s',  label: 'Average analysis time' },
  { value: 'A–F',  label: 'Nutrition grading' },
  { value: '5',    label: 'Daily habits tracked' },
  { value: '100%', label: 'Private & local' },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-jakarta), var(--font-inter), system-ui, sans-serif' }}>

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center shadow-sm" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">NutriAI</span>
          </div>
          <nav aria-label="Site navigation" className="flex items-center gap-6">
            <a href="#features" className="hidden sm:block text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hidden sm:block text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              How it works
            </a>
            <Link
              href="/dashboard"
              className="bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-colors shadow-sm"
            >
              Open app
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 60% 0%, rgba(134,239,172,0.18) 0%, transparent 70%)',
          }}
        />

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                Powered by Gemini AI
              </div>

              <div>
                <h1
                  className="text-[2.75rem] md:text-[3.5rem] font-extrabold text-slate-900 leading-[1.1] tracking-[-0.03em]"
                >
                  Eat smarter.<br />
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Live better.
                  </span>
                </h1>
              </div>

              <p className="text-lg text-slate-500 leading-relaxed max-w-105" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
                Describe any meal in plain English. Get instant nutrition analysis, a health grade, and personalised AI suggestions — no account needed.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2.5 bg-green-600 text-white font-bold px-7 py-4 rounded-2xl hover:bg-green-700 active:scale-[0.98] transition-all text-sm shadow-[0_4px_20px_rgba(22,163,74,0.35)]"
                  aria-label="Start tracking your nutrition for free"
                >
                  Start tracking — it&apos;s free
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-600 font-semibold px-6 py-4 rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition-colors text-sm"
                >
                  See how it works
                </a>
              </div>

              <p className="text-xs text-slate-400 font-medium" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
                No account needed &middot; Your data never leaves your device
              </p>
            </div>

            {/* Right — illustration */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <div
                  className="absolute inset-0 rounded-3xl"
                  aria-hidden="true"
                  style={{ background: 'radial-gradient(circle at 50% 50%, rgba(134,239,172,0.2) 0%, transparent 70%)' }}
                />
                <HeroIllustration className="w-full relative z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section
        className="py-10 border-y border-slate-100"
        style={{ background: 'linear-gradient(to right, #0f172a, #1e293b)' }}
        aria-label="Key statistics"
      >
        <div className="max-w-6xl mx-auto px-6">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label} className="space-y-1">
                <dt className="text-3xl font-extrabold text-white tabular-nums tracking-tight">{value}</dt>
                <dd className="text-xs text-slate-400 font-medium uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 md:py-28" aria-labelledby="features-heading">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>What you get</p>
          <h2 id="features-heading" className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-[-0.02em] leading-tight">
            Everything you need to eat better
          </h2>
          <p className="text-slate-500 mt-4 max-w-lg mx-auto text-base leading-relaxed" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
            Built around AI from the ground up — not bolted on as a feature.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map(({ title, description, Illustration, badge, badgeColor }) => (
            <article
              key={title}
              className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-5
                hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
            >
              <div className="bg-linear-to-br from-slate-50 to-slate-100/50 rounded-2xl p-4 aspect-video flex items-center justify-center">
                <Illustration className="w-full h-full max-h-36" />
              </div>
              <div className="space-y-2.5">
                <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${badgeColor}`}>
                  {badge}
                </span>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-20 md:py-28" aria-labelledby="how-heading"
        style={{ background: 'linear-gradient(to bottom, #f8fafc, #ffffff)' }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>Getting started</p>
            <h2 id="how-heading" className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-[-0.02em]">
              Up and running in 60 seconds
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10 md:gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <div key={step} className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-green-600 flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(22,163,74,0.3)]" aria-hidden="true">
                    <span className="text-xs font-extrabold text-white">{step}</span>
                  </div>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block flex-1 h-px bg-linear-to-r from-green-200 to-transparent" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 tracking-tight">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24" aria-labelledby="cta-heading">
        <div
          className="relative rounded-3xl px-8 py-14 text-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #15803d 0%, #16a34a 50%, #22c55e 100%)' }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-white/5 pointer-events-none" aria-hidden="true" />

          <div className="relative space-y-6">
            <h2 id="cta-heading" className="text-3xl md:text-4xl font-extrabold text-white tracking-[-0.02em]">
              Ready to eat smarter?
            </h2>
            <p className="text-green-100 max-w-md mx-auto text-base leading-relaxed" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
              Start logging your meals in under a minute. No account, no credit card, no friction.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 bg-white text-green-700 font-bold px-9 py-4 rounded-2xl
                hover:bg-green-50 active:scale-[0.98] transition-all text-sm
                shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
            >
              Open NutriAI — it&apos;s free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 py-8" role="contentinfo">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-green-600 flex items-center justify-center" aria-hidden="true">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-800">NutriAI</span>
          </div>
          <p className="text-xs text-slate-400" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
            Built with Next.js &middot; Gemini AI &middot; Your data never leaves your device.
          </p>
        </div>
      </footer>
    </div>
  );
}
