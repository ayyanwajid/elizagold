/* eslint-disable @typescript-eslint/no-explicit-any */
// Comprehensive tracking helper for Meta Pixel & Google Analytics (GA4)

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

interface ProductItem {
  id?: string;
  name?: string;
  bundleTitle?: string;
  price?: number;
  quantity?: number;
}

interface PurchaseTrackingData {
  orderId: string;
  total: number;
  items: ProductItem[];
  customer?: {
    fullName?: string;
    phone?: string;
    city?: string;
  };
}

/**
 * Trigger standard or custom Meta (Facebook) Pixel events safely
 */
export function trackMetaEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.fbq === "function") {
      window.fbq("track", eventName, params);
      if (process.env.NODE_ENV === "development") {
        console.log(`[Meta Pixel] Tracked "${eventName}":`, params);
      }
    }
  } catch (err) {
    console.warn(`[Meta Pixel] Error tracking "${eventName}":`, err);
  }
}

/**
 * Trigger standard Google Analytics (GA4 / Google Tag) events safely
 */
export function trackGoogleEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
      if (process.env.NODE_ENV === "development") {
        console.log(`[Google Analytics] Tracked "${eventName}":`, params);
      }
    }
  } catch (err) {
    console.warn(`[Google Analytics] Error tracking "${eventName}":`, err);
  }
}

/**
 * 1. Product View (ViewContent)
 */
export function trackViewContent(title: string, price: number) {
  trackMetaEvent("ViewContent", {
    content_name: title,
    content_type: "product",
    content_ids: ["eliza-roghan-e-azam"],
    value: price,
    currency: "PKR",
  });

  trackGoogleEvent("view_item", {
    currency: "PKR",
    value: price,
    items: [
      {
        item_id: "eliza-roghan-e-azam",
        item_name: title,
        price: price,
        quantity: 1,
      },
    ],
  });
}

/**
 * 2. Add To Cart (AddToCart)
 */
export function trackAddToCart(bundleTitle: string, price: number, quantity: number = 1) {
  trackMetaEvent("AddToCart", {
    content_name: bundleTitle,
    content_type: "product",
    content_ids: ["eliza-roghan-e-azam"],
    value: price * quantity,
    currency: "PKR",
  });

  trackGoogleEvent("add_to_cart", {
    currency: "PKR",
    value: price * quantity,
    items: [
      {
        item_id: "eliza-roghan-e-azam",
        item_name: bundleTitle,
        price: price,
        quantity: quantity,
      },
    ],
  });
}

/**
 * 3. Initiate Checkout (InitiateCheckout)
 */
export function trackInitiateCheckout(totalValue: number, itemsCount: number = 1) {
  trackMetaEvent("InitiateCheckout", {
    content_name: "Roghan-e-Azam Hair Oil Checkout",
    content_type: "product",
    content_ids: ["eliza-roghan-e-azam"],
    value: totalValue,
    currency: "PKR",
    num_items: itemsCount,
  });

  trackGoogleEvent("begin_checkout", {
    currency: "PKR",
    value: totalValue,
  });
}

/**
 * 4. Purchase Event (Fired ONLY on verified order completion)
 */
export function trackPurchase(data: PurchaseTrackingData) {
  const primaryItemName = data.items[0]?.bundleTitle || "Roghan-e-Azam Hair Oil";

  // Meta Pixel Purchase Event
  trackMetaEvent("Purchase", {
    content_name: primaryItemName,
    content_type: "product",
    content_ids: ["eliza-roghan-e-azam"],
    value: data.total,
    currency: "PKR",
    num_items: data.items.reduce((sum, item) => sum + (item.quantity || 1), 0),
    order_id: data.orderId,
  });

  // Google Analytics 4 Purchase Event
  trackGoogleEvent("purchase", {
    transaction_id: data.orderId,
    value: data.total,
    currency: "PKR",
    items: data.items.map((it) => ({
      item_id: "eliza-roghan-e-azam",
      item_name: it.bundleTitle || "Roghan-e-Azam Hair Oil",
      price: it.price || data.total,
      quantity: it.quantity || 1,
    })),
  });
}

/**
 * 5. Contact / Lead (e.g. WhatsApp Fast Order Click)
 */
export function trackWhatsAppContact(value?: number) {
  trackMetaEvent("Contact", {
    content_name: "WhatsApp Fast Order",
    value: value || 999,
    currency: "PKR",
  });

  trackGoogleEvent("generate_lead", {
    currency: "PKR",
    value: value || 999,
  });
}
