"use client";

export function hasGetUserMedia(): boolean {
  if (typeof navigator === "undefined") return false;
  return Boolean(navigator.mediaDevices?.getUserMedia);
}

export function hasMediaRecorder(): boolean {
  if (typeof window === "undefined") return false;
  return typeof window.MediaRecorder !== "undefined";
}

export function hasWebSpeechRecognition(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}

export function canRecordMic(): boolean {
  return hasGetUserMedia() && hasMediaRecorder();
}
