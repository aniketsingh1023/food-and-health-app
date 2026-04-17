/**
 * Authentication — disabled.
 *
 * NutriAI is currently a client-only app with no user accounts. The
 * next-auth dependency is retained in package.json for when auth is
 * introduced, but all handlers intentionally return null to avoid exposing
 * misconfigured NextAuth endpoints.
 *
 * To enable auth:
 *  1. Configure a real provider in this file (GitHub, Google, Credentials, etc.)
 *  2. Set the AUTH_SECRET environment variable
 *  3. Update middleware.ts to protect routes
 *  4. Wire handlers in app/api/auth/[...nextauth]/route.ts
 */
export const auth = (): null => null;
export const signIn = (): null => null;
export const signOut = (): null => null;
export const handlers = {
  GET:  (): null => null,
  POST: (): null => null,
};
