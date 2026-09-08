/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminSession } from "./lib/auth";

export const createOrder = mutation({
  args: {
    orderId: v.string(),
    customer: v.object({
      fullName: v.string(),
      phone: v.string(),
      city: v.string(),
      address: v.string(),
    }),
    items: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        bundleTitle: v.string(),
        quantity: v.number(),
        price: v.number(),
        originalPrice: v.number(),
        image: v.string(),
      })
    ),
    addMassager: v.boolean(),
    total: v.number(),
    status: v.string(),
    date: v.string(),
    estimatedDelivery: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const id = await ctx.db.insert("orders", args);
    return id;
  },
});

// Admin-only: returns every customer's name, phone and home address, so it
// requires a valid session token instead of being world-readable.
export const listOrders = query({
  args: { token: v.string() },
  handler: async (ctx: any, args: any) => {
    await requireAdminSession(ctx, args.token);
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const updateOrderDetails = mutation({
  args: {
    token: v.string(),
    id: v.id("orders"),
    customer: v.object({
      fullName: v.string(),
      phone: v.string(),
      city: v.string(),
      address: v.string(),
    }),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdminSession(ctx, args.token);
    await ctx.db.patch(args.id, { 
      customer: args.customer,
      adminNotes: args.adminNotes 
    });
  },
});

export const deleteOrder = mutation({
  args: {
    token: v.string(),
    id: v.id("orders"),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdminSession(ctx, args.token);
    await ctx.db.delete(args.id);
  },
});

export const updateOrderStatus = mutation({
  args: {
    token: v.string(),
    id: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdminSession(ctx, args.token);
    await ctx.db.patch(args.id, { status: args.status });
  },
});
