# NutriAI — Smart Food Intelligence

AI-powered food tracking app. Log meals in plain English, get instant Gemini-powered nutrition analysis, track daily habits, and receive personalized weekly insights.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                                                                  │
│  ┌───────────┐   ┌──────────┐   ┌──────────┐   ┌────────────┐  │
│  │ Dashboard │   │ Log Food │   │  Habits  │   │   Goals    │  │
│  │ MacroRings│   │  /log    │   │ /habits  │   │  TDEE Calc │  │
│  │ Streak    │   │          │   │          │   │  /goals    │  │
│  └─────┬─────┘   └────┬─────┘   └────┬─────┘   └─────┬──────┘  │
│        │              │              │               │          │
│        └──────────────┴──────────────┘               │          │
│                       │  hooks (useFoodLog,          │          │
│                       │  useDailyStats, useHabits)   │          │
│                       ▼                              ▼          │
│              ┌─────────────────┐          ┌─────────────────┐   │
│              │   localStorage  │◄─────────│  storage.ts     │   │
│              │  fh_food_log    │          │  (SSR-safe)     │   │
│              │  fh_habit_logs  │          └─────────────────┘   │
│              │  fh_goals       │                                 │
│              │  fh_streak      │                                 │
│              └─────────────────┘                                 │
└──────────────────────────────────────────────────────────────────┘
                              │ HTTP/SSE
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                     NEXT.JS API ROUTES                           │
│                                                                  │
│  POST /api/analyze-food     → Gemini 1.5 Flash  (food macros)   │
│  POST /api/suggest-meal     → Gemini 1.5 Flash  (meal ideas)    │
│  POST /api/weekly-insights  → Gemini 1.5 Pro    (deep analysis) │
│  POST /api/chat             → Gemini 1.5 Flash  (SSE stream)    │
│                                                                  │
│              ┌──────────────────────────────┐                   │
│              │        lib/gemini.ts         │                   │
│              │  In-memory food cache (Map)  │                   │
│              └──────────────┬───────────────┘                   │
└─────────────────────────────┼────────────────────────────────────┘
                              │ HTTPS
                              ▼
                   ┌──────────────────┐
                   │   Google Gemini  │
                   │  Flash: fast ops │
                   │  Pro: insights   │
                   └──────────────────┘
```

### Request Data Flow

```
User types "2 eggs and toast"
      │
      ▼
  /log page
  useFoodLog hook
      │
      ▼
  foodService.ts  →  POST /api/analyze-food
                          │
                    Check cache (Map)
                          │ miss
                          ▼
                    Gemini 1.5 Flash
                    "Return JSON: {name,
                     macros, healthScore,
                     tip, ingredients}"
                          │
                          ▼
                    FoodLogEntry saved
                    to localStorage
                          │
                          ▼
                    Dashboard re-renders
                    MacroRings + FoodCards
```

### Chat Streaming Flow

```
User: "How am I doing on protein?"
      │
      ▼
  chatService.ts  →  POST /api/chat
                          │
                    Inject context:
                    {meals, macros, habits}
                    into system prompt
                          │
                          ▼
                    Gemini streamGenerateContent
                          │
                          ▼ SSE chunks
                    ReadableStream →
                    UI appends text
                    in real-time
```

---

## Deployment

### Option A: GCP VM + GitHub Actions (default)

```
┌─────────────┐   push    ┌──────────────────────────┐
│ GitHub main │ ─────────►│     GitHub Actions        │
└─────────────┘           │                          │
                          │  1. npm ci               │
                          │  2. npm test (58 tests)  │
                          │  3. npx tsc --noEmit     │
                          │  4. SSH → GCP VM         │
                          └────────────┬─────────────┘
                                       │ SSH
                                       ▼
                          ┌────────────────────────┐
                          │       GCP VM           │
                          │                        │
                          │  Nginx (port 80)       │
                          │    └► Node (port 3000) │
                          │         └► PM2         │
                          └────────────────────────┘
```

### Option B: GCP Cloud Run (Docker)

```
┌─────────────┐   push    ┌──────────────────────────┐
│ GitHub main │ ─────────►│     GCP Cloud Build       │
└─────────────┘           │                          │
                          │  1. Docker build         │
                          │     (multi-stage)        │
                          │  2. Push → Artifact      │
                          │     Registry             │
                          │  3. Deploy → Cloud Run   │
                          └────────────┬─────────────┘
                                       │
                                       ▼
                          ┌────────────────────────┐
                          │     Google Cloud Run   │
                          │  Auto-scaling (0-3)    │
                          │  512MiB / 1 CPU        │
                          │  GEMINI_API_KEY from   │
                          │  Secret Manager        │
                          └────────────────────────┘
