# CLAUDE.md — Biết Tiếng Việt

This file guides Claude Code when working in this repo. Read it first.

## Project pitch

A web app that teaches **Southern Vietnamese** to American English speakers, RPG-style. Duolingo-style lessons + character stats + cities to unlock + multiplayer/leaderboards. Goal: complete beginner → conversational in **2–3 months**.

- **Mascot:** Bồ — a baby water buffalo (cobalt-blue, gold horn-tips, gold earring), Lottie-rigged with named emotes.
- **Aesthetic:** "Neon Lotus" — sơn-mài lacquer art × modern cel-shading. Lotus pink, jade, gold leaf, lacquer black.
- **Default dialect:** Southern (Sài Gòn). Hỏi/ngã merge in speech. Vocabulary uses ba/má/chén/muỗng. Northern Pack unlocks at L25 (Phase 5).

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + custom shadcn-style primitives + Framer Motion |
| Backend | Next.js Server Actions + Route Handlers |
| DB | Supabase Postgres + Drizzle ORM (postgres-js driver) |
| Auth | Supabase Auth (magic link + Google OAuth + anonymous) |
| Realtime | Supabase Realtime (Phase 3+) |
| TTS | Google Cloud TTS Neural2 `vi-VN-Neural2-D` (Southern voice). Browser Web Speech API fallback. |
| STT | Web Speech API (Phase 2). Whisper via Groq for non-Chrome browsers (Phase 2). |
| Tone grading | `pitchy` library for pitch-contour analysis (Phase 2). |
| State | TanStack Query (server) + Zustand (client) — currently used minimally; expand in Phase 2+ |
| Deployment | Vercel + Supabase + (later) Cloudflare R2 audio cache |

## Repo layout

```
src/
  app/
    layout.tsx                       Root layout, fonts, metadata
    page.tsx                         Marketing landing
    globals.css                      Design tokens — palette, tones, fonts
    (auth)/login/                    Login page + magic-link / OAuth / guest form
    auth/callback/route.ts           OAuth callback
    onboarding/                      5-step onboarding flow
    (app)/
      layout.tsx                     Session-protected wrapper, top bar + bottom nav
      TopBar.tsx                     XP bar / hearts / streak / currency
      learn/page.tsx                 World map hub
      learn/[unitId]/page.tsx        Unit lesson list
      lesson/[lessonId]/page.tsx     Lesson runner host
      me/page.tsx                    Character sheet (stats radar, league, currency)
      friends/page.tsx               Friend list + add by username
      leaderboard/page.tsx           Daily/Weekly/All-time × Friends/Global
    api/tts/route.ts                 Google TTS proxy (cached headers)
  components/
    ui/                              Primitives — Button, Card, Input, Label, Progress
    game/                            Atom components — ToneBadge, XPBar, HeartCounter,
                                     StreakFlame, MascotSlot (Bồ SVG), ConfettiBurst,
                                     StatRadar
    lesson/                          Lesson runner + 3 exercise types (Listen, Translate,
                                     ToneMatch) + LessonResult
    map/WorldMap.tsx                 SVG Vietnam silhouette + 9 city nodes
  lib/
    utils.ts                         cn(), pickRandom, shuffle, formatNumber
    db/schema.ts                     Drizzle schema — profiles, stats, progress, xp_events,
                                     friendships, duels, items, inventory, achievements
    db/client.ts                     Drizzle + postgres-js connection
    supabase/{client,server,middleware}.ts
    game/xp.ts                       XP curve, levels, stat metadata
    game/tones.ts                    6 tones (5 spoken in S), shape glyphs, detector
    game/types.ts                    Lesson / Exercise / Unit / City types
    game/audio.ts                    Browser TTS playback (calls /api/tts → Web Speech fallback)
    curriculum/units.ts              Unit 0 + Unit 1 content + 9 cities
  middleware.ts                      Route protection
  server/
    actions/lesson.ts                completeLesson + getProfileWithStats
    actions/profile.ts               completeOnboarding + signOut
    actions/social.ts                getFriends, addFriendByUsername, getLeaderboard
drizzle/
  0001_rls_and_triggers.sql          RLS policies + auth-user → profile trigger +
                                     leaderboard_weekly materialized view
.env.local.example                   Required environment variables
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
# Then edit .env.local with:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY
#   DATABASE_URL  (postgres://postgres:PASSWORD@db.PROJECTREF.supabase.co:5432/postgres)
#   GOOGLE_TTS_API_KEY  (optional — falls back to Web Speech API)

# 4. Push the schema
npm run db:push

# 5. Apply RLS + triggers + materialized view
#    In Supabase SQL editor, paste and run drizzle/0001_rls_and_triggers.sql

# 6. (optional, recommended) In Supabase Auth → URL Config, set Site URL = http://localhost:3000
#    and add http://localhost:3000/auth/callback to Redirect URLs.

# 7. Run dev server
npm run dev
```

## Conventions

