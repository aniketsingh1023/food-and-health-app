/**
 * In-memory sliding-window rate limiter.
 *
 * Keyed by `${endpoint}:${ip}`. Each entry holds a list of request timestamps
 * within the current window. On every request the list is pruned to discard
 * timestamps older than `windowMs`, then the length is compared against
 * `maxRequests`.
 *
 * Trade-offs of in-memory storage:
 *  - Limits are per-instance (not shared across multiple Cloud Run replicas).
 *    For a single-replica deployment this is fine; for multi-replica you would
 *    replace the Map with a Redis / Firestore store without changing the API.
 *  - Memory is bounded: each entry stores at most `maxRequests` timestamps and
 *    a GC sweep prunes stale keys every `SWEEP_INTERVAL_MS`.
 */

const SWEEP_INTERVAL_MS = 60_000; // clean up stale keys every 60 s

interface WindowEntry {
  timestamps: number[];
  lastAccess: number;
}

const store = new Map<string, WindowEntry>();

// Periodic sweep — removes keys that have not been accessed in 2× the longest
// rate-limit window so the Map does not grow unbounded under traffic bursts.
setInterval(() => {
  const cutoff = Date.now() - 2 * 60_000; // 2 min stale threshold
  for (const [key, entry] of store) {
    if (entry.lastAccess < cutoff) store.delete(key);
  }
}, SWEEP_INTERVAL_MS).unref?.(); // .unref() keeps Node from blocking process exit

export interface RateLimitConfig {
  /** How many requests are allowed within the window. */
  maxRequests: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Remaining requests in the current window. */
  remaining: number;
  /** Milliseconds until the oldest request in the window expires. */
  retryAfterMs: number;
}

/**
 * Checks and records a request for the given key.
 *
 * @param key       Unique identifier — typically `${endpoint}:${ip}`.
 * @param config    Window size and request cap.
 * @returns         Whether the request is allowed plus diagnostic metadata.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [], lastAccess: now };
    store.set(key, entry);
  }

  // Prune timestamps outside the current window
  entry.timestamps = entry.timestamps.filter(t => t > windowStart);
  entry.lastAccess = now;

  if (entry.timestamps.length >= config.maxRequests) {
    const oldest = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: oldest + config.windowMs - now,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

// ─── Per-endpoint configs ─────────────────────────────────────────────────────

export const RATE_LIMITS = {
  'analyze-food': { maxRequests: 30, windowMs: 60_000 },
  'chat':         { maxRequests: 20, windowMs: 60_000 },
  'suggest-meal': { maxRequests: 20, windowMs: 60_000 },
  'weekly-insights': { maxRequests: 5, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitConfig>;

/**
 * Extracts the best available client IP from a Next.js request.
 * Prefers `x-forwarded-for` (set by Cloud Run / load balancer) and falls back
 * to the literal string "unknown" so the rate limiter still functions.
 */
export function getClientIp(req: Request): string {
  // x-forwarded-for can be a comma-separated list; take the first (client) IP
  const forwarded = (req.headers as Headers).get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}
