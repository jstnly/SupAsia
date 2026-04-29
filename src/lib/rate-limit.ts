/**
 * In-memory sliding-window rate limiter.
 * Suitable for edge cases with moderate traffic on a single instance.
 * For multi-instance deployments, replace with Redis or Upstash.
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    // Evict expired entries every 1000 checks to prevent unbounded growth
    if (store.size > 5000) {
      for (const [k, v] of store) {
        if (now >= v.resetAt) store.delete(k);
      }
    }
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}
