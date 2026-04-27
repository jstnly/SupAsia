/**
 * Vietnamese tones. Southern dialect collapses hỏi and ngã into a single spoken tone,
 * but writing preserves all 6 marks. Lessons grade on spoken merger by default.
 */

export type ToneId = "ngang" | "sac" | "huyen" | "hoi" | "nga" | "nang";

export const TONES: ReadonlyArray<{
  id: ToneId;
  name: string;
  english: string;
  diacritic: string;
  example: string;
  exampleMeaning: string;
  shape: "line" | "rising" | "falling" | "questioning" | "wavy" | "dot";
  color: string;
  southernMerged?: boolean;
}> = [
  { id: "ngang", name: "Ngang", english: "Level",      diacritic: "a", example: "ma", exampleMeaning: "ghost",        shape: "line",        color: "var(--color-tone-ngang)" },
  { id: "sac",   name: "Sắc",   english: "Rising",     diacritic: "á", example: "má", exampleMeaning: "mother (S)",    shape: "rising",      color: "var(--color-tone-sac)" },
  { id: "huyen", name: "Huyền", english: "Falling",    diacritic: "à", example: "mà", exampleMeaning: "but",           shape: "falling",     color: "var(--color-tone-huyen)" },
  { id: "hoi",   name: "Hỏi",   english: "Dipping",    diacritic: "ả", example: "mả", exampleMeaning: "tomb",          shape: "questioning", color: "var(--color-tone-hoi)", southernMerged: true },
  { id: "nga",   name: "Ngã",   english: "Broken",     diacritic: "ã", example: "mã", exampleMeaning: "horse / code",  shape: "wavy",        color: "var(--color-tone-nga)", southernMerged: true },
  { id: "nang",  name: "Nặng",  english: "Heavy",      diacritic: "ạ", example: "mạ", exampleMeaning: "rice seedling", shape: "dot",         color: "var(--color-tone-nang)" },
];

export const TONE_BY_ID = Object.fromEntries(TONES.map((t) => [t.id, t])) as Record<ToneId, (typeof TONES)[number]>;

export function detectToneFromSyllable(syllable: string): ToneId {
  const m = syllable.normalize("NFD");
  if (/́/.test(m)) return "sac";
  if (/̀/.test(m)) return "huyen";
  if (/̉/.test(m)) return "hoi";
  if (/̃/.test(m)) return "nga";
  if (/̣/.test(m)) return "nang";
  return "ngang";
}

/** In Southern dialect, hỏi and ngã merge in speech but stay distinct in writing. */
export function spokenTone(id: ToneId, dialect: "northern" | "southern"): ToneId {
  if (dialect === "southern" && id === "nga") return "hoi";
  return id;
}