- Server Components by default. Add `"use client"` only when needed (state, refs, browser APIs).
- Server mutations live in `src/server/actions/*.ts` (Server Actions). Avoid building unnecessary `/api/*` routes.
- Database access only inside server actions or server components — never in client code.
- Tailwind v4: tokens are defined in `globals.css` via `@theme`. New colors / fonts go there. Reference as `var(--color-...)` in CSS or use Tailwind utility classes.
- Tones are color-coded AND shape-coded AND letter-coded — never use color alone (accessibility).
- When adding strings in Vietnamese, **always include diacritics** with full NFC normalization. Don't bare-strip them.
- Avoid putting Vietnamese text in image alt — prefer aria-labels with English equivalent.

## How to add things

### Add a new lesson activity type (e.g. Pair-match)

1. Add the kind to `Exercise` union in `src/lib/game/types.ts`.
2. Create `src/components/lesson/PairMatchExercise.tsx` with the same `(exercise, onAnswer)` API.
3. Wire into the switch in `src/components/lesson/Lesson.tsx::ExerciseSwitch`.
4. Author exercises in `src/lib/curriculum/units.ts`.

### Add a new lesson

Edit `src/lib/curriculum/units.ts`. Each lesson needs `id`, `unitId`, `order`, `title`, `titleEnglish`, `xpReward`, and an array of `exercises`. IDs follow `u{unit}-l{lesson}-e{exercise}`.

### Add a new stat

1. Add to `STAT_KEYS` and `STAT_META` in `src/lib/game/xp.ts`.
2. Add a column in `stats` table in `src/lib/db/schema.ts`.
3. Run `npm run db:push`.
4. Update `completeLesson` server action (`src/server/actions/lesson.ts`) to map the stat to its DB column.
5. The stat appears automatically in `<StatRadar>` on the /me page.

### Add a new city / unit

1. Add the city to `CITIES` in `src/lib/curriculum/units.ts` with `position` (0–100 percent on the map SVG).
2. Add the unit to `UNITS` with `id` matching `city.unitId`.
3. Update unlock logic in `src/components/map/WorldMap.tsx` (currently `i <= 1`).

### Commission Bồ Lottie art

Currently `MascotSlot` renders an inline SVG buffalo with 8 palette swaps. To upgrade:

1. Commission a Lottie file from an animator (LottieFiles / Fiverr / direct artist) with named segments matching the `BoEmote` type: `idle`, `cheer`, `hop`, `shrug`, `sleep`, `tilt`.
2. Drop JSON files into `public/lottie/bo-{emote}.json`.
3. Replace the SVG body in `MascotSlot.tsx` with `<Lottie>` from `lottie-react`, switching segments based on `active` prop.

## Phase roadmap

This repo is currently at **Phase 1**.

- **Phase 1** (DONE) — Foundation, auth, onboarding, world map, lesson engine + 3 activity types (Listen / Translate / Tone Match), Unit 0 + Unit 1 content, character sheet, friends, leaderboard skeletons, docs.
- **Phase 2** — Speak (Nói) exercise with mic + `pitchy` pitch-contour grading + Whisper fallback. Pair-match, Fill-blank, Short-story exercises. Skill tree screen + unlock logic. Units 2–4 content. Upgrade Next.js to a security-patched version.
- **Phase 3** — Multiplayer Tone Duel (Supabase Realtime broadcast channels). Speed Lesson. Leaderboard refresh cron (Supabase pg_cron). Bậc Trà Sữa league weekly promote/demote.
- **Phase 4** — Equipment + pets + shop UI. Story campaign (Hành Trình Nam Bắc) + city dialogue bosses. Units 5–8 content. R2 audio cache.
- **Phase 5** — Co-op modes (Đôi Bạn Học, Ngữ Cảnh, City Raid). Achievements polish + 20 named achievements. Units 9–12 content. Northern dialect unlock pack. PWA + push notifications.

## Known caveats

- `next@15.1.3` has a security advisory; bump to a patched 15.x in Phase 2.
- TTS audio is currently fetched per-play and cached in-memory only (`Map` in `audio.ts`). Phase 4 introduces persistent caching to Cloudflare R2 keyed by `sha256(text+voice)`.
- Anonymous (guest) sign-in must be enabled in the Supabase dashboard (Auth → Providers → Email → "Enable anonymous sign-ins"). If left disabled, the "Try as guest" button errors silently — magic-link and Google still work.
- The leaderboard view (`leaderboard_weekly`) needs `pg_cron` to refresh; without cron, the page reads from `xp_events` directly (slower but always current). Cron setup is in Phase 3.
- The world map currently unlocks only the first 2 cities (Mekong + Sài Gòn). To unlock more during dev, edit `src/components/map/WorldMap.tsx` (search for `i <= 1`).

## Quick verification

To confirm Phase 1 still works end-to-end:

```bash
npm run dev
# Visit http://localhost:3000
# Click "Get started" → magic link to your inbox → click → onboarding → world map
# Tap Mekong (Unit 0, Lesson 1) → complete a tone-match → confetti → /me shows stats
```
