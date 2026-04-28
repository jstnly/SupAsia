function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function canonicalize(s: string): string {
  return stripDiacritics(s)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

export type PhonemeResult = {
  score: 0 | 100;
  heard: string;
  expected: string;
  distance: number;
};

export function gradePhoneme(heard: string, expected: string): PhonemeResult {
  const h = canonicalize(heard);
  const e = canonicalize(expected);
  const distance = levenshtein(h, e);
  const tolerance = e.length <= 3 ? 1 : Math.floor(e.length / 4) + 1;
  return {
    score: distance <= tolerance ? 100 : 0,
    heard: heard.trim(),
    expected,
    distance,
  };
}
