import { NextResponse } from "next/server";
import crypto from "node:crypto";

/**
 * POST /api/tts
 * Body: { text: string; voice?: "vi-VN-Neural2-A" | "vi-VN-Neural2-D" }
 *
 * Phase 1: proxies Google Cloud TTS. If GOOGLE_TTS_API_KEY is missing,
 * returns 503 — the client falls back to Web Speech API in-browser.
 *
 * Phase 2 TODO: cache to R2 by sha256(text+voice), serve from CDN.
 */
export async function POST(req: Request) {
  let body: { text?: string; voice?: string } = {};
  try {
    body = await req.json();
  } catch {
    return new NextResponse("invalid json", { status: 400 });
  }
  const text = body.text?.trim();
  if (!text) return new NextResponse("text required", { status: 400 });
  if (text.length > 400) return new NextResponse("text too long", { status: 400 });

  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    return new NextResponse("tts unavailable", { status: 503 });
  }

  const voice = body.voice ?? "vi-VN-Neural2-D";

  const ttsRes = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: "vi-VN", name: voice },
        audioConfig: { audioEncoding: "MP3", speakingRate: 0.92 },
      }),
    }
  );

  if (!ttsRes.ok) {
    return new NextResponse("tts failed: " + ttsRes.status, { status: 502 });
  }

  const json = (await ttsRes.json()) as { audioContent: string };
  const buf = Buffer.from(json.audioContent, "base64");
  const etag = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 24);

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "ETag": `"${etag}"`,
    },
  });
}
