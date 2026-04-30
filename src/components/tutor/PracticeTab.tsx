"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, RefreshCw, Volume2 } from "lucide-react";
import { completeConversation } from "@/server/actions/conversation";
import { MascotSlot } from "@/components/game/MascotSlot";
import { SCENARIOS, SCENARIO_BY_ID, type Scenario, type ScenarioId } from "@/lib/tutor/scenarios";
import { respondToScenario } from "@/lib/tutor/respond";
import { playVietnamese } from "@/lib/game/audio";
import { SuggestionChips } from "./SuggestionChips";

const XP_MILESTONE = 10;

type Message = {
  role: "user" | "assistant";
  content: string;
  contentEn?: string;
  hint?: { vi: string; en: string };
  teach?: { word: string; meaning: string }[];
  audioText?: string;
};

export function PracticeTab({ userLevel, dialect }: { userLevel: number; dialect: string }) {
  const [scenarioId, setScenarioId] = useState<ScenarioId | null>(null);
  const [currentTurnId, setCurrentTurnId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [exchangeCount, setExchangeCount] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [xpResult, setXpResult] = useState<{ xpEarned: number; newAchievements: string[] } | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function startScenario(id: ScenarioId) {
    const scenario = SCENARIO_BY_ID[id];
    setScenarioId(id);
    setMessages([]);
    setExchangeCount(0);
    setSessionEnded(false);
    setReachedEnd(false);
    setXpResult(null);
    const startTurn = scenario.turns[scenario.startId];
    setCurrentTurnId(scenario.startId);
    // First NPC line
    setMessages([
      {
        role: "assistant",
        content: startTurn.npc.vi,
        contentEn: startTurn.npc.en,
        audioText: startTurn.npc.audioText ?? startTurn.npc.vi,
      },
    ]);
  }

  function handleSend(text?: string) {
    const reply = (text ?? input).trim();
    if (!reply || !scenarioId || reachedEnd) return;
    const userMsg: Message = { role: "user", content: reply };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setExchangeCount((c) => c + 1);

    const step = respondToScenario(scenarioId, currentTurnId, reply);
    if (!step) return;

    const assistantMsg: Message = {
      role: "assistant",
      content: step.npc.vi,
      contentEn: step.npc.en,
      audioText: step.npc.audioText ?? step.npc.vi,
      hint: step.matched ? undefined : step.hint,
      teach: step.teach,
    };
    setMessages((prev) => [...prev, assistantMsg]);
    if (step.matched) setCurrentTurnId(step.nextTurnId);
    if (step.end) setReachedEnd(true);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function endSession() {
    if (sessionEnded) return;
    setSessionEnded(true);
    startTransition(async () => {
      const result = await completeConversation(exchangeCount, scenarioId ?? "free");
      if (result.success) setXpResult({ xpEarned: result.xpEarned, newAchievements: result.newAchievements });
    });
  }

  // ── Scenario picker ─────────────────────────────────────────────────────────
  if (!scenarioId) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="font-display font-bold mb-3">Choose a scenario</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {SCENARIOS.map((sc) => (
              <ScenarioCard key={sc.id} scenario={sc} onPick={() => startScenario(sc.id)} />
            ))}
          </div>
        </div>

        <div className="card-soft p-4 text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)] space-y-1">
          <div className="font-semibold text-[var(--color-lacquer)]">How it works</div>
          <div>• Type your reply in Vietnamese — Bồ accepts close matches even without diacritics.</div>
          <div>• Tap a suggestion chip if you&apos;re stuck.</div>
          <div>• Tap any Vietnamese line to hear it spoken.</div>
          <div>• Complete {XP_MILESTONE}+ exchanges to earn XP for your session.</div>
          <div>• Level {userLevel} · {dialect === "southern" ? "Southern dialect" : "Northern dialect"}</div>
        </div>
      </div>
    );
  }

  const sc = SCENARIO_BY_ID[scenarioId];
  const xpProgress = Math.min(exchangeCount / XP_MILESTONE, 1);
  const turn = sc.turns[currentTurnId];

  // ── Session ended ────────────────────────────────────────────────────────────
  if (sessionEnded && xpResult) {
    return (
      <div className="flex flex-col items-center gap-6 text-center py-8">
        <MascotSlot size={100} emote="cheer" />
        <div>
          <div className="font-display text-3xl font-extrabold">Giỏi lắm! 🎉</div>
          <div className="text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
            Great practice session!
          </div>
        </div>
        <div className="card-soft p-5 w-full max-w-xs space-y-2 text-sm">
          <div className="font-display font-bold text-[var(--color-gold-600)]">Session complete</div>
          <div className="flex justify-between"><span>Exchanges</span><span className="font-bold">{exchangeCount}</span></div>
          <div className="flex justify-between"><span>XP earned</span><span className="font-bold text-[var(--color-jade-600)]">+{xpResult.xpEarned}</span></div>
          {xpResult.newAchievements.length > 0 && (
            <div className="text-[var(--color-lotus-600)] font-semibold">
              🏆 New achievement{xpResult.newAchievements.length > 1 ? "s" : ""}!
            </div>
          )}
        </div>
        <button
          onClick={() => { setScenarioId(null); }}
          className="flex items-center gap-2 rounded-full bg-[var(--color-jade-500)] px-6 py-3 font-display font-bold text-white shadow-[0_4px_0_0_rgba(26,20,35,0.2)]"
        >
          <RefreshCw size={16} /> New Conversation
        </button>
      </div>
    );
  }

  // ── Chat view ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3" style={{ height: "calc(100dvh - 240px)", minHeight: 480 }}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xl">{sc.emoji}</span>
          <span className="font-display font-bold ml-2">{sc.title}</span>
          <span className="ml-2 text-xs text-[var(--color-jade-600)] font-medium">{sc.titleVi}</span>
        </div>
        <button
          onClick={() => setScenarioId(null)}
          className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)] hover:text-[var(--color-lacquer)] transition-colors"
        >
          ← Change
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
          <span>{exchangeCount}/{XP_MILESTONE} exchanges</span>
          {exchangeCount >= XP_MILESTONE && (
            <span className="text-[var(--color-jade-600)] font-semibold flex items-center gap-1">
              <Sparkles size={12} /> Ready to collect XP!
            </span>
          )}
        </div>
        <div className="h-1.5 w-full rounded-full bg-[color-mix(in_oklab,var(--color-lacquer)_10%,transparent)]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-jade-400)] to-[var(--color-lotus-400)]"
            animate={{ width: `${xpProgress * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {msg.role === "assistant" && (
                <div className="shrink-0 mt-1">
                  <MascotSlot size={28} emote="idle" />
                </div>
              )}
              <div className="max-w-[85%] space-y-1">
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-tr-sm bg-[var(--color-jade-500)] text-white"
                      : "rounded-tl-sm bg-white border border-[var(--color-border)] text-[var(--color-lacquer)]"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">{msg.content}</div>
                    {msg.role === "assistant" && msg.audioText && (
                      <button
                        onClick={() => playVietnamese(msg.audioText!)}
                        aria-label="Play"
                        className="shrink-0 grid h-6 w-6 place-items-center rounded-full bg-[var(--color-jade-100)] text-[var(--color-jade-700)] hover:bg-[var(--color-jade-200)] transition-colors"
                      >
                        <Volume2 size={12} />
                      </button>
                    )}
                  </div>
                  {msg.role === "assistant" && msg.contentEn && (
                    <div className="mt-1 text-[11px] text-[color-mix(in_oklab,var(--color-lacquer)_50%,transparent)] italic">
                      {msg.contentEn}
                    </div>
                  )}
                </div>
                {msg.hint && (
                  <div className="rounded-xl border border-dashed border-[var(--color-gold-400)] bg-[color-mix(in_oklab,var(--color-gold-100)_60%,transparent)] px-3 py-1.5 text-xs text-[var(--color-lacquer)]">
                    💡 Try: <button onClick={() => setInput(msg.hint!.vi)} className="font-semibold hover:underline">{msg.hint.vi}</button>
                  </div>
                )}
                {msg.teach && msg.teach.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {msg.teach.map((v, j) => (
                      <button
                        key={j}
                        onClick={() => playVietnamese(v.word)}
                        className="rounded-full bg-[var(--color-jade-50)] border border-[var(--color-jade-200)] px-2 py-0.5 text-[10px] text-[var(--color-lacquer)] hover:bg-[var(--color-jade-100)] transition-colors"
                      >
                        <span className="font-display font-bold">{v.word}</span>
                        <span className="ml-1 text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">{v.meaning}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="space-y-2">
        {turn?.suggestions && !reachedEnd && (
          <SuggestionChips suggestions={turn.suggestions} onPick={(t) => handleSend(t)} />
        )}
        {exchangeCount >= XP_MILESTONE && !sessionEnded && (
          <button
            onClick={endSession}
            disabled={isPending}
            className="w-full rounded-full bg-gradient-to-r from-[var(--color-jade-500)] to-[var(--color-lotus-500)] py-2.5 font-display font-bold text-white text-sm shadow-[0_3px_0_0_rgba(26,20,35,0.2)] disabled:opacity-60"
          >
            <Sparkles size={14} className="inline mr-1.5" />
            End session & collect XP
          </button>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={reachedEnd ? "Scenario complete — end session above 🎉" : "Nhập câu trả lời… [Type your reply…]"}
            rows={1}
            disabled={reachedEnd}
            className="flex-1 resize-none rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-jade-400)] disabled:opacity-50 max-h-32 overflow-y-auto"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || reachedEnd}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--color-jade-500)] text-white shadow-[0_3px_0_0_rgba(26,20,35,0.15)] disabled:opacity-40 transition-opacity"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ScenarioCard({ scenario, onPick }: { scenario: Scenario; onPick: () => void }) {
  return (
    <button
      onClick={onPick}
      className="card-soft flex items-start gap-3 p-4 text-left hover:border-[var(--color-jade-300)] hover:bg-[var(--color-jade-50)] transition-colors"
    >
      <span className="text-3xl leading-none">{scenario.emoji}</span>
      <div>
        <div className="font-display font-bold text-sm">{scenario.title}</div>
        <div className="text-xs text-[var(--color-jade-600)] font-medium">{scenario.titleVi}</div>
        <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)] mt-0.5">
          {scenario.description}
        </div>
      </div>
    </button>
  );
}
