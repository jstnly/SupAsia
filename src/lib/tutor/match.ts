// Fuzzy matching utilities for Vietnamese-aware string comparison.
// Pure, deterministic, no external deps.

export function normalizeVi(s: string): string {
  return s
    .normalize("NFC")
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const DIACRITIC_MAP: Record<string, string> = {
  à: "a", á: "a", ạ: "a", ả: "a", ã: "a",
  â: "a", ầ: "a", ấ: "a", ậ: "a", ẩ: "a", ẫ: "a",
  ă: "a", ằ: "a", ắ: "a", ặ: "a", ẳ: "a", ẵ: "a",
  è: "e", é: "e", ẹ: "e", ẻ: "e", ẽ: "e",
  ê: "e", ề: "e", ế: "e", ệ: "e", ể: "e", ễ: "e",
  ì: "i", í: "i", ị: "i", ỉ: "i", ĩ: "i",
  ò: "o", ó: "o", ọ: "o", ỏ: "o", õ: "o",
  ô: "o", ồ: "o", ố: "o", ộ: "o", ổ: "o", ỗ: "o",
  ơ: "o", ờ: "o", ớ: "o", ợ: "o", ở: "o", ỡ: "o",
  ù: "u", ú: "u", ụ: "u", ủ: "u", ũ: "u",
  ư: "u", ừ: "u", ứ: "u", ự: "u", ử: "u", ữ: "u",
  ỳ: "y", ý: "y", ỵ: "y", ỷ: "y", ỹ: "y",
  đ: "d",
};

export function stripDiacritics(s: string): string {
  let out = "";
  for (const ch of s) {
    out += DIACRITIC_MAP[ch] ?? ch;
  }
  return out;
}

export function tokenize(s: string): string[] {
  const n = normalizeVi(s);
  if (!n) return [];
  return n.split(" ").filter(Boolean);
}

export function tokenSet(s: string): Set<string> {
  return new Set(tokenize(s));
}

export function jaccard(a: string, b: string): number {
  const sa = tokenSet(a);
  const sb = tokenSet(b);
  if (sa.size === 0 && sb.size === 0) return 1;
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter++;
  const union = sa.size + sb.size - inter;
  return inter / union;
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = new Array(b.length + 1);
  let curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

// Combined similarity score in [0, 1].
// 1.0 = exact NFC-normalized match
// 0.92 = exact match after stripping diacritics
// otherwise: blended jaccard + edit-distance score
export function similarity(input: string, candidate: string): number {
  const a = normalizeVi(input);
  const b = normalizeVi(candidate);
  if (!a || !b) return 0;
  if (a === b) return 1;
  const aFlat = stripDiacritics(a);
  const bFlat = stripDiacritics(b);
  if (aFlat === bFlat) return 0.92;

  const tokenScore = jaccard(a, b);
  const editFlat = levenshtein(aFlat, bFlat);
  const maxLen = Math.max(aFlat.length, bFlat.length);
  const editScore = maxLen === 0 ? 1 : 1 - editFlat / maxLen;

  // Containment bonus: if shorter is contained inside longer (after stripping),
  // bias up. Helps "cho cà phê" match "cho tôi cà phê đen" loosely.
  const longer = aFlat.length >= bFlat.length ? aFlat : bFlat;
  const shorter = aFlat.length < bFlat.length ? aFlat : bFlat;
  const contained = shorter.length > 0 && longer.includes(shorter) ? 0.15 : 0;

  return Math.min(0.91, 0.5 * tokenScore + 0.45 * editScore + contained);
}

export function bestMatch(
  input: string,
  candidates: string[],
  threshold = 0.6,
): { index: number; match: string; score: number } | null {
  let bestIdx = -1;
  let bestScore = 0;
  for (let i = 0; i < candidates.length; i++) {
    const s = similarity(input, candidates[i]);
    if (s > bestScore) {
      bestScore = s;
      bestIdx = i;
    }
  }
  if (bestIdx === -1 || bestScore < threshold) return null;
  return { index: bestIdx, match: candidates[bestIdx], score: bestScore };
}

// Keyword overlap: returns number of input tokens appearing in keyword list
export function keywordOverlap(input: string, keywords: string[]): number {
  const ts = tokenSet(input);
  const flat = new Set<string>();
  for (const t of ts) flat.add(stripDiacritics(t));
  let n = 0;
  for (const k of keywords) {
    const kFlat = stripDiacritics(normalizeVi(k));
    if (flat.has(kFlat)) n++;
  }
  return n;
}
