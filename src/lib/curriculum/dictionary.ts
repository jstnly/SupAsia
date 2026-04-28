import { UNITS } from "./units";

export type DictionaryEntry = { vi: string; en: string };

let cache: Map<string, DictionaryEntry> | null = null;

function normalize(s: string): string {
  return s.normalize("NFC").toLowerCase().trim();
}

function add(map: Map<string, DictionaryEntry>, vi: string, en: string) {
  if (!vi || !en) return;
  const key = normalize(vi);
  if (!map.has(key)) map.set(key, { vi, en });
}

function buildDictionary(): Map<string, DictionaryEntry> {
  const map = new Map<string, DictionaryEntry>();
  for (const unit of UNITS) {
    for (const lesson of unit.lessons) {
      // Translate exercises give explicit VI↔EN
      for (const ex of lesson.exercises) {
        if (ex.kind === "translate") {
          const vi = ex.direction === "en-to-vi" ? ex.options[ex.correct] : ex.source;
          const en = ex.direction === "en-to-vi" ? ex.source : ex.options[ex.correct];
          add(map, vi, en);
        } else if (ex.kind === "pair-match") {
          for (const p of ex.pairs) add(map, p.left, p.right);
        }
      }
      // Authored tips override / extend
      if (lesson.tips?.vocab) {
        for (const v of lesson.tips.vocab) add(map, v.word, v.meaning);
      }
    }
  }
  return map;
}

export function lookup(vi: string): DictionaryEntry | null {
  if (!cache) cache = buildDictionary();
  return cache.get(normalize(vi)) ?? null;
}
