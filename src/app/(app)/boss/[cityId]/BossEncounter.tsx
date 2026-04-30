"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sword, Shield, Gem } from "lucide-react";
import type { Boss } from "@/lib/game/bosses";
import { TONES, type ToneId } from "@/lib/game/tones";
import { ToneBadge } from "@/components/game/ToneBadge";
import { MascotSlot } from "@/components/game/MascotSlot";
import { playVietnamese as playAudio } from "@/lib/game/audio";
import { completeBoss, type BossResult } from "@/server/actions/boss";

const BOSS_SYLLABLES = [
  "ma", "má", "mà", "mạ", "ba", "bá", "bà", "bạ",
  "la", "lá", "là", "lạ", "ca", "cá", "cà", "cạ",
  "ta", "tá", "tà", "tạ", "na", "ná", "nà", "nạ",
];

function toneFromSyllable(s: string): ToneId {
  const m = s.normalize("NFD");
  if (/́/.test(m)) return "sac";
  if (/̀/.test(m)) return "huyen";
  if (/̉/.test(m)) return "hoi";
  if (/̃/.test(m)) return "nga";
  if (/̣/.test(m)) return "nang";
  return "ngang";
}

function generateQuestions(count: number) {
  const shuffled = [...BOSS_SYLLABLES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((s) => ({ syllable: s, answer: toneFromSyllable(s) }));
}

type Phase = "intro" | "battle" | "victory" | "defeat";

export function BossEncounter({ boss, userLevel }: { boss: Boss; userLevel: number }) {
  const router = useRouter();
  const TOTAL = 10;
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions] = useState(() => generateQuestions(TOTAL));
  const [qIdx, setQIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [bossHp, setBossHp] = useState(boss.winThreshold * 10);
  const [playerHp, setPlayerHp] = useState(3);
  const [flash, setFlash] = useState<"hit" | "miss" | null>(null);
  const [result, setResult] = useState<BossResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentQ = questions[qIdx];
  const bossHpPct = Math.max(0, (bossHp / (boss.winThreshold * 10)) * 100);
  const playerHpPct = Math.max(0, (playerHp / 3) * 100);

  function handleAnswer(tone: ToneId) {
    if (!currentQ || flash) return;
    const isCorrect = tone === currentQ.answer;

    if (isCorrect) {
      setCorrect((c) => c + 1);
      setBossHp((h) => Math.max(0, h - 10));
      setFlash("hit");
    } else {
      setPlayerHp((h) => Math.max(0, h - 1));
      setFlash("miss");
    }

    setTimeout(() => {
      setFlash(null);
      const nextIdx = qIdx + 1;
      const finalCorrect = isCorrect ? correct + 1 : correct;
      const finalHp = isCorrect ? playerHp : playerHp - 1;

      if (nextIdx >= TOTAL || finalHp <= 0) {
        const won = finalCorrect >= boss.winThreshold;
        if (won) {
          startTransition(async () => {
            const res = await completeBoss(boss.id, boss.xpReward, boss.gemsReward, finalCorrect);
            setResult(res);
            setPhase("victory");
          });
        } else {
          setPhase("defeat");
        }
      } else {
        setQIdx(nextIdx);
        playAudio(questions[nextIdx].syllable).catch(() => {});
      }
    }, 600);
  }

  function startBattle() {
    setPhase("battle");
    playAudio(currentQ?.syllable ?? "ma").catch(() => {});
  }

  const locked = userLevel < boss.requiredUnit;

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-6 gap-4">
      {phase === "intro" && (
        <IntroPanel boss={boss} locked={locked} onStart={startBattle} onBack={() => router.back()} />
      )}
      {phase === "battle" && currentQ && (
        <BattlePanel
          boss={boss}
          currentQ={currentQ}
          qIdx={qIdx}
          total={TOTAL}
          bossHpPct={bossHpPct}
          playerHp={playerHp}
          flash={flash}
          onAnswer={handleAnswer}
        />
      )}
      {phase === "victory" && (
        <OutcomePanel
          won
          boss={boss}
          correct={correct}
          total={TOTAL}
          result={result}
          loading={isPending}
          onContinue={() => router.push("/learn")}
        />
      )}
      {phase === "defeat" && (
        <OutcomePanel
          won={false}
          boss={boss}
          correct={correct}
          total={TOTAL}
          result={null}
          loading={false}
          onContinue={() => router.push("/learn")}
        />
      )}
    </div>
  );
}

