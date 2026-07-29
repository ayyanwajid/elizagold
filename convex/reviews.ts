/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addReview = mutation({
  args: {
    name: v.string(),
    city: v.string(),
    rating: v.number(),
    date: v.string(),
    title: v.string(),
    comment: v.string(),
    verified: v.boolean(),
  },
  handler: async (ctx: any, args: any) => {
    return await ctx.db.insert("reviews", args);
  },
});

export const listReviews = query({
  handler: async (ctx: any) => {
    return await ctx.db.query("reviews").order("desc").collect();
  },
});
