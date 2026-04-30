# CLAUDE.md — Biết Tiếng Việt

This file guides Claude Code when working in this repo. Read it first.

## Project pitch

A web app that teaches **Southern Vietnamese** to American English speakers, RPG-style. Duolingo-style lessons + character stats + cities to unlock + multiplayer/leaderboards. Goal: complete beginner → conversational in **2–3 months**.

- **Mascot:** Bồ — a baby water buffalo (cobalt-blue, gold horn-tips, gold earring), Lottie-rigged with named emotes.
- **Aesthetic:** "Neon Lotus" — sơn-mài lacquer art × modern cel-shading. Lotus pink, jade, gold leaf, lacquer black.
- **Default dialect:** Southern (Sài Gòn). Hỏi/ngã merge in speech. Vocabulary uses ba/má/chén/muỗng. Northern Pack unlocks at L25.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + custom shadcn-style primitives + Framer Motion |
| Backend | Next.js Server Actions + Route Handlers |
| DB | Supabase Postgres + Drizzle ORM (postgres-js driver) |
| Auth | Supabase Auth (magic link + Google OAuth + anonymous) |
| Realtime | Supabase Realtime (Tone Duel, Co-op) |
| TTS | Google Cloud TTS Neural2 `vi-VN-Neural2-D` (Southern voice). Browser Web Speech API fallback. |
| STT | Web Speech API + Whisper via Groq for non-Chrome browsers. |
| Tone grading | `pitchy` library for pitch-contour analysis. |
| AI tutor | Self-hosted retrieval engine — scripted scenarios + curated knowledge base (no LLM API; zero recurring cost) |
| State | TanStack Query (server) + Zustand (client) |
| Deployment | Vercel + Supabase + Cloudflare R2 (audio cache, Phase 4+) |

## Repo layout

