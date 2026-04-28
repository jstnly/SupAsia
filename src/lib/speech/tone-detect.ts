import { PitchDetector } from "pitchy";
import { type ToneId, spokenTone } from "@/lib/game/tones";

const FRAME_SIZE = 2048;
const HOP = 512;
const MIN_CLARITY = 0.7;
const MIN_FRAMES = 6;
const TEMPLATE_LEN = 32;

export type ContourPoint = { hz: number; clarity: number; t: number };

export function extractF0Contour(pcm: Float32Array, sampleRate: number): ContourPoint[] {
  if (pcm.length < FRAME_SIZE) return [];
  const detector = PitchDetector.forFloat32Array(FRAME_SIZE);
  const out: ContourPoint[] = [];
  for (let off = 0; off + FRAME_SIZE <= pcm.length; off += HOP) {
    const frame = pcm.subarray(off, off + FRAME_SIZE);
    const [hz, clarity] = detector.findPitch(frame, sampleRate);
    if (clarity < MIN_CLARITY) continue;
    if (hz < 60 || hz > 500) continue;
    out.push({ hz, clarity, t: off / sampleRate });
  }
  return out;
}

export function normalizeContour(pts: ContourPoint[]): number[] {
  if (pts.length === 0) return [];
  const cents = pts.map((p) => 1200 * Math.log2(p.hz));
  const sorted = [...cents].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  return cents.map((c) => c - median);
}

function resample(arr: number[], n: number): number[] {
  if (arr.length === 0) return Array(n).fill(0);
  if (arr.length === 1) return Array(n).fill(arr[0]);
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const idx = (i * (arr.length - 1)) / (n - 1);
    const lo = Math.floor(idx);
    const hi = Math.min(lo + 1, arr.length - 1);
    const frac = idx - lo;
    out[i] = arr[lo] * (1 - frac) + arr[hi] * frac;
  }
  return out;
}

function tpl(fn: (u: number) => number): number[] {
  return Array.from({ length: TEMPLATE_LEN }, (_, i) => fn(i / (TEMPLATE_LEN - 1)));
}

const TEMPLATES: Record<ToneId, number[]> = {
  ngang: tpl(() => 0),
  sac: tpl((u) => -40 + u * 100),
  huyen: tpl((u) => 40 - u * 100),
  hoi: tpl((u) => 60 * (2 * u - 1) ** 2 - 30),
  nga: tpl((u) => 60 * (2 * u - 1) ** 2 - 30),
  nang: tpl((u) => -80 * u),
};

function pearson(a: number[], b: number[]): number {
  const n = a.length;
  let meanA = 0;
  let meanB = 0;
  for (let i = 0; i < n; i++) {
    meanA += a[i];
    meanB += b[i];
  }
  meanA /= n;
  meanB /= n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    const dxa = a[i] - meanA;
    const dxb = b[i] - meanB;
    num += dxa * dxb;
    da += dxa * dxa;
    db += dxb * dxb;
  }
  if (da === 0 || db === 0) return 0;
  return num / Math.sqrt(da * db);
}

export function scoreToneContour(
  observed: number[],
  expectedTone: ToneId,
  dialect: "southern" | "northern" = "southern",
): number {
  if (observed.length < MIN_FRAMES) return 0;
  const tone = spokenTone(expectedTone, dialect);
  const sample = resample(observed, TEMPLATE_LEN);

  if (tone === "ngang") {
    const meanS = sample.reduce((a, b) => a + b, 0) / sample.length;
    const variance = sample.reduce((a, b) => a + (b - meanS) ** 2, 0) / sample.length;
    const std = Math.sqrt(variance);
    return Math.max(0, Math.min(100, Math.round(100 - 2 * Math.max(0, std - 10))));
  }

  if (tone === "nang") {
    const last = sample.slice(Math.floor(sample.length * 0.75));
    const lastMean = last.reduce((a, b) => a + b, 0) / last.length;
    const lowBonus = lastMean < -30 ? 1 : Math.max(0, 1 - (lastMean + 30) / 30);
    const corr = pearson(sample, TEMPLATES[tone]);
    return Math.round(100 * Math.max(0, corr) * lowBonus);
  }

  const corr = pearson(sample, TEMPLATES[tone]);
  return Math.round(100 * Math.max(0, corr));
}

export function gradeTone(
  pcm: Float32Array,
  sampleRate: number,
  expectedTone: ToneId,
  dialect: "southern" | "northern" = "southern",
): { score: number; contour: number[]; clarityOk: boolean } {
  const points = extractF0Contour(pcm, sampleRate);
  const normalized = normalizeContour(points);
  if (normalized.length < MIN_FRAMES) {
    return { score: 0, contour: [], clarityOk: false };
  }
  const score = scoreToneContour(normalized, expectedTone, dialect);
  return { score, contour: normalized, clarityOk: true };
}
