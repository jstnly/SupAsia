"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Copy, Check, Sword, Trophy, Timer } from "lucide-react";
import { TONES, type ToneId } from "@/lib/game/tones";
import { ToneBadge } from "@/components/game/ToneBadge";
import { playVietnamese as playAudio } from "@/lib/game/audio";
import { joinDuel, finalizeDuel, type DuelRow } from "@/server/actions/duel";
import { MascotSlot } from "@/components/game/MascotSlot";
import { cn } from "@/lib/utils";

const ROUNDS = 10;
const ROUND_MS = 5000;
const SYLLABLES = [
  "ma", "má", "mà", "mả", "mã", "mạ",
  "ba", "bá", "bà", "bả", "bã", "bạ",
  "ca", "cá", "cà", "cả", "cã", "cạ",
  "da", "dá", "dà", "dả", "dã", "dạ",
  "la", "lá", "là", "lả", "lã", "lạ",
];

type RoundData = { syllable: string; answer: ToneId };
type PlayerState = { score: number; answeredThisRound: boolean; lastCorrect: boolean | null };

type Phase =
  | { kind: "waiting" }
  | { kind: "countdown"; secs: number }
  | { kind: "playing"; round: number; roundData: RoundData; timeLeft: number }
  | { kind: "round-result"; round: number; correct: boolean; roundData: RoundData }
  | { kind: "finished"; hostScore: number; guestScore: number; winnerId: string | null | undefined };

function toneFromSyllable(s: string): ToneId {
  const m = s.normalize("NFD");
  if (/́/.test(m)) return "sac";
  if (/̀/.test(m)) return "huyen";
  if (/̉/.test(m)) return "hoi";
  if (/̃/.test(m)) return "nga";
  if (/̣/.test(m)) return "nang";
  return "ngang";
}

function generateRounds(): RoundData[] {
  const shuffled = [...SYLLABLES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, ROUNDS).map((s) => ({ syllable: s, answer: toneFromSyllable(s) }));
}

