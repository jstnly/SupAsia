"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { canRecordMic } from "./browser-support";

export type MicState =
  | "idle"
  | "requesting"
  | "recording"
  | "processing"
  | "denied"
  | "unsupported";

export type RecordResult = {
  pcm: Float32Array;
  sampleRate: number;
  blob: Blob;
};

const MAX_DURATION_MS = 3000;

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext ??
    null
  );
}

export function useMicRecorder() {
  const [state, setState] = useState<MicState>("idle");
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number | null>(null);
  const autoStopTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setState(canRecordMic() ? "idle" : "unsupported");
  }, []);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
    autoStopTimerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      void audioCtxRef.current.close();
    }
    audioCtxRef.current = null;
    analyserRef.current = null;
    recorderRef.current = null;
    setLevel(0);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const start = useCallback((): Promise<RecordResult> => {
    return new Promise((resolve, reject) => {
      if (!canRecordMic()) {
        setState("unsupported");
        reject(new Error("microphone unsupported"));
        return;
      }
      setError(null);
      setState("requesting");

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(async (stream) => {
          streamRef.current = stream;
          const Ctor = getAudioContextCtor();
          if (!Ctor) {
            cleanup();
            reject(new Error("AudioContext unavailable"));
            return;
          }
          const ctx = new Ctor();
          audioCtxRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 1024;
          source.connect(analyser);
          analyserRef.current = analyser;

          const buf = new Uint8Array(analyser.fftSize);
          const tick = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteTimeDomainData(buf);
            let sum = 0;
            for (let i = 0; i < buf.length; i++) {
              const v = (buf[i] - 128) / 128;
              sum += v * v;
            }
            setLevel(Math.min(1, Math.sqrt(sum / buf.length) * 2));
            rafRef.current = requestAnimationFrame(tick);
          };
          rafRef.current = requestAnimationFrame(tick);

          chunksRef.current = [];
          const mime = MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : MediaRecorder.isTypeSupported("audio/mp4")
            ? "audio/mp4"
            : "";
          const recorder = mime
            ? new MediaRecorder(stream, { mimeType: mime })
            : new MediaRecorder(stream);
          recorderRef.current = recorder;

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
          };

          recorder.onstop = async () => {
            try {
              setState("processing");
              const mimeType = recorder.mimeType || "audio/webm";
              const blob = new Blob(chunksRef.current, { type: mimeType });
              const arrayBuffer = await blob.arrayBuffer();
              const decodeCtx = new Ctor();
              const decoded = await decodeCtx.decodeAudioData(arrayBuffer.slice(0));
              const pcm = decoded.getChannelData(0).slice();
              const sampleRate = decoded.sampleRate;
              await decodeCtx.close();
              cleanup();
              setState("idle");
              resolve({ pcm, sampleRate, blob });
            } catch (e) {
              cleanup();
              setState("idle");
              reject(e instanceof Error ? e : new Error(String(e)));
            }
          };

          recorder.start();
          setState("recording");
          autoStopTimerRef.current = window.setTimeout(() => {
            if (recorderRef.current?.state === "recording") {
              recorderRef.current.stop();
            }
          }, MAX_DURATION_MS);
        })
        .catch((e: unknown) => {
          cleanup();
          const msg = e instanceof Error ? e.message : String(e);
          const isPermission = /permission|denied|notallowed/i.test(
            (e as { name?: string })?.name ?? msg,
          );
          setError(msg);
          setState(isPermission ? "denied" : "idle");
          reject(e instanceof Error ? e : new Error(msg));
        });
    });
  }, [cleanup]);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setError(null);
    setState(canRecordMic() ? "idle" : "unsupported");
  }, [cleanup]);

  return { state, level, error, start, stop, reset };
}
