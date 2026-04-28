import { NextResponse } from "next/server";

/**
 * POST /api/stt
 * Multipart form with `audio` (Blob, ≤ 1 MB) and optional `language` (default "vi").
 * Proxies Groq Whisper-large-v3. Returns { text } or 503 if GROQ_API_KEY missing —
 * caller falls back to Web Speech API or tone-only grading.
 */
export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new NextResponse("stt unavailable", { status: 503 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return new NextResponse("invalid form", { status: 400 });
  }

  const audio = form.get("audio");
  const language = (form.get("language") as string | null) ?? "vi";
  if (!(audio instanceof Blob)) {
    return new NextResponse("audio required", { status: 400 });
  }
  if (audio.size === 0 || audio.size > 1_000_000) {
    return new NextResponse("audio size out of range", { status: 400 });
  }

  const upstream = new FormData();
  upstream.append("file", audio, "speech.webm");
  upstream.append("model", "whisper-large-v3");
  upstream.append("language", language);
  upstream.append("response_format", "json");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: upstream,
  });

  if (!res.ok) {
    return new NextResponse("stt upstream error: " + res.status, { status: 502 });
  }

  const data = (await res.json()) as { text?: string };
  return NextResponse.json({ text: (data.text ?? "").trim() });
}