export function DuelRoom({
  duelId,
  userId,
  initialDuel,
  isHost,
  canJoin,
}: {
  duelId: string;
  userId: string;
  initialDuel: DuelRow;
  isHost: boolean;
  canJoin: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const roundsRef = useRef<RoundData[]>([]);

  const [phase, setPhase] = useState<Phase>(
    initialDuel.status === "finished"
      ? {
          kind: "finished",
          hostScore: initialDuel.hostScore,
          guestScore: initialDuel.guestScore,
          winnerId: initialDuel.winnerId,
        }
      : { kind: "waiting" },
  );
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [copied, setCopied] = useState(false);
  const [joining, startJoin] = useTransition();
  const [finalizing, startFinalize] = useTransition();
  const myScoreRef = useRef(0);
  const oppScoreRef = useRef(0);

  function broadcast(event: string, payload: Record<string, unknown>) {
    channelRef.current?.send({ type: "broadcast", event, payload });
  }

  const startCountdown = useCallback(() => {
    let secs = 3;
    setPhase({ kind: "countdown", secs });
    const iv = setInterval(() => {
      secs -= 1;
      if (secs <= 0) {
        clearInterval(iv);
        startRound(0);
      } else {
        setPhase({ kind: "countdown", secs });
      }
    }, 1000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startRound = useCallback((round: number) => {
    if (round >= ROUNDS) {
      const hs = isHost ? myScoreRef.current : oppScoreRef.current;
      const gs = isHost ? oppScoreRef.current : myScoreRef.current;
      startFinalize(async () => {
        await finalizeDuel(duelId, hs, gs);
      });
      setPhase({ kind: "finished", hostScore: hs, guestScore: gs, winnerId: null });
      return;
    }
    const rd = roundsRef.current[round];
    if (!rd) return;
    let timeLeft = ROUND_MS;
    setPhase({ kind: "playing", round, roundData: rd, timeLeft });
    playAudio(rd.syllable, { voice: "vi-VN-Neural2-D" }).catch(() => {});
    const iv = setInterval(() => {
      timeLeft -= 100;
      if (timeLeft <= 0) {
        clearInterval(iv);
        setPhase({ kind: "round-result", round, correct: false, roundData: rd });
        setTimeout(() => startRound(round + 1), 1500);
      } else {
        setPhase((p) =>
          p.kind === "playing" ? { ...p, timeLeft } : p,
        );
      }
    }, 100);
  }, [duelId, isHost, startFinalize]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = useCallback(
    (tone: ToneId) => {
      setPhase((p) => {
        if (p.kind !== "playing") return p;
        const correct = tone === p.roundData.answer;
        if (correct) {
          const next = myScore + 1;
          setMyScore(next);
          myScoreRef.current = next;
        }
        broadcast("answer", { round: p.round, correct, userId });
        setTimeout(() => startRound(p.round + 1), 1500);
        return { kind: "round-result", round: p.round, correct, roundData: p.roundData };
      });
    },
    [myScore, userId, startRound], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    const ch = supabase.channel(`duel:${duelId}`, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = ch;

    ch.on("broadcast", { event: "opponent:joined" }, () => {
      if (isHost) {
        roundsRef.current = generateRounds();
        broadcast("rounds", { rounds: roundsRef.current });
        startCountdown();
      }
    });

    ch.on("broadcast", { event: "rounds" }, ({ payload }) => {
      roundsRef.current = payload.rounds as RoundData[];
      startCountdown();
    });

    ch.on("broadcast", { event: "answer" }, ({ payload }) => {
      if ((payload as { userId: string }).userId !== userId) {
        if ((payload as { correct: boolean }).correct) {
          setOppScore((s) => {
            const next = s + 1;
            oppScoreRef.current = next;
            return next;
          });
        }
      }
    });

    ch.subscribe();

    if (!isHost && canJoin) {
      startJoin(async () => {
        const result = await joinDuel(duelId);
        if (!result.success) return;
        broadcast("opponent:joined", { userId });
      });
    }

    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duelId]);

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.href}` : "";

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-6 gap-6">
      {/* Score bar */}
      <div className="flex items-center justify-between card-soft px-5 py-3">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)]">You</div>
          <div className="font-display text-3xl font-extrabold tabular-nums">{myScore}</div>
        </div>
        <Sword size={22} className="text-[var(--color-gold-400)]" />
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
            Opponent
          </div>
          <div className="font-display text-3xl font-extrabold tabular-nums">{oppScore}</div>
        </div>
      </div>

      {/* Phase-specific content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {phase.kind === "waiting" && (
          <WaitingPanel
            isHost={isHost}
            canJoin={canJoin}
            shareUrl={shareUrl}
            copied={copied}
            onCopy={copyLink}
            joining={joining}
          />
        )}
        {phase.kind === "countdown" && (
          <div className="text-center">
            <div className="font-display text-8xl font-extrabold text-[var(--color-lotus-500)]">
              {phase.secs}
            </div>
            <div className="font-display text-xl text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
              Get ready…
            </div>
          </div>
        )}
        {phase.kind === "playing" && (
          <PlayingPanel phase={phase} onAnswer={handleAnswer} />
        )}
        {phase.kind === "round-result" && (
          <RoundResultPanel phase={phase} />
        )}
        {phase.kind === "finished" && (
          <FinishedPanel
            phase={phase}
            userId={userId}
            isHost={isHost}
            onRematch={() => router.push("/duel")}
            onHome={() => router.push("/learn")}
          />
        )}
      </div>
    </div>
  );
}

function WaitingPanel({
  isHost,
  canJoin,
  shareUrl,
  copied,
  onCopy,
  joining,
}: {
  isHost: boolean;
  canJoin: boolean;
  shareUrl: string;
  copied: boolean;
  onCopy: () => void;
  joining: boolean;
}) {
  return (
    <div className="card-soft w-full p-6 space-y-4 text-center">
      <MascotSlot size={80} emote="idle" />
      {isHost ? (
        <>
          <h2 className="font-display text-xl font-bold">Waiting for opponent</h2>
          <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
            Share this link with your opponent to start the duel.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 truncate rounded-full border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-lacquer)_5%,transparent)] px-4 py-2 text-sm font-mono">
              {shareUrl}
            </div>
            <button
              onClick={onCopy}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-jade-500)] text-white shadow-[0_3px_0_0_rgba(26,20,35,0.2)]"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </>
      ) : canJoin ? (
        <>
          <h2 className="font-display text-xl font-bold">
            {joining ? "Joining duel…" : "Joining…"}
          </h2>
          <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
            Connecting you to the room.
          </p>
        </>
      ) : (
        <>
          <h2 className="font-display text-xl font-bold">Game in progress</h2>
          <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
            This duel has already started.
          </p>
        </>
      )}
    </div>
  );
}

function PlayingPanel({
  phase,
  onAnswer,
}: {
  phase: Extract<Phase, { kind: "playing" }>;
  onAnswer: (tone: ToneId) => void;
}) {
  const progressPct = (phase.timeLeft / ROUND_MS) * 100;
  return (
    <div className="w-full space-y-6 text-center">
      <div className="flex items-center justify-between text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
        <span>Round {phase.round + 1} / {ROUNDS}</span>
        <span className="flex items-center gap-1">
          <Timer size={14} />
          {(phase.timeLeft / 1000).toFixed(1)}s
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-[color-mix(in_oklab,var(--color-lacquer)_10%,transparent)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-lotus-400)] to-[var(--color-gold-400)] transition-[width] duration-100"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="font-display text-8xl font-extrabold tracking-tight" lang="vi">
        {phase.roundData.syllable}
      </div>
      <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
        What tone is this?
      </p>
      <div className="grid grid-cols-3 gap-3">
        {TONES.map((t) => (
          <button
            key={t.id}
            onClick={() => onAnswer(t.id)}
            className="rounded-2xl border-2 border-[var(--color-border)] bg-white p-3 font-display font-bold hover:border-[var(--color-lotus-400)] hover:bg-[var(--color-lotus-50)] active:scale-95 transition-all"
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

function RoundResultPanel({
  phase,
}: {
  phase: Extract<Phase, { kind: "round-result" }>;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-3xl p-8 text-center",
        phase.correct
          ? "bg-[var(--color-jade-50)] border-2 border-[var(--color-jade-300)]"
          : "bg-[var(--color-lotus-50)] border-2 border-[var(--color-lotus-300)]",
      )}
    >
      <div className="font-display text-4xl font-extrabold mb-2">
        {phase.correct ? "Đúng! ✓" : "Sai ✗"}
      </div>
      <div className="text-2xl font-bold" lang="vi">
        {phase.roundData.syllable}
      </div>
      <div className="mt-2 text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
        Tone: <span className="font-semibold">{TONES.find((t) => t.id === phase.roundData.answer)?.name}</span>
        {" "}({TONES.find((t) => t.id === phase.roundData.answer)?.english})
      </div>
    </div>
  );
}

function FinishedPanel({
  phase,
  userId,
  isHost,
  onRematch,
  onHome,
}: {
  phase: Extract<Phase, { kind: "finished" }>;
  userId: string;
  isHost: boolean;
  onRematch: () => void;
  onHome: () => void;
}) {
  const myScore = isHost ? phase.hostScore : phase.guestScore;
  const theirScore = isHost ? phase.guestScore : phase.hostScore;
  const iWon = myScore > theirScore;
  const tied = myScore === theirScore;

  return (
    <div className="w-full space-y-4 text-center">
      <MascotSlot size={96} emote={iWon ? "cheer" : tied ? "idle" : "shrug"} />
      <div className="font-display text-4xl font-extrabold">
        {iWon ? "Thắng! 🎉" : tied ? "Hòa!" : "Thua rồi…"}
      </div>
      <div className="font-display text-2xl">
        {myScore} – {theirScore}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onHome}
          className="flex-1 rounded-full border-2 border-[var(--color-border)] py-3 font-display font-bold"
        >
          Home
        </button>
        <button
          onClick={onRematch}
          className="flex-1 rounded-full bg-gradient-to-r from-[var(--color-lotus-500)] to-[var(--color-gold-500)] py-3 font-display font-bold text-white shadow-[0_4px_0_0_rgba(26,20,35,0.2)]"
        >
          New Duel
        </button>
      </div>
    </div>
  );
}
