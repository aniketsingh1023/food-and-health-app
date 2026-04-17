/**
 * Next.js middleware — currently no routes require protection.
 *
 * The matcher is intentionally empty so this file compiles without side
 * effects. When authentication is added, update the matcher and implement
 * session validation here (e.g. via next-auth's auth() helper or JWT
 * verification against a custom session cookie).
 */
export function middleware() {
  // No-op: reserved for future auth/session checks
}

export const config = { matcher: [] };
