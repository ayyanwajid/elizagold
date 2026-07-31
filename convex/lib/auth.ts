/* eslint-disable @typescript-eslint/no-explicit-any */
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Throws if the token is missing, unknown, or expired. Called at the top of
// every admin-only query/mutation so customer data stays inaccessible to
// anyone who doesn't hold a valid, freshly-issued admin session.
export async function requireAdminSession(ctx: any, token: string) {
  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .unique();

  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Your admin session has expired. Please log in again.");
  }
}
