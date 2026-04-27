# Biết Tiếng Việt

> Learn Vietnamese as an RPG. Level up stats, unlock cities from the Mekong to Hà Nội, and duel your friends on tone challenges. Built for English-speaking beginners — conversational in 2–3 months.

A web app teaching **Southern Vietnamese** to American English speakers, with a Duolingo-style lesson engine, character stats, multiplayer leaderboards, and a buffalo mascot named **Bồ**.

- **Mascot:** Bồ, a baby water buffalo (8 palette variants, 6 emotes)
- **Dialect:** Southern (Sài Gòn) by default. Northern Pack unlocks at L25.
- **Curriculum:** 13 units, ~1,400 vocabulary words, A2+/early-B1 by completion.
- **Stats:** Thính, Khẩu, Văn, Bút, Từ Vựng, Thanh Điệu, Ngữ Pháp.
- **League:** Bậc Trà Sữa (Trà Đá → Trà Sen → Trà Sữa → Trà Đào → Trà Ô Long → Cà Phê Sữa Đá)

## Tech

Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Supabase (Postgres + Auth + Realtime) · Drizzle ORM · Google Cloud TTS

## Run it

```bash
npm install
cp .env.local.example .env.local
# fill in Supabase URL, anon key, service-role key, DATABASE_URL, and (optional) GOOGLE_TTS_API_KEY
npm run db:push
# then paste drizzle/0001_rls_and_triggers.sql into the Supabase SQL editor and run it
npm run dev
# open http://localhost:3000
```

See [`CLAUDE.md`](./CLAUDE.md) for full architecture, conventions, and phase roadmap.
See [`prompt.md`](./prompt.md) to continue building from a fresh AI session.

## Status

**Phase 1 complete.** Auth, onboarding, world map, 3 lesson activity types (Listen / Translate / Tone Match), Unit 0 + Unit 1 content, character sheet, friends, leaderboard. Phases 2–5 are speak grading, multiplayer, equipment/pets/shop, story campaign, and Units 2–12 content.

## License

For personal use. Bồ is yours; treat them well.
