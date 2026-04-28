"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, Mic, Square, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import type { SpeakExercise as Ex } from "@/lib/game/types";
import { ToneBadge } from "@/components/game/ToneBadge";
import { spokenTone, type ToneId } from "@/lib/game/tones";
import { playVietnamese } from "@/lib/game/audio";
import { gradeTone } from "@/lib/speech/tone-detect";
import { gradePhoneme, type PhonemeResult } from "@/lib/speech/phoneme-match";
import { useMicRecorder } from "@/lib/speech/use-mic-recorder";
import { useSpeechRecognition } from "@/lib/speech/use-speech-recognition";
import { useAccessibilityStore } from "@/lib/stores/accessibility";
import { hasWebSpeechRecognition } from "@/lib/speech/browser-support";
import { cn } from "@/lib/utils";

type Phase =
  | { kind: "ready" }
  | { kind: "recording" }
  | { kind: "analyzing" }
  | {
      kind: "result";
      toneScore: number;
      phoneme: PhonemeResult;
      phonemeAvailable: boolean;
      contour: number[];
      correct: boolean;
    }
  | { kind: "unclear"; reason: string };

const PASS_TONE = 55;

export function SpeakExercise({
  exercise,
  onAnswer,
}: {
  exercise: Ex;
  onAnswer: (correct: boolean) => void;
}) {
  const mic = useMicRecorder();
  const speech = useSpeechRecognition();
  const setMicOptional = useAccessibilityStore((s) => s.setMicOptional);
  const [phase, setPhase] = useState<Phase>({ kind: "ready" });
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const dialect: "southern" | "northern" =
    exercise.dialectMerged === false ? "northern" : "southern";
  const targetTone = exercise.targetTone;

  useEffect(() => {
    const t = setTimeout(() => playVietnamese(exercise.audioText), 250);
    return () => clearTimeout(t);
  }, [exercise.audioText]);

  useEffect(() => {
    if (phase.kind !== "result") return;
    const t = setTimeout(() => onAnswer(phase.correct), 900);
    return () => clearTimeout(t);
  }, [phase, onAnswer]);

  useEffect(() => {
    if (phase.kind !== "unclear") return;
    const t = setTimeout(() => {
      if (phaseRef.current.kind === "unclear") setPhase({ kind: "ready" });
    }, 1800);
    return () => clearTimeout(t);
  }, [phase]);

  async function transcribeFallback(blob: Blob): Promise<string> {
    try {
      const form = new FormData();
      form.append("audio", blob);
      form.append("language", "vi");
      const res = await fetch("/api/stt", { method: "POST", body: form });
      if (!res.ok) return "";
      const data = (await res.json()) as { text?: string };
      return data.text ?? "";
    } catch {
      return "";
    }
  }

  async function onMicPress() {
    if (mic.state === "denied" || mic.state === "unsupported") return;
    if (phase.kind === "recording") {
      mic.stop();
      return;
    }
    if (phase.kind !== "ready") return;

    setPhase({ kind: "recording" });

    let webSpeechPromise: Promise<string> | null = null;
    if (hasWebSpeechRecognition()) {
      webSpeechPromise = speech.start("vi-VN").catch(() => "");
    }

    try {
      const result = await mic.start();
      speech.stop();
      setPhase({ kind: "analyzing" });

      const tone = gradeTone(result.pcm, result.sampleRate, targetTone, dialect);
      if (!tone.clarityOk) {
        setPhase({ kind: "unclear", reason: "Couldn't hear clearly. Speak a bit louder?" });
        return;
      }

      let heard = (await (webSpeechPromise ?? Promise.resolve(""))).trim();
      let phonemeAvailable = heard.length > 0;
      if (!phonemeAvailable) {
        heard = (await transcribeFallback(result.blob)).trim();
        phonemeAvailable = heard.length > 0;
      }

      const phoneme: PhonemeResult = phonemeAvailable
        ? gradePhoneme(heard, exercise.targetText)
        : { score: 100, heard: "", expected: exercise.targetText, distance: 0 };

      const tonePass = tone.score >= PASS_TONE;
      // Tone is the gate. Phoneme is informational — surfaced in the result panel so the
      // learner sees what was heard, but Web Speech / Whisper on Vietnamese is unreliable
      // enough that letting it block correctness produced a lot of false negatives.
      const correct = tonePass;

      setPhase({
        kind: "result",
        toneScore: tone.score,
        phoneme,
        phonemeAvailable,
        contour: tone.contour,
        correct,
      });
    } catch {
      setPhase({ kind: "ready" });
    }
  }

  function switchToToneMatch() {
    setMicOptional(true);
  }

  if (mic.state === "denied" || mic.state === "unsupported") {
    return (
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold">{exercise.prompt}</h2>
        <div className="card-soft p-6 text-center space-y-3">
          <div className="font-display text-lg font-bold">Mic unavailable</div>
          <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)]">
            {mic.state === "denied"
              ? "Permission denied. Switch to tap-only mode for now?"
              : "Your browser doesn't support microphone capture."}
          </p>
          <button
            onClick={switchToToneMatch}
            className="rounded-full bg-[var(--color-lotus-500)] px-5 py-2 font-display font-bold text-white shadow-[0_4px_0_0_rgba(26,20,35,0.18)] active:scale-[0.98]"
          >
            Switch to Tone Match
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">{exercise.prompt}</h2>
      {exercise.promptEnglish && (
        <p className="-mt-4 text-sm text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
          {exercise.promptEnglish}
        </p>
      )}

      <button
        onClick={() => playVietnamese(exercise.audioText)}
        className="card-soft mx-auto flex w-full max-w-sm items-center justify-center gap-3 py-6 transition-transform hover:-translate-y-0.5"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-lotus-400)] text-white shadow-[0_4px_0_0_var(--color-lotus-600)]"
        >
          <Volume2 size={26} />
        </motion.div>
        <div className="text-left">
          <div className="font-display text-xs uppercase tracking-wide text-[var(--color-lotus-600)]">
            Tap to hear
          </div>
          <div className="font-display text-2xl font-bold">{exercise.targetText}</div>
        </div>
      </button>

      <div className="flex flex-col items-center gap-4">
        {phase.kind === "ready" && (
          <button
            onClick={onMicPress}
            className="grid h-24 w-24 place-items-center rounded-full bg-[var(--color-jade-500)] text-white shadow-[0_6px_0_0_var(--color-jade-600)] active:translate-y-0.5 active:shadow-[0_4px_0_0_var(--color-jade-600)]"
            aria-label="Start recording"
          >
            <Mic size={42} />
          </button>
        )}

        {phase.kind === "recording" && (
          <>
            <motion.button
              onClick={onMicPress}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="grid h-24 w-24 place-items-center rounded-full bg-[var(--color-lotus-500)] text-white shadow-[0_6px_0_0_var(--color-lotus-700)] active:translate-y-0.5 active:shadow-[0_4px_0_0_var(--color-lotus-700)]"
              aria-label="Stop recording"
            >
              <Square size={36} fill="currentColor" />
            </motion.button>
            <div className="h-2 w-48 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--color-lacquer)_8%,transparent)]">
              <motion.div
                className="h-full bg-[var(--color-lotus-500)]"
                animate={{ width: `${Math.round(mic.level * 100)}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>
            <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
              Listening… speak now
            </div>
          </>
        )}

        {phase.kind === "analyzing" && (
          <>
            <div className="grid h-24 w-24 place-items-center rounded-full bg-[var(--color-lotus-200)]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="h-10 w-10 rounded-full border-4 border-white border-t-transparent"
              />
            </div>
            <div className="font-display text-sm">Đang nghe…</div>
          </>
        )}

        {phase.kind === "unclear" && (
          <div className="rounded-2xl border-2 border-[var(--color-lotus-200)] bg-[var(--color-lotus-50)] p-4 text-center">
            <div className="font-display font-semibold">Hmm…</div>
            <div className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_70%,transparent)]">
              {phase.reason}
            </div>
          </div>
        )}

        {phase.kind === "result" && (
          <ResultPanel phase={phase} targetTone={spokenTone(targetTone, dialect)} />
        )}
      </div>
    </div>
  );
}

function ResultPanel({
  phase,
  targetTone,
}: {
  phase: Extract<Phase, { kind: "result" }>;
  targetTone: ToneId;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-full max-w-sm space-y-3 rounded-2xl border-2 p-4",
        phase.correct
          ? "border-[var(--color-jade-300)] bg-[var(--color-jade-50)]"
          : "border-[var(--color-lotus-300)] bg-[var(--color-lotus-50)]",
      )}
    >
      <div className="flex items-center gap-3">
        <ToneBadge toneId={targetTone} size="md" highlighted={phase.toneScore >= PASS_TONE} />
        <div className="flex-1 min-w-0">
          <div className="font-display text-sm font-bold">Tone</div>
          <div className="text-xs">
            {phase.toneScore}/100 {phase.toneScore >= PASS_TONE ? "✓" : "—"}
          </div>
        </div>
        <ContourSparkline contour={phase.contour} />
      </div>
      {phase.phonemeAvailable ? (
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-full text-white",
              phase.phoneme.score === 100
                ? "bg-[var(--color-jade-500)]"
                : "bg-[var(--color-gold-500)]",
            )}
            title={phase.phoneme.score === 100 ? "Word matched" : "Word didn't match exactly — Vietnamese ASR is approximate"}
          >
            {phase.phoneme.score === 100 ? <Check size={16} /> : <X size={16} />}
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <div className="font-display font-bold">Heard you say</div>
            <div className="font-display text-base">{phase.phoneme.heard || "—"}</div>
            <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
              Target: <span className="font-semibold">{phase.phoneme.expected}</span>
              {phase.phoneme.score !== 100 && " · ASR is approximate; tone is the grade"}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs italic text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
          Word check unavailable — graded on tone only.
        </div>
      )}
    </motion.div>
  );
}

function ContourSparkline({ contour }: { contour: number[] }) {
  if (contour.length < 2) {
    return <div className="h-9 w-22" />;
  }
  const N = 20;
  const sampled: number[] = Array.from({ length: N }, (_, i) => {
    const idx = (i * (contour.length - 1)) / (N - 1);
    const lo = Math.floor(idx);
    const hi = Math.min(lo + 1, contour.length - 1);
    const frac = idx - lo;
    return contour[lo] * (1 - frac) + contour[hi] * frac;
  });
  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const range = Math.max(20, max - min);
  const points = sampled
    .map((v, i) => {
      const x = (i * 80) / (N - 1) + 4;
      const y = 30 - ((v - min) / range) * 26;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width="88" height="36" className="shrink-0 text-[var(--color-lacquer)] opacity-70">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
