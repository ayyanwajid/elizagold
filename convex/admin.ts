/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { SESSION_TTL_MS, generateSessionToken } from "./lib/auth";

// Verifies the passcode against ADMIN_PASSWORD, a Convex environment
// variable that is never bundled into client JS. On success, issues a
// short-lived session token instead of trusting a client-side flag.
export const login = mutation({
  args: { password: v.string() },
  handler: async (ctx: any, args: any) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || args.password !== expected) {
      throw new Error("Incorrect passcode.");
    }

    const token = generateSessionToken();
    const now = Date.now();
    await ctx.db.insert("adminSessions", {
      token,
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
    });
    return token;
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx: any, args: any) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q: any) => q.eq("token", args.token))
      .unique();
    if (session) await ctx.db.delete(session._id);
  },
});
