/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminSession } from "./lib/auth";

// Returned when no admin has ever saved settings yet, so the storefront and
// dashboard both have sane values before the first "Save Settings" click.
const DEFAULT_SETTINGS = {
  announcementText: "FLASH SALE: 40% OFF + FREE CASH ON DELIVERY ACROSS PAKISTAN",
  whatsappNumber: "+923287657890",
  productPrices: { bottle1: 1499, bottle2: 2699, bottle3: 3699 },
  freeDeliverySiteWide: false,
  singleBottleShippingFee: 150,
};

export const getSettings = query({
  handler: async (ctx: any) => {
    const existing = await ctx.db.query("storeSettings").first();
    return existing ?? DEFAULT_SETTINGS;
  },
});

export const updateSettings = mutation({
  args: {
    token: v.string(),
    announcementText: v.string(),
    whatsappNumber: v.string(),
    productPrices: v.object({
      bottle1: v.number(),
      bottle2: v.number(),
      bottle3: v.number(),
    }),
    freeDeliverySiteWide: v.boolean(),
    singleBottleShippingFee: v.number(),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdminSession(ctx, args.token);

    const settings = {
      announcementText: args.announcementText,
      whatsappNumber: args.whatsappNumber,
      productPrices: args.productPrices,
      freeDeliverySiteWide: args.freeDeliverySiteWide,
      singleBottleShippingFee: args.singleBottleShippingFee,
    };

    const existing = await ctx.db.query("storeSettings").first();
    if (existing) {
      await ctx.db.patch(existing._id, settings);
    } else {
      await ctx.db.insert("storeSettings", settings);
    }
  },
});
