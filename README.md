# NutriAI — Smart Food Intelligence

AI-powered food tracking app. Log meals, get instant nutrition analysis, track habits, and receive personalized weekly insights — all powered by Gemini.

## Architecture

```
User → Nginx → Next.js (port 3000)
                   ↳ /api/analyze-food     → Gemini 1.5 Flash
                   ↳ /api/suggest-meal     → Gemini 1.5 Flash
                   ↳ /api/weekly-insights  → Gemini 1.5 Pro

Expo Mobile App → same /api endpoints
```

## Quick Start

```bash
# 1. Install deps
cd web && npm install

# 2. Add your Gemini key
cp ../.env.example .env.local
# edit .env.local → GEMINI_API_KEY=your_key

# 3. Run
npm run dev        # http://localhost:3000
npm test           # 58 tests
```

## Features

| Screen | What it does |
|--------|-------------|
| Dashboard | Macro rings (calories/protein/carbs/fiber), streak counter, today's food log |
| Log Food | Text input → Gemini analyzes macros, health score (1-10), personalized tip |
| Suggestions | Context-aware meal ideas based on remaining daily macros + time of day |
| Habits | 5 daily habits with weekly trend bars |
| Insights | Gemini Pro weekly summary with highlights, improvements, actionable tip |

## Stack

- **Web**: Next.js 16, TypeScript, Tailwind 4
- **Mobile**: Expo + React Native (Dashboard, Log, Habits)
- **AI**: Gemini 1.5 Flash (speed), Gemini 1.5 Pro (weekly analysis)
- **Server**: GCP VM + Nginx reverse proxy
- **CI/CD**: GitHub Actions → SSH deploy → PM2

## Deployment (GCP VM)

### Server setup (one-time)
```bash
# On GCP VM
sudo apt update && sudo apt install -y nginx nodejs npm
npm install -g pm2 napi-postinstall
git clone https://github.com/aniketsingh1023/food-and-health-app.git ~/food-and-health-app
```

### Nginx config (`/etc/nginx/sites-available/default`)
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

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

### GitHub Actions Secrets required
| Secret | Value |
|--------|-------|
| `SERVER_HOST` | VM public IP or domain |
| `SERVER_USER` | SSH username (e.g. `ubuntu`) |
| `SSH_PRIVATE_KEY` | Private SSH key for the VM |
| `GEMINI_API_KEY` | Your Gemini API key |

Push to `main` → tests run → auto-deploys via SSH.

## Environment Variables

```env
GEMINI_API_KEY=          # Required — from Google AI Studio
NEXT_PUBLIC_APP_URL=     # Optional — for CORS/absolute URLs
```

## Tests

```bash
cd web && npm test
# 5 test suites, 58 tests — all passing
```
