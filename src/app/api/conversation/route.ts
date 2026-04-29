import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SCENARIOS: Record<string, { title: string; setup: string }> = {
  cafe: {
    title: "Ordering at a café",
    setup: `You are a friendly barista at a bustling Sài Gòn café called "Cà Phê Bồ". The user is a customer ordering drinks and snacks. Stay in character — greet them, take their order, offer extras, handle payment in Vietnamese dòng. The menu includes: cà phê đen (15k), cà phê sữa đá (25k), bạc xỉu (20k), sinh tố xoài (30k), bánh mì (20k), bánh flan (18k).`,
  },
  market: {
    title: "Shopping at the market",
    setup: `You are a lively vendor at Bến Thành market selling fresh fruit, vegetables, and local goods. The user is a tourist/customer shopping and bargaining. Offer prices in thousands of dòng, accept bargaining, wrap up sales with friendly banter in Vietnamese.`,
  },
  meeting: {
    title: "Meeting someone new",
    setup: `You are Lan, a friendly Vietnamese university student who just met the user at a language exchange event. Make small talk — ask about their home country, why they're learning Vietnamese, their hobbies, and share about your own life. Keep the conversation flowing naturally.`,
  },
  restaurant: {
    title: "Dining at a restaurant",
    setup: `You are a waiter at "Nhà Hàng Mekong", a mid-range Vietnamese restaurant. Take the user's food order, recommend dishes, handle special requests (spice level, allergies), and provide a warm dining experience. Menu highlights: phở bò, bún bò Huế, cơm tấm, gỏi cuốn, chả giò.`,
  },
  directions: {
    title: "Asking for directions",
    setup: `You are a local Sài Gòn resident standing near Bến Thành market. The user is lost and needs directions to various landmarks (Nhà thờ Đức Bà, Chợ Lớn, bến xe buýt, bệnh viện, v.v.). Give street-level directions using Vietnamese location words (thẳng, rẽ trái/phải, đối diện, gần đó).`,
  },
  free: {
    title: "Free conversation",
    setup: `You are Bồ, the app's friendly water buffalo mascot and Vietnamese tutor companion. Have a warm, natural conversation with the user about anything they want — their day, Vietnamese culture, food, travel in Vietnam, language tips, etc. Be encouraging and playful.`,
  },
};

function buildSystemPrompt(
  scenario: string,
  userLevel: number,
  dialect: string
): string {
  const sc = SCENARIOS[scenario] ?? SCENARIOS.free;
  const dialectNote =
    dialect === "northern"
      ? "Use Northern (Hà Nội) dialect pronunciation spellings and vocabulary when relevant."
      : "Use Southern (Sài Gòn) dialect — hỏi and ngã tones merge in speech, use ba/má/chén vocabulary.";

  const levelNote =
    userLevel <= 3
      ? "The learner is a BEGINNER (level 1-3). Use very simple vocabulary, short sentences, include English translations for nearly every Vietnamese phrase in [brackets]. Go slow."
      : userLevel <= 8
        ? "The learner is ELEMENTARY (level 4-8). Use common everyday vocabulary. Provide English translations [in brackets] for new or complex words. Keep sentences short."
        : userLevel <= 15
          ? "The learner is PRE-INTERMEDIATE (level 9-15). Mix Vietnamese and English translations [in brackets] for harder phrases only. Use some compound sentences."
          : userLevel <= 24
            ? "The learner is INTERMEDIATE (level 16-24). Respond mostly in Vietnamese. Only translate [in brackets] when introducing new vocabulary. Use natural speech patterns."
            : "The learner is ADVANCED (level 25+). Respond in natural, fluent Vietnamese. Include translations [in brackets] only for regional idioms or advanced grammar points.";

  return `You are a warm, encouraging Vietnamese language tutor playing a character in a conversation scenario for a language learning app.

SCENARIO: ${sc.title}
${sc.setup}

DIALECT: ${dialectNote}
LEARNER LEVEL: ${levelNote}

TUTORING RULES:
1. Respond IN CHARACTER for the scenario — you ARE the barista/vendor/etc., not a teacher explaining things
2. Keep responses SHORT (2-4 sentences max). This is live chat, not an essay
3. If the learner makes a vocabulary or grammar mistake, model the correct form naturally in your reply without saying "you made a mistake" — just use the right word yourself
4. If the learner writes only in English, gently nudge them to try in Vietnamese: "Thử nói tiếng Việt nhé! [Try saying it in Vietnamese!]" then continue the scene
5. Use emoji sparingly (1 per message max) to keep the chat friendly
6. After a correction, continue the scene — don't over-explain
7. Never break character to give grammar lectures mid-conversation

CORRECTION STYLE EXAMPLE:
User: "Tôi muon mot ca phe"
You (barista): "Được! [Sure!] Bạn muốn cà phê đen hay cà phê sữa đá? ☕ [Black coffee or iced milk coffee?]"
(You naturally used "muốn" and "cà phê" correctly — the learner sees the right forms in context)

Start the scene now.`;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  // 30 messages per minute per user
  const rl = rateLimit(`conversation:${user.id}`, 30, 60_000);
  if (!rl.allowed) {
    return new Response("Too many requests — slow down a bit!", {
      status: 429,
      headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    });
  }

  const [profile] = await db
    .select({ totalXp: profiles.totalXp, dialect: profiles.dialect })
    .from(profiles)
    .where(eq(profiles.id, user.id));
  if (!profile) return new Response("Profile not found", { status: 404 });

  const body = await req.json();
  const messages: Array<{ role: "user" | "assistant"; content: string }> =
    body.messages ?? [];
  const scenario: string = body.scenario ?? "free";
  const userLevel: number = body.userLevel ?? 1;

  const systemPrompt = buildSystemPrompt(scenario, userLevel, profile.dialect);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: "claude-opus-4-7",
          max_tokens: 512,
          system: [
            {
              type: "text",
              text: systemPrompt,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages,
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Conversation error";
        controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}
