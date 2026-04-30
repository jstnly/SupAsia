# Continuation prompt

Drop this entire file into a fresh Claude Code session (any account, any device) and Claude will pick up from the completed Phase 7 state.

---

You are continuing work on **Biết Tiếng Việt** — a Vietnamese-learning RPG web app. Read [`CLAUDE.md`](./CLAUDE.md) at the repo root first; it has the full architecture, conventions, and phase roadmap.

## State of the repo (Phase 7 — complete)

All seven phases are implemented. Here is what exists:

### Core infrastructure
- Next.js 15 + React 19 + TypeScript + Tailwind v4 + Drizzle ORM + Supabase Auth/Postgres/Realtime
- Design system: tokens in `src/app/globals.css`, primitives in `src/components/ui/`, game atoms in `src/components/game/`
- Mascot **Bồ** — inline SVG water buffalo, 8 palette variants, 6 emotes (Lottie upgrade deferred)
- Default dialect: **Southern (Sài Gòn)**; Northern dialect unlockable at L25

### Lesson engine (7 activity types)
Listen / Translate / Tone Match / Speak (mic + pitchy pitch-contour + Web Speech / Whisper-Groq fallback) / Pair-match / Fill-blank / Short-story (branching dialogue). Speak grading is tone-only; phoneme transcript is advisory. Pitch threshold: 55.

### Content
Units 0–12 covering the full curriculum:
- Unit 0: Âm Thanh (sounds + 6 tones)
- Unit 1: Xin Chào (greetings, Sài Gòn city)
- Unit 2: Ăn Uống (food + drink, Đà Lạt)
- Unit 3: Gia Đình (family, Hội An)
- Unit 4: Chợ Búa (market bargaining, Đà Nẵng)
- Unit 5: Hỏi Đường (directions, Huế)
- Unit 6: Thời Gian (time + schedule, Vinh)
- Unit 7: Cảm Xúc (emotions, Hà Nội)
- Unit 8: Sức Khỏe (health, Hải Phòng)
- Unit 9: Du Lịch (travel, Sa Pa)
- Unit 10: Công Việc (work + professional, Điện Biên)
- Unit 11: Văn Hóa (culture + customs, Lào Cai)
- Unit 12: Hội Thoại Nâng Cao (advanced conversation — Northern pack content, Móng Cái)
13 cities, each with a boss encounter that awards XP + gems via `src/server/actions/boss.ts`.

### Game systems
- Skill tree: 4 branches × 6 nodes (24 total), XP multipliers + capstone hearts — `/skills`
- 12 named achievements checked on `completeLesson` and `completeBoss`
- Adaptive learning engine (`src/lib/game/adaptive.ts`) surfaces 3 focus lessons on `/learn` based on weakest stat scores
- Dialect toggle + daily goal selector in Settings panel on `/me`
- Speed Lesson mode: `/lesson/[lessonId]?speed=1` — 60s timer, 2× XP multiplier
- Equipment + pets (items table), shop UI at `/shop`
- Currency: gems (earned from boss fights, spending in shop)

### Multiplayer
- Tone Duel: Supabase Realtime broadcast, matchmaking queue, real-time pitch comparison — `/duel`
- Co-op mode (Đôi Bạn Học): shared lesson progress, partner XP sync — `/coop`

### AI conversation practice
- `/conversation` — 6 scenarios (café ordering / market bargaining / family introductions / directions / health clinic / restaurant), streaming Claude responses via `claude-opus-4-7`
- Rate limited (30 req/min per user), XP awarded on session end via `completeConversation`
- System prompt cached with `cache_control: { type: "ephemeral" }` for latency

### Infrastructure
- PWA: `public/manifest.json` + service worker `public/sw.js` (cache-first static, network-first nav, audio cache)
- Web Push notifications: VAPID-based, `push_subscriptions` table, `/api/push/send` endpoint, Vercel cron `0 18 * * *` for streak reminders
- Security headers in `next.config.ts` (CSP, HSTS, X-Frame-Options, etc.)
- Environment validation in `src/lib/env.ts`
- In-memory sliding-window rate limiter in `src/lib/rate-limit.ts`
- React ErrorBoundary + Next.js `src/app/error.tsx`

### Database migrations (apply in order)
1. `drizzle/0001_rls_and_triggers.sql` — RLS + auth trigger + leaderboard_weekly materialized view
2. `drizzle/0002_phase3_schema.sql` — duels, speed_scores, coop_sessions, items, inventory tables
3. `drizzle/0003_push_subscriptions.sql` — push_subscriptions + push_jobs + pg_cron streak-reminder job

## Setup for a fresh environment

```bash
npm install
cp .env.local.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
#          DATABASE_URL, GOOGLE_TTS_API_KEY, ANTHROPIC_API_KEY
# Optional: GROQ_API_KEY, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT,
#           R2_*, CRON_SECRET, NEXT_PUBLIC_SITE_URL

npm run db:push
# In Supabase SQL editor, run each migration in order (0001, 0002, 0003)
# Supabase Auth → Providers → Email → enable anonymous sign-ins

npm run dev
# Auth-free demo: http://localhost:3000/demo
```

## What could be improved (post-Phase 7 backlog)

1. **Lottie mascot** — Commission 6-emote Lottie file for Bồ. Drop JSON into `public/lottie/bo-{emote}.json`, replace SVG body in `MascotSlot.tsx` with `<Lottie>`.
2. **Redis rate limiter** — Replace in-memory `Map` in `src/lib/rate-limit.ts` with Upstash Redis for multi-instance deployments.
3. **R2 audio cache** — Persist TTS audio to Cloudflare R2 keyed by `sha256(text+voice)`. Reduces Google TTS costs in production. Env vars `R2_*` are already in `.env.local.example`.
4. **pg_cron for leaderboard** — `leaderboard_weekly` materialized view currently reads from `xp_events` directly without a scheduled refresh. Add `pg_cron` job to `REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_weekly` nightly.
5. **Whisper STT accuracy** — Web Speech API on Vietnamese is unreliable. Consider replacing with a dedicated Vietnamese ASR model for phoneme grading.
6. **Co-op room discovery** — Current co-op requires sharing a room code manually. Add a matchmaking lobby screen similar to the Tone Duel queue.
7. **Push notification deep-links** — `notificationclick` in `sw.js` currently opens `/learn`. Enhance to deep-link to the specific lesson in the streak reminder.
8. **Northern dialect content** — Unit 12 stubs exist. Expand with full Hà Nội-dialect vocabulary contrasts (giời/trời, thìa/muỗng, etc.) once Northern pack is unlocked (L25+).

## Constraints (unchanged)

- Southern dialect defaults unless user asks for Northern.
- Tones: always color + shape + letter, never color alone (accessibility).
- Server mutations are Server Actions; avoid unnecessary `/api/*` routes.
- Vietnamese text always with full NFC diacritics.
- No backwards-compatibility shims — change things directly.
- Database access only in server actions or server components, never in client code.

Read `CLAUDE.md` now and confirm you can see the full phase-7-complete state, then ask the user what they'd like to work on next.
