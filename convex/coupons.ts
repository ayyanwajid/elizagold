/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminSession } from "./lib/auth";

// Public: the storefront needs to validate codes at checkout, and coupon
// codes/discount values aren't sensitive the way customer PII is.
export const listCoupons = query({
  handler: async (ctx: any) => {
    return await ctx.db.query("coupons").collect();
  },
});

export const addCoupon = mutation({
  args: {
    token: v.string(),
    code: v.string(),
    discount: v.string(),
    discountValue: v.number(),
    type: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdminSession(ctx, args.token);
    await ctx.db.insert("coupons", {
      code: args.code,
      discount: args.discount,
      discountValue: args.discountValue,
      type: args.type,
      active: true,
    });
  },
});

export const toggleCoupon = mutation({
  args: { token: v.string(), id: v.id("coupons"), active: v.boolean() },
  handler: async (ctx: any, args: any) => {
    await requireAdminSession(ctx, args.token);
    await ctx.db.patch(args.id, { active: args.active });
  },
});

export const deleteCoupon = mutation({
  args: { token: v.string(), id: v.id("coupons") },
  handler: async (ctx: any, args: any) => {
    await requireAdminSession(ctx, args.token);
    await ctx.db.delete(args.id);
  },
});
