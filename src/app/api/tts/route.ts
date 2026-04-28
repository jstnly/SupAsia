import { NextResponse } from "next/server";
import crypto from "node:crypto";

/**
 * POST /api/tts
 * Body: { text: string; voice?: "vi-VN-Neural2-A" | "vi-VN-Neural2-D" }
 *
 * Cache layers (in order):
 *  1. Cloudflare R2 read-through if R2_PUBLIC_URL is set. Keyed by sha256(text+voice).
 *     A separate worker / backfill job is responsible for warming the cache; this
 *     route only reads from it. (Phase 4 will add the upload path via @aws-sdk/client-s3.)
 *  2. Google Cloud TTS (Neural2 vi-VN). Returns 503 if GOOGLE_TTS_API_KEY is missing —
 *     the client falls back to Web Speech API in-browser.
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

  const voice = body.voice ?? "vi-VN-Neural2-D";
  const cacheKey = crypto
    .createHash("sha256")
    .update(`${voice}::${text}`)
    .digest("hex")
    .slice(0, 32);

  // 1. R2 read-through cache
  const r2Public = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (r2Public) {
    try {
      const r2Res = await fetch(`${r2Public}/tts/${cacheKey}.mp3`, {
        cache: "force-cache",
      });
      if (r2Res.ok) {
        const buf = Buffer.from(await r2Res.arrayBuffer());
        return new NextResponse(buf, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
            "ETag": `"${cacheKey}"`,
            "X-Tts-Source": "r2",
          },
        });
      }
    } catch {
      // R2 unreachable; fall through to Google.
    }
  }

  // 2. Google Cloud TTS
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    return new NextResponse("tts unavailable", { status: 503 });
  }

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

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "ETag": `"${cacheKey}"`,
      "X-Tts-Source": "google",
    },
  });
}
