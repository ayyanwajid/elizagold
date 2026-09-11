"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { google } from "googleapis";
import { requireAdminSession } from "./lib/auth";

export const exportOrderToSheet = action({
  args: {
    token: v.string(),
    order: v.object({
      orderId: v.string(),
      customer: v.object({
        fullName: v.string(),
        phone: v.string(),
        city: v.string(),
        address: v.string(),
      }),
      items: v.array(
        v.object({
          name: v.string(),
          bundleTitle: v.string(),
          price: v.number(),
          quantity: v.number(),
        })
      ),
      total: v.number(),
      status: v.string(),
      date: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    // 1. Verify admin session
    await requireAdminSession(ctx, args.token);

    // 2. Load credentials from Convex environment variables
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!clientEmail || !privateKey || !sheetId) {
      throw new Error(
        "Google Sheets integration is not configured. Missing environment variables."
      );
    }

    try {
      // 3. Authenticate with Google API
      const auth = new google.auth.JWT(
        clientEmail,
        undefined,
        privateKey,
        ["https://www.googleapis.com/auth/spreadsheets"]
      );

      const sheets = google.sheets({ version: "v4", auth });

      // 4. Format data according to the screenshot columns:
      // A: Name
      // B: Address (Full Address + City)
      // C: Phone Number
      // D: Checkbox (Status/COD - we can just put TRUE or FALSE, or leave empty)
      // E: Bottles (Quantity)
      
      const { customer, items, status } = args.order;
      
      // Calculate total bottles (assuming each item quantity is total bottles)
      let totalBottles = 0;
      for (const item of items) {
        // Quick extraction of number of bottles if bundleTitle contains "1 Bottle", "2 Bottles" etc.
        // Otherwise just use quantity.
        const match = item.bundleTitle.match(/(\d+)\s+Bottle/i);
        if (match && match[1]) {
          totalBottles += parseInt(match[1]) * item.quantity;
        } else {
          totalBottles += item.quantity;
        }
      }

      const row = [
        customer.fullName, // Col A: Name
        `${customer.address}, ${customer.city}`, // Col B: Address
        customer.phone, // Col C: Phone
        status === "Delivered" || status === "Dispatched" ? "TRUE" : "FALSE", // Col D: Checkbox (Status heuristic)
        totalBottles > 0 ? totalBottles.toString() : "1", // Col E: Bottles
      ];

      // 5. Append to Google Sheet
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: "Sheet1!A:E", // Adjust "Sheet1" if the tab is named differently
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [row],
        },
      });

      return { success: true };
    } catch (error: any) {
      console.error("Google Sheets Error:", error);
      throw new Error(`Failed to sync to Google Sheets: ${error.message}`);
    }
  },
});
