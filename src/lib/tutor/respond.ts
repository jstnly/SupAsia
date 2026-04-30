import { detectIntent } from "./intent";
import { bestMatch, keywordOverlap, normalizeVi, similarity, stripDiacritics } from "./match";
import {
  KNOWLEDGE_BASE,
  SUGGESTED_TOPICS,
  type KnowledgeEntry,
  type KnowledgeResponse,
  type WordCard,
} from "./knowledge-base";
import { SCENARIO_BY_ID, type ScenarioId } from "./scenarios";
import { lookup } from "@/lib/curriculum/dictionary";
import { UNITS } from "@/lib/curriculum/units";
import { TONE_BY_ID, type ToneId } from "@/lib/game/tones";

// ───────────────────────── Practice mode ────────────────────────────────────

export type ScenarioStep = {
  npc: { vi: string; en: string; audioText?: string };
  matched: boolean;
  hint?: { vi: string; en: string };
  nextTurnId: string;
  teach?: { word: string; meaning: string }[];
  end: boolean;
};

const SCENARIO_THRESHOLD = 0.55;

export function respondToScenario(
  scenarioId: string,
  currentTurnId: string,
  userInput: string,
): ScenarioStep | null {
  const scenario = SCENARIO_BY_ID[scenarioId as ScenarioId];
  if (!scenario) return null;
  const turn = scenario.turns[currentTurnId];
  if (!turn) return null;

  // No accept branches → terminal node, just echo
  if (turn.accept.length === 0) {
    return {
      npc: turn.npc,
      matched: true,
      nextTurnId: currentTurnId,
      end: true,
    };
  }

  let bestIdx = -1;
  let bestScore = 0;
  for (let i = 0; i < turn.accept.length; i++) {
    const branch = turn.accept[i];
    // Pattern match
    const patternHit = bestMatch(userInput, branch.patterns, SCENARIO_THRESHOLD);
    let score = patternHit?.score ?? 0;
    // Keyword bonus
    if (branch.keywords && branch.keywords.length > 0) {
      const overlap = keywordOverlap(userInput, branch.keywords);
      if (overlap > 0) score = Math.max(score, 0.7 + 0.05 * Math.min(overlap, 4));
    }
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }

  if (bestIdx >= 0 && bestScore >= SCENARIO_THRESHOLD) {
    const branch = turn.accept[bestIdx];
    return {
      npc: branch.reply,
      matched: true,
      nextTurnId: branch.next,
      teach: branch.teach,
      end: branch.next === "end",
    };
  }

  // Fallback — show suggestion as hint
  const suggestion = turn.suggestions?.[0];
  return {
    npc: turn.fallback,
    matched: false,
    hint: suggestion ? { vi: suggestion, en: "Try this" } : undefined,
    nextTurnId: currentTurnId,
    end: false,
  };
}

// ───────────────────────── Tutor mode ───────────────────────────────────────

export type TutorResult =
  | { kind: "answer"; primary: KnowledgeResponse; related: KnowledgeResponse[] }
  | { kind: "fallback"; message: string; suggestions: { label: string; query: string }[] };

const TUTOR_KB_THRESHOLD = 0.45;

// Build EN→VI reverse index from curriculum (lazy).
let reverseIndex: Map<string, { vi: string; en: string }[]> | null = null;
function buildReverseIndex() {
  if (reverseIndex) return reverseIndex;
  const map = new Map<string, { vi: string; en: string }[]>();
  for (const unit of UNITS) {
    for (const lesson of unit.lessons) {
      for (const ex of lesson.exercises) {
        if (ex.kind === "translate") {
          const vi = ex.direction === "en-to-vi" ? ex.options[ex.correct] : ex.source;
          const en = ex.direction === "en-to-vi" ? ex.source : ex.options[ex.correct];
          if (!vi || !en) continue;
          const key = normalizeVi(en);
          if (!map.has(key)) map.set(key, []);
          map.get(key)!.push({ vi, en });
        } else if (ex.kind === "pair-match") {
          for (const p of ex.pairs) {
            const key = normalizeVi(p.right);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push({ vi: p.left, en: p.right });
          }
        }
      }
      if (lesson.tips?.vocab) {
        for (const v of lesson.tips.vocab) {
          const key = normalizeVi(v.meaning);
          if (!map.has(key)) map.set(key, []);
          map.get(key)!.push({ vi: v.word, en: v.meaning });
        }
      }
    }
  }
  reverseIndex = map;
  return map;
}

function reverseLookup(en: string): { vi: string; en: string } | null {
  const idx = buildReverseIndex();
  const key = normalizeVi(en);
  // Exact
  if (idx.has(key)) return idx.get(key)![0];
  // Strip leading articles ("a apple" → "apple")
  const trimmed = key.replace(/^(a |an |the |to )/, "");
  if (idx.has(trimmed)) return idx.get(trimmed)![0];
  // Substring scan
  for (const [k, v] of idx.entries()) {
    if (k.includes(trimmed) || trimmed.includes(k)) return v[0];
  }
  return null;
}

function scoreEntry(query: string, entry: KnowledgeEntry): number {
  let best = 0;
  for (const t of entry.triggers) {
    const s = similarity(query, t);
    if (s > best) best = s;
  }
  // Keyword overlap bonus
  const overlap = keywordOverlap(query, entry.keywords);
  if (overlap > 0) {
    best = Math.max(best, 0.55 + 0.06 * Math.min(overlap, 4));
  }
  // Token containment: any keyword present as substring after diacritic strip
  const flatQ = stripDiacritics(normalizeVi(query));
  for (const k of entry.keywords) {
    const flatK = stripDiacritics(normalizeVi(k));
    if (flatK.length >= 3 && flatQ.includes(flatK)) {
      best = Math.max(best, 0.65);
    }
  }
  return best;
}