```
src/
  app/
    layout.tsx                       Root layout, fonts, metadata, SW registration
    page.tsx                         Marketing landing
    globals.css                      Design tokens — palette, tones, fonts
    error.tsx                        Global error boundary (client)
    (auth)/login/                    Login page + magic-link / OAuth / guest form
    auth/callback/route.ts           OAuth callback
    onboarding/                      5-step onboarding flow
    offline/page.tsx                 Offline fallback (served by SW)
    demo/                            Auth-free demo — no Supabase required
    (app)/
      layout.tsx                     Session-protected wrapper, top bar + bottom nav (5 items)
      TopBar.tsx                     XP bar / hearts / streak / currency
      learn/page.tsx                 World map hub + adaptive focus lessons
      learn/[unitId]/page.tsx        Unit lesson list
      lesson/[lessonId]/page.tsx     Lesson runner (wrapped in ErrorBoundary)
      speed/page.tsx                 Speed lesson index (45s timer, +4s/correct)
      speed/[lessonId]/page.tsx      Speed lesson runner
      me/page.tsx                    Character sheet — stats radar, league, 30-day heatmap,
                                     achievements, settings, push toggle, account
      me/SettingsPanel.tsx           Dialect toggle (N locked to L25) + daily goal selector
      friends/page.tsx               Friend list + add by username
      leaderboard/page.tsx           Daily/Weekly/All-time × Friends/Global
      skills/page.tsx                Skill tree (4 branches × 6 nodes)
      shop/page.tsx                  Shop — gems, cosmetics, boosts, backgrounds
      duel/page.tsx                  Tone Duel lobby
      duel/[id]/page.tsx             Live duel room (Supabase Realtime)
      coop/page.tsx                  Co-op lobby (Đôi Bạn Học)
      boss/[cityId]/page.tsx         City boss encounter (tone identification)
      conversation/page.tsx          Conversation practice + tutor hub (server)
      conversation/ConversationPractice.tsx  Top-level tab switcher (Practice | Ask Bồ)
    api/
      tts/route.ts                   Google TTS proxy (long-cache headers)
      stt/route.ts                   Whisper-via-Groq STT fallback
      push/send/route.ts             Web-push delivery (POST, cron-secret auth)
      cron/streak-reminders/route.ts Daily streak reminder cron (GET, Vercel cron)
  components/
    ui/                              Primitives — Button, Card, Input, Label, Progress
    game/                            ToneBadge, XPBar, HeartCounter, StreakFlame,
                                     MascotSlot (Bồ SVG), ConfettiBurst, StatRadar
    lesson/                          Lesson runner + 7 exercise types + LessonResult + Tips
    map/WorldMap.tsx                 SVG Vietnam silhouette + 13 city nodes + boss links
    tutor/                           Self-hosted tutor UI — KnowledgeCard, AskBoTab,
                                     PracticeTab, SuggestionChips
    ErrorBoundary.tsx                React class error boundary
    PushNotificationToggle.tsx       VAPID push subscription UI
    ServiceWorkerRegistrar.tsx       Registers /sw.js on mount
  lib/
    utils.ts                         cn(), pickRandom, shuffle, formatNumber
    env.ts                           Env validation (validates required vars at import time)
    rate-limit.ts                    In-memory sliding-window rate limiter
    db/schema.ts                     Drizzle schema — profiles, stats, progress, xp_events,
                                     friendships, duels, items, inventory, achievements,
                                     push_subscriptions
    db/client.ts                     Drizzle + postgres-js connection
    supabase/{client,server,middleware}.ts
    game/xp.ts                       XP curve, levels, stat metadata (7 stats)
    game/tones.ts                    6 tones (5 spoken in S), shape glyphs, detector
    game/types.ts                    Lesson / Exercise / Unit / City types (7 exercise kinds)
    game/audio.ts                    Browser TTS playback (calls /api/tts → Web Speech fallback)
    game/skill-tree.ts               24 skill nodes, XP multipliers
    game/achievements.ts             25 named achievements + evalEarnedAchievements()
    game/league.ts                   6 league tiers (Trà Đá → Thiên Long) + promote/demote logic
    game/bosses.ts                   13 city bosses — xpReward, gemsReward, winThreshold
    game/adaptive.ts                 Weak-stat engine — returns focus lessons for /learn
    game/exercise-shuffle.ts         Deterministic replay shuffle (SSR-safe)
    curriculum/units.ts              Units 0–12 (all 13 cities), 3000+ LOC curriculum
    curriculum/derive-vocab.ts       Auto-derives vocab list from lesson exercises
    curriculum/dictionary.ts         Word → meaning / tone hint lookup
    tutor/                           Self-hosted tutor engine + content
    tutor/match.ts                   Vietnamese-aware fuzzy matching (NFC + diacritic-insensitive)
    tutor/intent.ts                  Regex-based intent classifier (vocab/tone/grammar/culture)
    tutor/respond.ts                 Practice + Ask Bồ engine (no LLM)
    tutor/scenarios.ts               6 scripted scenarios with branching dialogue
    tutor/knowledge-base.ts          ~50 curated tutor entries (tones, pronouns, grammar, culture)
    speech/                          tone-detect.ts, use-mic-recorder.ts,
                                     use-speech-recognition.ts, phoneme-match.ts,
                                     browser-support.ts
    stores/accessibility.ts          Zustand: mic-optional toggle (persisted)
  middleware.ts                      Route protection
  server/
    actions/lesson.ts                completeLesson (XP, stat bumps, achievements, streak)
    actions/profile.ts               completeOnboarding, signOut, setDialect, setDailyGoal
    actions/social.ts                getFriends, addFriendByUsername, getLeaderboard
    actions/skill-tree.ts            unlockSkillNode
    actions/shop.ts                  getShopItems, getMyInventory, purchaseItem, toggleEquip
    actions/duel.ts                  createDuel, joinDuel, finalizeDuel, getMyDuels
    actions/boss.ts                  completeBoss (awards XP + gems, bumps tone stats)
    actions/conversation.ts          completeConversation (XP milestones per session)
    actions/push.ts                  savePushSubscription, removePushSubscription
drizzle/
  0001_rls_and_triggers.sql          RLS policies + auth-user → profile trigger +
                                     leaderboard_weekly materialized view
  0002_league_cron_shop.sql          League promote/demote pg_cron + shop items seed
  0003_push_subscriptions.sql        push_subscriptions table + streak-reminder cron
public/
  sw.js                              Service worker — cache-first audio/static, network-first pages
  manifest.webmanifest               PWA manifest
  icon.svg                           App icon
vercel.json                          Vercel cron: /api/cron/streak-reminders daily at 18:00 UTC
.env.local.example                   All required + optional environment variables
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create a free Supabase project
#    https://supabase.com/dashboard → New project
#    Note the project URL, anon key, service-role key, and DB password.

# 3. Copy env file and fill in values
cp .env.local.example .env.local
# Required:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY
#   DATABASE_URL  (postgres://postgres:PASSWORD@db.PROJECTREF.supabase.co:5432/postgres)
# Recommended:
#   GOOGLE_TTS_API_KEY         — falls back to Web Speech API without this
#   GROQ_API_KEY               — Whisper STT fallback on non-Chrome
# Optional (push notifications):
#   NEXT_PUBLIC_VAPID_PUBLIC_KEY  \
#   VAPID_PRIVATE_KEY              > generate with: npx web-push generate-vapid-keys
#   VAPID_SUBJECT                 /
#   CRON_SECRET                — shared with Vercel cron Authorization header

# 4. Push the Drizzle schema
npm run db:push

# 5. Apply SQL migrations (in Supabase SQL editor, in order):
#    drizzle/0001_rls_and_triggers.sql
#    drizzle/0002_league_cron_shop.sql
#    drizzle/0003_push_subscriptions.sql

# 6. (recommended) Supabase Auth → URL Config:
#    Site URL = http://localhost:3000
#    Redirect URLs: http://localhost:3000/auth/callback
#    Enable anonymous sign-ins (Auth → Providers → Email)

# 7. Run dev server
npm run dev
```

