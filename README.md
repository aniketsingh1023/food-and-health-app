# NutriAI — Smart Food Intelligence

AI-powered nutrition tracking app. Log meals in plain English, get instant Gemini-powered analysis, track habits, chat with an AI coach, and receive weekly insights.

**Live:** https://nutriai-lqiuisolqq-el.a.run.app

---

## Features

| Feature | Description |
|---------|-------------|
| **Food Analysis** | Describe any meal in plain English — Gemini returns calories, macros, a health grade (A–F), and a personalised tip in under 2 seconds |
| **AI Coach (Chat)** | Streaming chat with a nutrition coach that knows your daily intake and recent meals |
| **Meal Suggestions** | AI picks the best next meal based on your remaining macros and time of day |
| **Habit Tracking** | 5 daily habits with streak tracking and a 7-day trend view |
| **Weekly Insights** | Gemini Pro reviews your week, scores it 1–10, and gives one clear action |
| **TDEE Calculator** | Mifflin-St Jeor BMR/TDEE with personalised macro targets |
| **100% Private** | All data stored locally in the browser — no account, no server DB |

---

## Tech Stack

**Frontend**
- Next.js 16 (App Router, Turbopack)
- TypeScript, Tailwind CSS v4
- Plus Jakarta Sans + Inter

**AI**
- Gemini 2.5 Flash — food analysis, meal suggestions, chat
- Gemini 2.5 Pro — weekly insights
- Auto-retry with fallback to Gemini 2.0 Flash on 503/429

**Mobile**
- Expo (React Native) — iOS & Android

**Infrastructure**
- Google Cloud Run (asia-south1)
- Docker multi-stage build (Node 20 Alpine, standalone output)
- GitHub Actions CI/CD — tests → type-check → build → deploy

---

## Architecture

```
Browser / Expo App
       │
       ▼
Next.js 16 App Router  (Cloud Run · asia-south1)
       │
  ┌────┴─────────────────────────┐
  │  /api/analyze-food           │
  │  /api/suggest-meal           │  ──▶  Gemini 2.5 Flash
  │  /api/weekly-insights        │  ──▶  Gemini 2.5 Pro
  │  /api/chat  (SSE stream)     │  ──▶  Gemini 2.5 Flash
  └──────────────────────────────┘
       │
  localStorage (client-side only)
  Food log · Habits · Goals
```

---

## Local Development

```bash
git clone https://github.com/aniketsingh1023/food-and-health-app.git
cd food-and-health-app/web
npm install

# Set env
echo "GEMINI_API_KEY=your_key" > .env.local

npm run dev        # http://localhost:3000
npm test           # Jest suite
npx tsc --noEmit   # Type check
```

---

## Deploy

Every push to `main` auto-deploys via GitHub Actions:

1. **Test** — Jest + TypeScript check
2. **Build** — Docker multi-stage build
3. **Push** — `gcr.io/amd-hackathon-492909/nutriai`
4. **Deploy** — `gcloud run deploy` → asia-south1

Required GitHub secrets: `GCP_PROJECT_ID`, `GCP_SA_KEY`, `GEMINI_API_KEY`

---

## Project Structure

```
food-and-health-app/
├── web/                    # Next.js app
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── dashboard/      # Daily macro overview
│   │   ├── log/            # Food logging
│   │   ├── suggest/        # AI meal suggestions
│   │   ├── chat/           # AI nutrition coach (streaming)
│   │   ├── habits/         # Daily habit tracker
│   │   ├── insights/       # Weekly AI review
│   │   ├── goals/          # TDEE + macro goals
│   │   └── api/            # Gemini API routes
│   ├── components/         # Nav, FoodCard, MacroRing, etc.
│   ├── hooks/              # useFoodLog, useHabits, useDailyStats
│   ├── lib/                # gemini.ts, storage.ts, nutritionCalc.ts
│   ├── services/           # API client wrappers
│   └── types/              # Shared TypeScript interfaces
├── mobile/                 # Expo React Native app
├── Dockerfile              # Multi-stage Cloud Run image
└── .github/workflows/      # CI/CD pipeline
```