function buildToneCard(toneId: ToneId): KnowledgeResponse {
  // Prefer the curated KB entry
  const entry = KNOWLEDGE_BASE.find(
    (e) => e.response.kind === "tone" && (e.response as { toneId: ToneId }).toneId === toneId,
  );
  if (entry) return entry.response;
  // Fallback synthesized from tones.ts
  const t = TONE_BY_ID[toneId];
  return {
    kind: "tone",
    toneId,
    description: `The ${t.name} (${t.english}) tone — example: ${t.example}`,
    examples: [{ vi: t.example, en: t.exampleMeaning }],
  };
}

function buildWordFromDictionary(query: string, en?: string): WordCard | null {
  const direct = lookup(query);
  if (direct) {
    return { kind: "word", vi: direct.vi, en: direct.en };
  }
  if (en) {
    const rev = reverseLookup(en);
    if (rev) return { kind: "word", vi: rev.vi, en: rev.en };
  }
  // Try as English reverse
  const rev = reverseLookup(query);
  if (rev) return { kind: "word", vi: rev.vi, en: rev.en };
  return null;
}

export function askTutor(query: string): TutorResult {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      kind: "fallback",
      message: "Hỏi mình bất cứ điều gì về tiếng Việt!",
      suggestions: SUGGESTED_TOPICS,
    };
  }

  const intent = detectIntent(trimmed);

  // 1. Tone questions: use tone KB
  if (intent.kind === "tone-question") {
    if (intent.toneHint) {
      const card = buildToneCard(intent.toneHint);
      const overview = KNOWLEDGE_BASE.find((e) => e.id === "tone-overview")!.response;
      return { kind: "answer", primary: card, related: [overview] };
    }
    const overview = KNOWLEDGE_BASE.find((e) => e.id === "tone-overview")!.response;
    return {
      kind: "answer",
      primary: overview,
      related: TONE_BY_ID
        ? (Object.keys(TONE_BY_ID) as ToneId[]).slice(0, 3).map(buildToneCard)
        : [],
    };
  }

  // 2. EN→VI vocab — try dictionary then KB word entries scoped to the bare query
  if (intent.kind === "vocab-en-to-vi") {
    const word = buildWordFromDictionary(intent.query, intent.query);
    if (word) {
      const related = topKbMatches(intent.query, 2, ["word"]);
      return { kind: "answer", primary: word, related };
    }
    // KB lookup using just the queried word (not the whole sentence)
    const kbHit = topKbMatches(intent.query, 1, ["word"])[0];
    if (kbHit) {
      const related = topKbMatches(intent.query, 2, ["word"]).slice(1);
      return { kind: "answer", primary: kbHit, related };
    }
    // Truly unknown vocab: be honest, don't surface unrelated greetings
    return {
      kind: "fallback",
      message: `Mình chưa biết từ "${intent.query}" — chưa có trong từ điển. Thử một trong những chủ đề khác:`,
      suggestions: SUGGESTED_TOPICS,
    };
  }

  // 3. VI→EN vocab — same logic, query-scoped
  if (intent.kind === "vocab-vi-to-en") {
    const direct = lookup(intent.query);
    if (direct) {
      const related = topKbMatches(intent.query, 2);
      return {
        kind: "answer",
        primary: { kind: "word", vi: direct.vi, en: direct.en },
        related,
      };
    }
    const kbHit = topKbMatches(intent.query, 1, ["word", "phrase"])[0];
    if (kbHit) {
      return { kind: "answer", primary: kbHit, related: [] };
    }
    return {
      kind: "fallback",
      message: `Mình chưa biết từ "${intent.query}". Thử một trong những chủ đề khác:`,
      suggestions: SUGGESTED_TOPICS,
    };
  }

  // 4. Score every KB entry by trigger similarity + keyword overlap
  const scored = KNOWLEDGE_BASE.map((entry) => ({ entry, score: scoreEntry(trimmed, entry) }))
    .sort((a, b) => b.score - a.score);
  const top = scored[0];

  if (top && top.score >= TUTOR_KB_THRESHOLD) {
    const related = scored
      .slice(1)
      .filter((s) => s.score >= TUTOR_KB_THRESHOLD * 0.85)
      .slice(0, 2)
      .map((s) => s.entry.response);
    return { kind: "answer", primary: top.entry.response, related };
  }

  // 5. Last-ditch dictionary fallback
  const wordGuess = buildWordFromDictionary(trimmed);
  if (wordGuess) {
    return { kind: "answer", primary: wordGuess, related: [] };
  }

  // 6. Real fallback with topic chips
  return {
    kind: "fallback",
    message:
      "Mình chưa biết chính xác câu trả lời. Thử một trong những chủ đề này nhé:",
    suggestions: SUGGESTED_TOPICS,
  };
}

function topKbMatches(query: string, n: number, kindFilter?: string[]): KnowledgeResponse[] {
  const scored = KNOWLEDGE_BASE.map((e) => ({ e, s: scoreEntry(query, e) }))
    .filter((x) => x.s >= TUTOR_KB_THRESHOLD)
    .filter((x) => !kindFilter || kindFilter.includes(x.e.response.kind))
    .sort((a, b) => b.s - a.s)
    .slice(0, n);
  return scored.map((x) => x.e.response);
}
