"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, Sparkles, RefreshCw } from "lucide-react";
import { completeConversation } from "@/server/actions/conversation";
import { MascotSlot } from "@/components/game/MascotSlot";

type Scenario = {
  id: string;
  emoji: string;
  title: string;
  titleVi: string;
  description: string;
};

const SCENARIOS: Scenario[] = [
  { id: "cafe",       emoji: "☕", title: "At the Café",         titleVi: "Gọi Đồ Uống",     description: "Order drinks at a Sài Gòn cà phê" },
  { id: "market",     emoji: "🛒", title: "At the Market",       titleVi: "Mua Hàng Ở Chợ",  description: "Bargain and shop at Bến Thành" },
  { id: "meeting",    emoji: "🤝", title: "Meeting Someone New", titleVi: "Gặp Bạn Mới",      description: "Make friends at a language exchange" },
  { id: "restaurant", emoji: "🍜", title: "At the Restaurant",   titleVi: "Ăn Nhà Hàng",      description: "Dine at a Vietnamese restaurant" },
  { id: "directions", emoji: "🗺️", title: "Asking Directions",   titleVi: "Hỏi Đường",        description: "Navigate the streets of Sài Gòn" },
  { id: "free",       emoji: "💬", title: "Free Conversation",   titleVi: "Hội Thoại Tự Do",  description: "Chat freely with Bồ about anything" },
];

type Message = { role: "user" | "assistant"; content: string };

const XP_MILESTONE = 10; // exchanges to earn XP

export function ConversationPractice({
  userLevel,
  dialect,
}: {
  userLevel: number;
  dialect: string;
}) {
  const [scenario, setScenario] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [exchangeCount, setExchangeCount] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [xpResult, setXpResult] = useState<{ xpEarned: number; newAchievements: string[] } | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  async function startScenario(id: string) {
    setScenario(id);
    setMessages([]);
    setExchangeCount(0);
    setSessionEnded(false);
    setXpResult(null);
    // Trigger first AI message
    await sendToAI([], id);
  }

  async function sendToAI(history: Message[], scenarioId: string) {
    setStreaming(true);
    setStreamText("");

    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          scenario: scenarioId,
          userLevel,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Failed to connect");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamText(fullText);
      }

      const assistantMsg: Message = { role: "assistant", content: fullText };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamText("");
    } catch {
      setStreamText("");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Xin lỗi, có lỗi xảy ra. [Sorry, an error occurred.] Thử lại nhé!" },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || streaming || !scenario) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setExchangeCount((c) => c + 1);
    inputRef.current?.focus();

    await sendToAI(newMessages, scenario);
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
      const result = await completeConversation(exchangeCount, scenario ?? "free");
      if (result.success) setXpResult({ xpEarned: result.xpEarned, newAchievements: result.newAchievements });
    });
  }

  // ── Scenario picker ─────────────────────────────────────────────────────────
  if (!scenario) {
    return (
      <div className="space-y-6">
        <div className="card-soft flex items-center gap-4 p-5">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--color-jade-400)] to-[var(--color-lotus-500)] text-white">
            <MessageCircle size={28} />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-jade-600)]">
              Hội Thoại · Conversation Practice
            </div>
            <h1 className="font-display text-2xl font-extrabold">Chat with Bồ</h1>
            <p className="text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)]">
              Practice real Vietnamese conversations with your AI tutor.
            </p>
          </div>
        </div>

        <div>
          <h2 className="font-display font-bold mb-3">Choose a scenario</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => startScenario(sc.id)}
                className="card-soft flex items-start gap-3 p-4 text-left hover:border-[var(--color-jade-300)] hover:bg-[var(--color-jade-50)] transition-colors"
              >
                <span className="text-3xl leading-none">{sc.emoji}</span>
                <div>
                  <div className="font-display font-bold text-sm">{sc.title}</div>
                  <div className="text-xs text-[var(--color-jade-600)] font-medium">{sc.titleVi}</div>
                  <div className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)] mt-0.5">
                    {sc.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card-soft p-4 text-sm text-[color-mix(in_oklab,var(--color-lacquer)_60%,transparent)] space-y-1">
          <div className="font-semibold text-[var(--color-lacquer)]">Tips</div>
          <div>• Write in Vietnamese — Bồ will gently correct mistakes in context</div>
          <div>• Use diacritics if you can (á à ả ã ạ) — they matter!</div>
          <div>• Complete {XP_MILESTONE}+ exchanges to earn XP for your session</div>
          <div>• Level {userLevel} · {dialect === "southern" ? "Southern dialect" : "Northern dialect"}</div>
        </div>
      </div>
    );
  }

  const sc = SCENARIOS.find((s) => s.id === scenario)!;
  const xpProgress = Math.min(exchangeCount / XP_MILESTONE, 1);

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
          onClick={() => { setScenario(null); setMessages([]); setExchangeCount(0); setSessionEnded(false); setXpResult(null); }}
          className="flex items-center gap-2 rounded-full bg-[var(--color-jade-500)] px-6 py-3 font-display font-bold text-white shadow-[0_4px_0_0_rgba(26,20,35,0.2)]"
        >
          <RefreshCw size={16} /> New Conversation
        </button>
      </div>
    );
  }

  // ── Chat view ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3" style={{ height: "calc(100dvh - 200px)", minHeight: 480 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xl">{sc.emoji}</span>
          <span className="font-display font-bold ml-2">{sc.title}</span>
          <span className="ml-2 text-xs text-[var(--color-jade-600)] font-medium">{sc.titleVi}</span>
        </div>
        <button
          onClick={() => setScenario(null)}
          className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)] hover:text-[var(--color-lacquer)] transition-colors"
        >
          ← Change
        </button>
      </div>

      {/* XP progress */}
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

      {/* Messages */}
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
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-tr-sm bg-[var(--color-jade-500)] text-white"
                    : "rounded-tl-sm bg-white border border-[var(--color-border)] text-[var(--color-lacquer)]"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {/* Streaming bubble */}
          {streaming && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 flex-row"
            >
              <div className="shrink-0 mt-1">
                <MascotSlot size={28} emote="idle" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white border border-[var(--color-border)] px-4 py-2.5 text-sm leading-relaxed">
                {streamText || (
                  <span className="flex gap-1 items-center text-[color-mix(in_oklab,var(--color-lacquer)_40%,transparent)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="space-y-2">
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
            placeholder="Nhập câu trả lời… [Type your reply…]"
            rows={1}
            disabled={streaming}
            className="flex-1 resize-none rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-jade-400)] disabled:opacity-50 max-h-32 overflow-y-auto"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || streaming}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--color-jade-500)] text-white shadow-[0_3px_0_0_rgba(26,20,35,0.15)] disabled:opacity-40 transition-opacity"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
