"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { hasWebSpeechRecognition } from "./browser-support";

type RecognitionAlternative = { transcript: string; confidence: number };
type RecognitionResult = ArrayLike<RecognitionAlternative> & { isFinal: boolean };
type RecognitionResultList = ArrayLike<RecognitionResult>;
type RecognitionEvent = { results: RecognitionResultList };
type RecognitionErrorEvent = { error: string; message?: string };

interface RecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type RecognitionCtor = new () => RecognitionInstance;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type RecognitionState = "idle" | "listening" | "unsupported" | "error";

export function useSpeechRecognition() {
  const [state, setState] = useState<RecognitionState>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<RecognitionInstance | null>(null);

  useEffect(() => {
    setState(hasWebSpeechRecognition() ? "idle" : "unsupported");
    return () => {
      try {
        recRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const start = useCallback((lang = "vi-VN"): Promise<string> => {
    return new Promise((resolve, reject) => {
      const Ctor = getRecognitionCtor();
      if (!Ctor) {
        setState("unsupported");
        reject(new Error("speech recognition unsupported"));
        return;
      }
      setError(null);
      setTranscript("");
      const rec = new Ctor();
      recRef.current = rec;
      rec.lang = lang;
      rec.continuous = false;
      rec.interimResults = false;

      let finalText = "";
      let settled = false;

      rec.onresult = (event) => {
        const top = event.results[0]?.[0]?.transcript ?? "";
        finalText = top;
        setTranscript(top);
      };

      rec.onerror = (e) => {
        if (settled) return;
        if (e.error === "no-speech" || e.error === "aborted") {
          settled = true;
          setState("idle");
          resolve("");
          return;
        }
        settled = true;
        setError(e.error);
        setState("error");
        reject(new Error(e.error));
      };

      rec.onend = () => {
        recRef.current = null;
        if (settled) return;
        settled = true;
        setState("idle");
        resolve(finalText);
      };

      try {
        rec.start();
        setState("listening");
      } catch (e) {
        if (settled) return;
        settled = true;
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        setState("error");
        reject(new Error(msg));
      }
    });
  }, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
  }, []);

  return { state, transcript, error, start, stop };
}