```

---

## Quick Start

```bash
cd web
npm install
cp ../.env.example .env.local   # add GEMINI_API_KEY
npm run dev                     # http://localhost:3000
npm test                        # 58 tests
```

---

## Features

| Page | Description |
|------|-------------|
| `/dashboard` | Calorie card, 4 macro rings, streak counter, today's food log |
| `/log` | Plain-text food entry → Gemini analysis (macros, health score 1–10, tip) |
| `/suggest` | Context-aware meal ideas using remaining daily macros + time of day |
| `/insights` | Gemini Pro weekly summary: highlights, improvements, actionable tip, score |
| `/habits` | 5 daily habits with weekly trend grid (hydration, breakfast, fruits, steps, sleep) |
| `/chat` | Streaming chat with AI nutrition coach, injected with current meal context |
| `/goals` | Mifflin-St Jeor TDEE calculator + manual macro target editor |

---

## Stack

| Layer | Technology |
|-------|------------|
| Web | Next.js 16, React 19, TypeScript 5, Tailwind 4 |
| Mobile | Expo 51, React Native 0.74, Expo Router 3 |
| AI | Gemini 1.5 Flash (speed), Gemini 1.5 Pro (insights) |
| Storage | Browser localStorage — no backend database |
| Deployment | GCP VM + Nginx + PM2 **or** Cloud Run (Docker) |
| CI/CD | GitHub Actions → SSH deploy |
| Testing | Jest 30, Testing Library, ts-jest (58 tests) |

---

## Project Structure

```
Food-and-health-app/
├── web/
│   ├── app/
│   │   ├── page.tsx                 # Landing page
│   │   ├── dashboard/page.tsx       # Main dashboard
│   │   ├── log/page.tsx             # Food logger
│   │   ├── suggest/page.tsx         # Meal suggestions
│   │   ├── insights/page.tsx        # Weekly insights
│   │   ├── habits/page.tsx          # Habit tracker
│   │   ├── chat/page.tsx            # AI chat coach
│   │   ├── goals/page.tsx           # Goal & TDEE editor
│   │   └── api/
│   │       ├── analyze-food/        # Gemini food analysis
│   │       ├── suggest-meal/        # Gemini meal suggestions
│   │       ├── weekly-insights/     # Gemini Pro insights
│   │       └── chat/                # Gemini streaming chat
│   ├── components/                  # MacroRing, FoodCard, Nav…
│   ├── hooks/                       # useFoodLog, useDailyStats, useHabits
│   ├── lib/                         # gemini.ts, nutritionCalc.ts, tdee.ts, storage.ts
│   ├── services/                    # API wrappers (foodService, chatService…)
│   └── types/index.ts               # All TypeScript interfaces
├── mobile/                          # Expo app (Dashboard, Log, Habits)
├── Dockerfile                       # Multi-stage Node build
├── cloudbuild.yaml                  # GCP Cloud Build config
└── .github/workflows/deploy.yml     # CI/CD pipeline
```

---

## API Endpoints

| Endpoint | Model | Notes |
|----------|-------|-------|
| `POST /api/analyze-food` | Flash | In-memory cache; returns `{name, macros, healthScore, tip}` |
| `POST /api/suggest-meal` | Flash | Uses remaining macros (goals − consumed) + time of day |
| `POST /api/weekly-insights` | Pro | Aggregates 7 days of food + habits; ~5–10s |
| `POST /api/chat` | Flash | SSE streaming; context injected into system prompt |

All responses: `{ data: T | null, error: string | null }`

---

## Environment Variables

```env
GEMINI_API_KEY=          # Required — from https://aistudio.google.com
NEXT_PUBLIC_APP_URL=     # Optional — for absolute API URLs
```

### GitHub Actions Secrets

| Secret | Value |
|--------|-------|
| `SERVER_HOST` | GCP VM IP or domain |
| `SERVER_USER` | SSH username (e.g. `ubuntu`) |
| `SSH_PRIVATE_KEY` | Private SSH key |
| `GEMINI_API_KEY` | Gemini API key |

---

## Server Setup (one-time, GCP VM)

```bash
sudo apt update && sudo apt install -y nginx nodejs npm
npm install -g pm2 napi-postinstall
git clone https://github.com/aniketsingh1023/food-and-health-app.git ~/food-and-health-app
```

Nginx config (`/etc/nginx/sites-available/default`):
```nginx
server {
    listen 80;
    server_name YOUR_IP_OR_DOMAIN;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
