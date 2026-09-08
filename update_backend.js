const fs = require('fs');

// 1. Update convex/schema.ts
const schemaPath = 'convex/schema.ts';
let schema = fs.readFileSync(schemaPath, 'utf8');
const targetSchema = `    estimatedDelivery: v.string(),\n  }).index("by_status", ["status"]),`;
const replaceSchema = `    estimatedDelivery: v.string(),\n    adminNotes: v.optional(v.string()),\n  }).index("by_status", ["status"]),`;
if (schema.includes(targetSchema)) {
    schema = schema.replace(targetSchema, replaceSchema);
    fs.writeFileSync(schemaPath, schema);
    console.log("Updated schema.ts");
} else {
    console.log("Failed to find target in schema.ts");
}

// 2. Update convex/orders.ts
const ordersPath = 'convex/orders.ts';
let orders = fs.readFileSync(ordersPath, 'utf8');
const targetOrders = `export const updateOrderStatus = mutation({`;

const newMutations = `export const updateOrderDetails = mutation({
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

export const updateOrderStatus = mutation({`;

if (orders.includes(targetOrders) && !orders.includes("export const deleteOrder")) {
    orders = orders.replace(targetOrders, newMutations);
    fs.writeFileSync(ordersPath, orders);
    console.log("Updated orders.ts");
} else {
    console.log("Failed to find target in orders.ts or already updated");
}
