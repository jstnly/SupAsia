"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Copy, Check, Users } from "lucide-react";
import { UNITS } from "@/lib/curriculum/units";
import Link from "next/link";

export function CoopLobby() {
  const router = useRouter();
  const supabase = createClient();
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [partnerJoined, setPartnerJoined] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  function createRoom() {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    const ch = supabase.channel(`coop:${code}`, { config: { broadcast: { self: false } } });
    channelRef.current = ch;
    ch.on("broadcast", { event: "partner:joined" }, () => setPartnerJoined(true));
    ch.on("broadcast", { event: "lesson:selected" }, ({ payload }) => {
      if ((payload as { lessonId: string }).lessonId) {
        router.push(`/lesson/${(payload as { lessonId: string }).lessonId}?coop=${code}`);
      }
    });
    ch.subscribe();
  }

  function joinRoom() {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    const ch = supabase.channel(`coop:${code}`, { config: { broadcast: { self: false } } });
    channelRef.current = ch;
    ch.on("broadcast", { event: "lesson:selected" }, ({ payload }) => {
      if ((payload as { lessonId: string }).lessonId) {
        router.push(`/lesson/${(payload as { lessonId: string }).lessonId}?coop=${code}`);
      }
    });
    ch.subscribe(() => {
      ch.send({ type: "broadcast", event: "partner:joined", payload: {} });
      setRoomCode(code);
      setPartnerJoined(true);
    });
  }

  function startLesson(lessonId: string) {
    channelRef.current?.send({
      type: "broadcast",
      event: "lesson:selected",
      payload: { lessonId },
    });
    router.push(`/lesson/${lessonId}?coop=${roomCode}`);
  }

  function copyCode() {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!roomCode) {
    return (
      <div className="space-y-4">
        <div className="card-soft p-5 space-y-3">
          <h2 className="font-display text-lg font-bold">Host a room</h2>
          <button
            onClick={createRoom}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-jade-500)] py-3 font-display font-bold text-white shadow-[0_4px_0_0_rgba(26,20,35,0.2)]"
          >
            <Users size={18} /> Create Study Room
          </button>
        </div>
        <div className="card-soft p-5 space-y-3">
          <h2 className="font-display text-lg font-bold">Join a room</h2>
          <div className="flex gap-2">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
              placeholder="Enter room code…"
              maxLength={6}
              className="flex-1 rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[var(--color-jade-400)]"
            />
            <button
              onClick={joinRoom}
              disabled={!joinCode.trim()}
              className="rounded-full bg-[var(--color-jade-500)] px-5 py-2 font-display font-bold text-white shadow-[0_3px_0_0_rgba(26,20,35,0.2)] disabled:opacity-40"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card-soft p-5 space-y-3">
        <h2 className="font-display text-lg font-bold">Room · {roomCode}</h2>
        <div className="flex gap-2 items-center">
          <div className="flex-1 rounded-full border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-lacquer)_5%,transparent)] px-4 py-2 font-mono text-lg font-bold tracking-widest text-center">
            {roomCode}
          </div>
          <button
            onClick={copyCode}
            className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-jade-500)] text-white"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className={`h-2 w-2 rounded-full ${partnerJoined ? "bg-[var(--color-jade-500)]" : "bg-[var(--color-gold-400)] animate-pulse"}`} />
          {partnerJoined ? "Partner connected! Pick a lesson." : "Waiting for partner to join…"}
        </div>
      </div>

      {partnerJoined && (
        <div className="card-soft p-5 space-y-3">
          <h2 className="font-display text-lg font-bold">Choose a lesson</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {UNITS.map((unit) => (
              <div key={unit.id}>
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-lotus-600)] mb-1">
                  {unit.titleEnglish}
                </div>
                <ul className="space-y-1">
                  {unit.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <button
                        onClick={() => startLesson(lesson.id)}
                        className="w-full text-left flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm hover:bg-[var(--color-jade-50)] hover:border-[var(--color-jade-300)] transition-colors"
                      >
                        <span className="font-display font-semibold">{lesson.title}</span>
                        <span className="text-xs text-[color-mix(in_oklab,var(--color-lacquer)_55%,transparent)]">
                          {lesson.exercises.length} ex
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