function IntroPanel({ boss, locked, onStart, onBack }: {
  boss: Boss; locked: boolean; onStart: () => void; onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-8xl"
      >
        {boss.emoji}
      </motion.div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)]">
          City Boss
        </div>
        <h1 className="font-display text-3xl font-extrabold">{boss.name}</h1>
        <div className="text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
          {boss.title}
        </div>
      </div>
      <div className="card-soft p-4 text-sm text-left">
        <p>{boss.description}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <span className="font-semibold text-[var(--color-lotus-600)]">
            Win {boss.winThreshold}/{10} correct
          </span>
          <span className="font-semibold text-[var(--color-gold-600)]">
            +{boss.xpReward} XP
          </span>
          <span className="font-semibold text-[var(--color-jade-600)]">
            +{boss.gemsReward} 💎
          </span>
        </div>
      </div>
      {locked ? (
        <div className="rounded-2xl bg-[color-mix(in_oklab,var(--color-lacquer)_8%,transparent)] p-4 text-sm">
          Complete Unit {boss.requiredUnit} to unlock this boss.
        </div>
      ) : (
        <button
          onClick={onStart}
          className="w-full rounded-full bg-gradient-to-r from-[var(--color-lotus-500)] to-[var(--color-gold-500)] py-3 font-display font-bold text-white shadow-[0_4px_0_0_rgba(26,20,35,0.2)]"
        >
          <Sword size={16} className="inline mr-2" /> Challenge!
        </button>
      )}
      <button
        onClick={onBack}
        className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]"
      >
        ← Back
      </button>
    </div>
  );
}

function BattlePanel({ boss, currentQ, qIdx, total, bossHpPct, playerHp, flash, onAnswer }: {
  boss: Boss;
  currentQ: { syllable: string; answer: ToneId };
  qIdx: number;
  total: number;
  bossHpPct: number;
  playerHp: number;
  flash: "hit" | "miss" | null;
  onAnswer: (t: ToneId) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-display font-bold">{boss.emoji} {boss.name}</span>
          <span className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
            Q {qIdx + 1}/{total}
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-[color-mix(in_oklab,var(--color-lacquer)_10%,transparent)]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-lotus-500)] to-[var(--color-gold-400)]"
            animate={{ width: `${bossHpPct}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Shield size={16} className="text-[var(--color-jade-500)]" />
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              size={20}
              className={i < playerHp ? "fill-[var(--color-lotus-500)] text-[var(--color-lotus-500)]" : "text-[color-mix(in_oklab,var(--color-lacquer)_20%,transparent)]"}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className={`card-soft p-6 text-center transition-colors ${
            flash === "hit" ? "bg-[var(--color-jade-50)] border-[var(--color-jade-300)]" :
            flash === "miss" ? "bg-[var(--color-lotus-50)] border-[var(--color-lotus-300)]" : ""
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)] mb-2">
            What tone is this?
          </div>
          <div className="font-display text-8xl font-extrabold" lang="vi">
            {currentQ.syllable}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-2">
        {TONES.map((t) => (
          <button
            key={t.id}
            onClick={() => onAnswer(t.id)}
            disabled={flash !== null}
            className="rounded-2xl border-2 border-[var(--color-border)] bg-white p-3 font-display font-bold hover:border-[var(--color-lotus-400)] hover:bg-[var(--color-lotus-50)] active:scale-95 transition-all disabled:opacity-50"
          >
            <ToneBadge toneId={t.id} size="md" />
            <div className="text-xs mt-1 text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
              {t.english}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function OutcomePanel({ won, boss, correct, total, result, loading, onContinue }: {
  won: boolean; boss: Boss; correct: number; total: number;
  result: BossResult | null; loading: boolean; onContinue: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <MascotSlot size={100} emote={won ? "cheer" : "shrug"} />
      <div>
        <div className="font-display text-4xl font-extrabold">
          {won ? "Victory! 🎉" : "Defeated…"}
        </div>
        <div className="mt-1 text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
          {correct}/{total} correct
        </div>
      </div>
      {won && (
        <div className="card-soft p-4 space-y-2 text-sm w-full">
          <div className="font-display font-bold text-[var(--color-gold-600)]">
            {loading ? "Saving rewards…" : "Rewards earned!"}
          </div>
          {!loading && result && (
            <>
              <div className="flex items-center justify-between">
                <span>XP earned</span>
                <span className="font-bold text-[var(--color-jade-600)]">+{result.xpEarned}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><Gem size={14} /> Gems</span>
                <span className="font-bold text-[var(--color-tone-nga)]">+{result.gemsEarned}</span>
              </div>
              {result.newAchievements.length > 0 && (
                <div className="text-[var(--color-lotus-600)] font-semibold text-xs">
                  🏆 {result.newAchievements.length} new achievement{result.newAchievements.length > 1 ? "s" : ""} unlocked!
                </div>
              )}
            </>
          )}
        </div>
      )}
      <button
        onClick={onContinue}
        disabled={won && loading}
        className="w-full rounded-full bg-gradient-to-r from-[var(--color-jade-500)] to-[var(--color-lotus-500)] py-3 font-display font-bold text-white shadow-[0_4px_0_0_rgba(26,20,35,0.2)] disabled:opacity-60"
      >
        {won ? "Continue Journey" : "Try Again Later"}
      </button>
    </div>
  );
}
