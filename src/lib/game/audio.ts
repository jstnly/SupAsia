"use client";

/** Browser-side TTS playback. Calls /api/tts which returns audio bytes. Cached in <audio> elements. */
const cache = new Map<string, string>();

export async function playVietnamese(text: string, opts: { rate?: number; voice?: string } = {}) {
  if (typeof window === "undefined") return;
  const key = JSON.stringify({ text, ...opts });

  let url = cache.get(key);
  if (!url) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: opts.voice }),
      });
      if (res.ok) {
        const blob = await res.blob();
        url = URL.createObjectURL(blob);
        cache.set(key, url);
      }
    } catch {
      // fall through to webspeech
    }
  }

  if (url) {
    const audio = new Audio(url);
    audio.playbackRate = opts.rate ?? 1;
    await audio.play().catch(() => {});
    return;
  }

  // Web Speech fallback
  if ("speechSynthesis" in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "vi-VN";
    utter.rate = opts.rate ?? 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }
}
