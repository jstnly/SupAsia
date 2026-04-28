"use client";

/** Browser-side TTS playback. Calls /api/tts; falls back to Web Speech with the best available
 *  Vietnamese voice. Cached audio blobs survive in-memory for the session. */
const cache = new Map<string, string>();
let voiceCache: SpeechSynthesisVoice | null | undefined;

function pickVietnameseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  const vi = voices.filter((v) => v.lang === "vi-VN" || v.lang.toLowerCase().startsWith("vi"));
  if (vi.length === 0) return null;
  const score = (v: SpeechSynthesisVoice) => {
    let s = 0;
    if (/google/i.test(v.name)) s += 12;
    if (/microsoft/i.test(v.name)) s += 8;
    if (/apple|siri/i.test(v.name)) s += 7;
    if (/neural|premium|enhanced|natural/i.test(v.name)) s += 4;
    if (v.lang === "vi-VN") s += 5;
    return s;
  };
  return vi.slice().sort((a, b) => score(b) - score(a))[0] ?? null;
}

function getVietnameseVoice(): SpeechSynthesisVoice | null {
  if (voiceCache !== undefined) return voiceCache;
  const v = pickVietnameseVoice();
  if (v) voiceCache = v;
  return v ?? null;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  // Voices load asynchronously — invalidate the cache on this event so the next play picks them up.
  speechSynthesis.addEventListener("voiceschanged", () => {
    voiceCache = undefined;
  });
}

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

  if ("speechSynthesis" in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "vi-VN";
    utter.rate = opts.rate ?? 1;
    const voice = getVietnameseVoice();
    if (voice) utter.voice = voice;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }
}

/** Returns the resolved Vietnamese voice name, or null if none are installed. UI can show a
 *  notice to nudge the user toward setting GOOGLE_TTS_API_KEY for higher quality. */
export function getActiveVietnameseVoiceName(): string | null {
  const v = getVietnameseVoice();
  return v?.name ?? null;
}