## Conventions

- Server Components by default. Add `"use client"` only when needed (state, refs, browser APIs).
- Server mutations live in `src/server/actions/*.ts` (Server Actions). Avoid building unnecessary `/api/*` routes (exceptions: TTS proxy, STT, push delivery — these need streaming or special headers).
- Database access only inside server actions or server components — never in client code.
- Tailwind v4: tokens are defined in `globals.css` via `@theme`. New colors / fonts go there. Reference as `var(--color-...)` in CSS or use Tailwind utility classes.
- Tones are color-coded AND shape-coded AND letter-coded — never use color alone (accessibility).
- When adding strings in Vietnamese, **always include diacritics** with full NFC normalization. Don't bare-strip them.
- Avoid putting Vietnamese text in image alt — prefer aria-labels with English equivalent.

## How to add things

### Add a new lesson activity type

1. Add the kind to `Exercise` union in `src/lib/game/types.ts`.
2. Create `src/components/lesson/MyExercise.tsx` with the same `(exercise, onAnswer)` API.
3. Wire into the switch in `src/components/lesson/Lesson.tsx::ExerciseSwitch`.
4. Author exercises in `src/lib/curriculum/units.ts`.

### Add a new lesson

Edit `src/lib/curriculum/units.ts`. Each lesson needs `id`, `unitId`, `order`, `title`, `titleEnglish`, `xpReward`, and `exercises[]`. IDs follow `u{unit}-l{lesson}-e{exercise}`. For story exercises, include `startId: "start"`.

### Add a new stat

1. Add to `STAT_KEYS` and `STAT_META` in `src/lib/game/xp.ts`.
2. Add a column in `stats` table in `src/lib/db/schema.ts`.
3. Run `npm run db:push`.
4. Update `completeLesson` in `src/server/actions/lesson.ts` to map it.
5. The stat appears automatically in `<StatRadar>` on /me.

### Add a new city / unit

1. Add the city to `CITIES` in `src/lib/curriculum/units.ts` with `position: { x, y }` (percent on the map SVG).
2. Add the unit to `UNITS` with `id` matching `city.unitId`.
3. Add a boss to `BOSSES` in `src/lib/game/bosses.ts`.
4. The WorldMap unlock is data-driven (previous unit must be complete).

### Commission Bồ Lottie art

Currently `MascotSlot` renders an inline SVG buffalo with 8 palette swaps. To upgrade:

1. Commission a Lottie file with named segments matching `BoEmote`: `idle`, `cheer`, `hop`, `shrug`, `sleep`, `tilt`.
2. Drop JSON files into `public/lottie/bo-{emote}.json`.
3. Replace the SVG body in `MascotSlot.tsx` with `<Lottie>` from `lottie-react`.

## Phase roadmap

This repo is at **end of Phase 7 — all phases complete**.

