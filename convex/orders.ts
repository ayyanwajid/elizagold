/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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

export const listOrders = query({
  handler: async (ctx: any) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const updateOrderStatus = mutation({
  args: {
    id: v.string(),
    status: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
