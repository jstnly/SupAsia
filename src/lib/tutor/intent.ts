import type { ToneId } from "@/lib/game/tones";

export type Intent =
  | { kind: "vocab-en-to-vi"; query: string }
  | { kind: "vocab-vi-to-en"; query: string }
  | { kind: "tone-question"; toneHint?: ToneId }
  | { kind: "grammar-question"; query: string }
  | { kind: "pronunciation"; query: string }
  | { kind: "culture"; query: string }
  | { kind: "free"; query: string };

const TONE_KEYWORD_TO_ID: Record<string, ToneId> = {
  ngang: "ngang",
  level: "ngang",
  flat: "ngang",
  sắc: "sac",
  sac: "sac",
  rising: "sac",
  acute: "sac",
  huyền: "huyen",
  huyen: "huyen",
  falling: "huyen",
  grave: "huyen",
  hỏi: "hoi",
  hoi: "hoi",
  dipping: "hoi",
  question: "hoi",
  ngã: "nga",
  nga: "nga",
  broken: "nga",
  tilde: "nga",
  nặng: "nang",
  nang: "nang",
  heavy: "nang",
  dot: "nang",
};

function extractQuoted(input: string): string | null {
  const m = input.match(/[""'']([^""'']+)[""'']/);
  return m ? m[1].trim() : null;
}

function extractAfter(input: string, prefix: RegExp): string | null {
  const m = input.match(prefix);
  if (!m) return null;
  return input.slice(m.index! + m[0].length).trim().replace(/[?.!]+$/, "").trim();
}

export function detectIntent(input: string): Intent {
  const raw = input.trim();
  const lower = raw.toLowerCase();

  // Tone questions — check first because "tone" is a strong signal
  for (const kw of Object.keys(TONE_KEYWORD_TO_ID)) {
    if (lower.includes(kw)) {
      const id = TONE_KEYWORD_TO_ID[kw];
      // Generic tone question only if accompanied by tone-related words
      if (/\btone[s]?\b/.test(lower) || /\b(rising|falling|dipping|broken|level|heavy)\b/.test(lower) ||
          ["sắc","huyền","hỏi","ngã","nặng","ngang","sac","huyen","hoi","nga","nang"].includes(kw)) {
        return { kind: "tone-question", toneHint: id };
      }
    }
  }
  if (/\btone[s]?\b/.test(lower)) {
    return { kind: "tone-question" };
  }

  // Vocab: English → Vietnamese
  const enToViMatch = lower.match(/^(?:how (?:do|to|would) (?:you |i |we )?say|how to say|what(?:'s| is) .* in vietnamese|translate(?: into vietnamese)?:?)\s*(.*)$/);
  if (enToViMatch) {
    const q = extractQuoted(raw) ?? enToViMatch[1].trim().replace(/[?.!]+$/, "");
    if (q) return { kind: "vocab-en-to-vi", query: q };
  }
  // Pattern "X in vietnamese"
  const inViMatch = lower.match(/^(.+?)\s+in vietnamese\s*\??$/);
  if (inViMatch) {
    return { kind: "vocab-en-to-vi", query: inViMatch[1].trim() };
  }

  // Vocab: Vietnamese → English
  const viToEnMatch = lower.match(/^(?:what does|what is|what's|meaning of|define)\s+(.+?)(?:\s+mean)?\s*\??$/);
  if (viToEnMatch) {
    const q = extractQuoted(raw) ?? viToEnMatch[1].trim();
    if (q) return { kind: "vocab-vi-to-en", query: q };
  }

  // Pronunciation
  if (/\bpronoun(?:ce|ciation)\b/.test(lower)) {
    const q = extractQuoted(raw) ?? extractAfter(raw, /pronounce\s+/i) ?? raw;
    return { kind: "pronunciation", query: q };
  }

  // Grammar
  if (/\b(grammar|pattern|conjugat|difference between|when (?:to|do (?:i|you|we)) use|particle|classifier|tense|plural|past|future)\b/.test(lower)) {
    return { kind: "grammar-question", query: raw };
  }

  // Culture
  if (/\b(culture|custom|tradition|tip(ping)?|polite|etiquette|family|food|festival|tết|tet|holiday|history)\b/.test(lower)) {
    return { kind: "culture", query: raw };
  }

  // Bare Vietnamese word (1-3 tokens, contains Vietnamese diacritics) → assume vi-to-en
  const tokens = raw.split(/\s+/).filter(Boolean);
  const hasViDiacritic = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(raw);
  if (tokens.length <= 4 && hasViDiacritic) {
    return { kind: "vocab-vi-to-en", query: raw };
  }
  // Bare English word (1-2 tokens, no diacritics, looks like a noun/verb)
  if (tokens.length <= 2 && /^[a-z]+( [a-z]+)?$/.test(lower)) {
    return { kind: "vocab-en-to-vi", query: raw };
  }

  return { kind: "free", query: raw };
}