- **Phase 1** (DONE) — Foundation: auth, onboarding, world map, lesson engine + 3 exercise types (Listen / Translate / Tone Match), Units 0–1, character sheet, friends, leaderboard skeletons.
- **Phase 2** (DONE) — All 7 exercise types (+ Speak / Pair-match / Fill-blank / Short-story). Skill tree (4 branches × 6 nodes, XP multipliers). Units 2–4. Pre-lesson Tips + hover dictionary. 12 achievements. Replay shuffle. PWA manifest. `/demo` route (auth-free). Next.js 15.5.15 (CVE patch).
- **Phase 3** (DONE) — Tone Duel multiplayer (`/duel`, Supabase Realtime broadcast). Speed Lesson (`/speed`, 45s timer). Bậc Trà Sữa league (6 tiers, weekly pg_cron promote/demote). Leaderboard materialized view + cron.
- **Phase 4** (DONE) — Shop UI + items/cosmetics/boosts (`/shop`, gems currency). Units 5–12 authored (all 13 cities: Huế, Ninh Bình, Hạ Long, Hà Nội, Nha Trang, Phú Quốc, Cần Thơ, Sa Pa). City boss encounters (`/boss/[cityId]`) — tone identification, HP bars, XP + gem rewards via `completeBoss`.
- **Phase 5** (DONE) — Co-op study rooms (`/coop`, Supabase Realtime, 6-char room codes). Northern dialect unlock at L25 + in-app toggle (`SettingsPanel`). 25 named achievements (progress / streak / level / social / city mastery / mastery).
- **Phase 6** (DONE) — Conversation practice + tutor (`/conversation`): self-hosted retrieval engine — no LLM API, zero recurring cost. Two tabs: **Practice** (6 scripted branching scenarios with fuzzy-matched free-text input) and **Ask Bồ** (curated knowledge base of ~50 entries — tones, pronouns, grammar, phrases, culture, pronunciation). XP milestones per session via `completeConversation`. Adaptive learning engine (`src/lib/game/adaptive.ts`): analyzes 7 stat scores, surfaces 3 targeted focus lessons on `/learn`.
- **Phase 7** (DONE) — PWA service worker (`public/sw.js`): cache-first for static assets + TTS audio, network-first for pages, offline fallback. Push notifications: VAPID infrastructure, `push_subscriptions` table, `/api/push/send` delivery, `/api/cron/streak-reminders` (Vercel cron daily 18:00 UTC). 30-day XP activity heatmap on `/me`. `ErrorBoundary` component + global `error.tsx`. Security headers (`next.config.ts`). In-memory rate limiter (`src/lib/rate-limit.ts`). Env validation module (`src/lib/env.ts`). `vercel.json` cron config.

## File maps by phase

### Phase 2

| Concern | Files |
|---|---|
| Speak grading | `src/lib/speech/` — `tone-detect.ts`, `use-mic-recorder.ts`, `use-speech-recognition.ts`, `phoneme-match.ts`, `browser-support.ts` |
| Skill tree | `src/lib/game/skill-tree.ts`, `src/server/actions/skill-tree.ts`, `src/app/(app)/skills/` |
| Achievements | `src/lib/game/achievements.ts` |
| Tips / dictionary | `src/lib/curriculum/derive-vocab.ts`, `src/lib/curriculum/dictionary.ts`, `src/components/lesson/LessonTips.tsx`, `src/components/ui/word.tsx` |
| Replay shuffle | `src/lib/game/exercise-shuffle.ts` |
| Accessibility | `src/lib/stores/accessibility.ts` |
| Demo route | `src/app/demo/` |

### Phase 3

| Concern | Files |
|---|---|
| Tone Duel | `src/app/(app)/duel/`, `src/server/actions/duel.ts` |
| League | `src/lib/game/league.ts`, `drizzle/0002_league_cron_shop.sql` |
| Speed Lesson | `src/app/(app)/speed/` |

### Phase 4

| Concern | Files |
|---|---|
| Shop | `src/app/(app)/shop/`, `src/server/actions/shop.ts` |
| Boss encounters | `src/app/(app)/boss/`, `src/lib/game/bosses.ts`, `src/server/actions/boss.ts` |
| Curriculum (U5–12) | `src/lib/curriculum/units.ts` (Units 5–12 section) |

### Phase 5

| Concern | Files |
|---|---|
| Co-op | `src/app/(app)/coop/` |
| Settings | `src/app/(app)/me/SettingsPanel.tsx`, `src/server/actions/profile.ts` (setDialect, setDailyGoal) |
| Achievements (25) | `src/lib/game/achievements.ts` |

