import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  orders: defineTable({
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
    status: v.string(), // "Pending" | "Dispatched" | "Delivered" | "Cancelled"
    date: v.string(),
    estimatedDelivery: v.string(),
    adminNotes: v.optional(v.string()),
  }).index("by_status", ["status"]),

  reviews: defineTable({
    name: v.string(),
    city: v.string(),
    rating: v.number(),
    date: v.string(),
    title: v.string(),
    comment: v.string(),
    verified: v.boolean(),
  }),

  adminSessions: defineTable({
    token: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  // Singleton row: storefront banner/pricing/shipping config, editable from
  // the admin dashboard so changes reach every visitor, not just localStorage
  // on the admin's own browser.
  storeSettings: defineTable({
    announcementText: v.string(),
    whatsappNumber: v.string(),
    productPrices: v.object({
      bottle1: v.number(),
      bottle2: v.number(),
      bottle3: v.number(),
    }),
    freeDeliverySiteWide: v.boolean(),
    singleBottleShippingFee: v.number(),
  }),

  coupons: defineTable({
    code: v.string(),
    discount: v.string(),
    discountValue: v.number(),
    type: v.string(), // "Percentage" | "Shipping" | "Custom"
    active: v.boolean(),
  }),
});
