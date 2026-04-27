# Continuation prompt

Drop this entire file into a fresh Claude Code session (any account, any device) and Claude will pick up where Phase 1 left off.

---

You are continuing work on **Biết Tiếng Việt** — a Vietnamese-learning RPG web app. Read [`CLAUDE.md`](./CLAUDE.md) at the repo root first; it has the full architecture, conventions, and phase roadmap.

## State of the repo (as of Phase 1 completion)

- Next.js 15 + React 19 + TS + Tailwind v4 scaffolded.
- Supabase Auth + Drizzle/Postgres schema in place. RLS policies live in `drizzle/0001_rls_and_triggers.sql`.
- Design system: tokens in `src/app/globals.css`, primitives in `src/components/ui/`, game atoms in `src/components/game/`. Mascot **Bồ** is an inline SVG with 8 palette variants and 6 emotes — Lottie upgrade is a Phase 2+ task.
- Curriculum: `src/lib/curriculum/units.ts` has Unit 0 (Âm Thanh — sounds + tones) and Unit 1 (Xin Chào — greetings). Default dialect: **Southern (Sài Gòn)**.
- Lesson engine + 3 activity types (Listen / Translate / Tone Match) + result screen with confetti.
- App routes: `/` (landing), `/login`, `/onboarding`, `/learn` (world map), `/learn/[unitId]`, `/lesson/[lessonId]`, `/me`, `/friends`, `/leaderboard`. Auth flow uses magic link + Google OAuth + guest.
- TTS via `/api/tts` → Google Cloud Vietnamese voice; falls back to browser Web Speech API.

## What is NOT done yet (in roughly this priority order)

1. **Run-time setup verification** — User has not yet pasted real Supabase + Google TTS credentials into `.env.local`. They need to (a) create a Supabase project, (b) `npm run db:push`, (c) paste `drizzle/0001_rls_and_triggers.sql` into Supabase SQL editor and run it, (d) enable anonymous sign-in in Supabase Auth provider settings if they want guest mode. CLAUDE.md "Setup" section documents this.
2. **Speak (Nói) exercise** — mic capture, `pitchy` pitch-contour grading for tones, Whisper-via-Groq fallback for non-Chrome browsers. Most important next feature for actual conversational practice.
3. **Remaining 4 lesson activity types** — Pair-match, Fill-blank, Short-story (with branching), and the speak exercise above. Patterns established by Listen/Translate/Tone Match make these straightforward — see CLAUDE.md "How to add a lesson activity type."
4. **Skill tree screen** — 4 branches × ~6 nodes (Conversationalist / Scholar / Tone Master / Storyteller). Unlocks at L5. Effects table joined into XP calculation in `completeLesson`.
5. **Units 2–12 content** — `src/lib/curriculum/units.ts` extension. Each unit needs ~6–8 lessons.
6. **Multiplayer (Phase 3)** — Tone Duel via Supabase Realtime broadcast. Matchmaking queue, score tracking, post-duel XP.
7. **Leagues weekly cron** — Supabase pg_cron job to refresh `leaderboard_weekly` materialized view + promote/demote weekly.
8. **Equipment + pets + shop, story campaign, achievements polish, Units 5–12, Northern dialect pack, PWA + push** — see Phase 4–5 in CLAUDE.md.

## Where to start

Ask the user which of (1)–(8) they want to tackle. If they pick (2) Speak exercise, here is the breadcrumb trail:

- Look at `src/components/lesson/ToneMatchExercise.tsx` for the cleanest pattern of audio-in / multiple-choice-out. The Speak exercise mirrors this but with `MediaRecorder` + `pitchy` instead of taps.
- Add `kind: "speak"` to the `Exercise` union in `src/lib/game/types.ts` with fields `{ targetText, targetTone, audioText, dialectMerged: boolean }`.
- Create `src/components/lesson/SpeakExercise.tsx`. UI: a big mic button, real-time pitch contour while recording, side-by-side with target contour, scoring 0–100.
- Add the `pitchy` integration to `src/lib/speech/tone-detect.ts` (new file) — extract f0 contour, normalize, compare against expected tone shape.
- Wire into `Lesson.tsx::ExerciseSwitch`.
- Add a `/api/stt/route.ts` for Whisper-via-Groq fallback when Web Speech API is unavailable.
- Author 4–6 speak exercises into Unit 1 (greetings are perfect targets — `chào`, `cảm ơn`, `tôi tên là …`).
- Settings: add a "mic-optional" toggle that swaps speak exercises for tone-match equivalents (accessibility requirement).

Verification: complete a speak exercise on a low-end laptop, in Chrome and Safari, with and without permission granted; ensure mic-optional fallback path works.

## Constraints

- Do not deviate from Southern dialect defaults unless the user asks.
- Tones must always be color + shape + letter, never color alone.
- Server mutations are Server Actions; avoid building unnecessary `/api/*` routes.
- Vietnamese text always with full NFC diacritics.
- Don't add backwards-compatibility shims; this is a young codebase, change things directly.

Read `CLAUDE.md` now and confirm the phase + propose next step.