### Phase 6

| Concern | Files |
|---|---|
| Self-hosted tutor | `src/lib/tutor/` (match, intent, respond, scenarios, knowledge-base), `src/components/tutor/` (PracticeTab, AskBoTab, KnowledgeCard, SuggestionChips), `src/app/(app)/conversation/` |
| Conversation XP | `src/server/actions/conversation.ts` |
| Adaptive engine | `src/lib/game/adaptive.ts` (pure), `src/app/(app)/learn/page.tsx` (integration) |

### Phase 7

| Concern | Files |
|---|---|
| Service worker | `public/sw.js`, `src/components/ServiceWorkerRegistrar.tsx` |
| Offline page | `src/app/offline/page.tsx` |
| Push notifications | `src/components/PushNotificationToggle.tsx`, `src/server/actions/push.ts`, `src/app/api/push/send/route.ts`, `src/app/api/cron/streak-reminders/route.ts`, `drizzle/0003_push_subscriptions.sql`, `vercel.json` |
| Error handling | `src/components/ErrorBoundary.tsx`, `src/app/error.tsx` |
| Hardening | `src/lib/env.ts`, `src/lib/rate-limit.ts`, `next.config.ts` (security headers) |
| Analytics | 30-day XP heatmap in `src/app/(app)/me/page.tsx` |

## Known caveats

- Run `npm run db:push` after pulling, then apply all three SQL files in the Supabase SQL editor (in order: 0001 → 0002 → 0003).
- `/conversation` is fully self-hosted (no LLM API, no recurring cost). Knowledge-base content lives in `src/lib/tutor/knowledge-base.ts` and scenario scripts in `src/lib/tutor/scenarios.ts` — both are plain TS arrays you can extend without touching engine code.
- Push notifications require VAPID keys. Generate with `npx web-push generate-vapid-keys` and set all three VAPID env vars + `VAPID_SUBJECT` (mailto: address). Without them, `PushNotificationToggle` is hidden and the cron is a no-op.
- `CRON_SECRET` secures `/api/cron/streak-reminders`. Set it in Vercel env and in the Vercel cron config. Without it, the endpoint is open (acceptable for low-traffic dev).
- `GROQ_API_KEY` is consumed by `/api/stt` for Whisper STT fallback when Web Speech API is unavailable.
- TTS audio is cached in-memory per process (`Map` in `audio.ts`) and also by the service worker. Persistent R2 caching is configured in `next.config.ts` image patterns but the upload pipeline is not yet wired.
- Anonymous (guest) sign-in must be enabled in the Supabase dashboard (Auth → Providers → Email → "Enable anonymous sign-ins").
- Speak grading is tone-only; phoneme transcript is shown advisory but does not gate scoring. Pitch threshold is 55 — Web Speech ASR on Vietnamese is too unreliable to gate.
- Hydration: any client component that uses `Math.random()` must defer to `useEffect` after mount. See `Lesson.tsx` and `PairMatchExercise.tsx` for the pattern.
- Story exercises must include `startId: "start"` — omitting it causes a TypeScript error.
- The leaderboard materialized view (`leaderboard_weekly`) is refreshed by pg_cron; without cron enabled the page reads live from `xp_events`.

## Quick verification

```bash
npm run dev

# Auth-free demo (no Supabase required):
# http://localhost:3000/demo

# Full flow (requires .env.local + npm run db:push + SQL migrations):
# http://localhost:3000
# Sign up → onboarding → world map
# Mekong (U0) → Sài Gòn (U1) → Đà Lạt (U2) → Hội An (U3) → Đà Nẵng (U4)
# → Huế (U5) → Ninh Bình (U6) → Hạ Long (U7) → Hà Nội (U8)
# → Nha Trang (U9) → Phú Quốc (U10) → Cần Thơ (U11) → Sa Pa (U12)
# Complete a city → tap the "Boss" pill on the map → challenge the city boss
# Reach L5 → /skills (skill tree)
# /duel → create room → share ID → Tone Duel
# /coop → create room → study together
# /conversation → Practice tab: pick scenario, chat in Vietnamese with branching NPC dialogue
#                Ask Bồ tab: type "how do I say apple", "explain the sắc tone", etc.
# /me → dialect toggle, daily goal, 30-day heatmap, achievements, push notifications
# /shop → spend gems on cosmetics
# /speed → race the clock
```
