/* eslint-disable @typescript-eslint/no-explicit-any */
// Comprehensive tracking helper for Meta Pixel, TikTok Pixel & Google Analytics (GA4)
// With distinct package/bundle tracking (1 Bottle, 2 Bottles, 3 Bottles) for ad cost & value optimization

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    ttq?: {
      track: (eventName: string, params?: Record<string, any>, options?: Record<string, any>) => void;
      page: () => void;
      identify: (params: Record<string, any>) => void;
      [key: string]: any;
    };
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface ProductItem {
  id?: string;
  name?: string;
  bundleTitle?: string;
  bottles?: number;
  price?: number;
  quantity?: number;
  originalPrice?: number;
  image?: string;
}

export interface CustomerData {
  fullName?: string;
  phone?: string;
  city?: string;
  address?: string;
  email?: string;
}

export interface PurchaseTrackingData {
  orderId: string;
  total: number;
  items: ProductItem[];
  customer?: CustomerData;
}

/**
 * Returns distinct content_id based on the selected bottle package
 * (e.g. eliza-oil-1-bottle, eliza-oil-2-bottles, eliza-oil-3-bottles)
 */
export function getBundleContentId(bottles: number = 1, bundleId?: string): string {
  if (bundleId === "single" || bottles === 1) return "eliza-oil-1-bottle";
  if (bundleId === "popular" || bottles === 2) return "eliza-oil-2-bottles";
  if (bundleId === "value" || bottles === 3) return "eliza-oil-3-bottles";
  return `eliza-oil-${bottles}-bottles`;
}

/**
 * Trigger standard or custom Meta (Facebook) Pixel events safely
 */
export function trackMetaEvent(eventName: string, params?: Record<string, any>, eventId?: string) {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.fbq === "function") {
      if (eventId) {
        window.fbq("track", eventName, params, { eventID: eventId });
      } else {
        window.fbq("track", eventName, params);
      }
      if (process.env.NODE_ENV === "development") {
        console.log(`[Meta Pixel] Tracked "${eventName}":`, params);
      }
    }
  } catch (err) {
    console.warn(`[Meta Pixel] Error tracking "${eventName}":`, err);
  }
}

/**
 * Trigger standard TikTok Pixel events safely
 */
export function trackTikTokEvent(eventName: string, params?: Record<string, any>, eventId?: string) {
  if (typeof window === "undefined") return;
  try {
    if (window.ttq && typeof window.ttq.track === "function") {
      if (eventId) {
        window.ttq.track(eventName, params, { event_id: eventId });
      } else {
        window.ttq.track(eventName, params);
      }
      if (process.env.NODE_ENV === "development") {
        console.log(`[TikTok Pixel] Tracked "${eventName}":`, params);
      }
    }
  } catch (err) {
    console.warn(`[TikTok Pixel] Error tracking "${eventName}":`, err);
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
 * 1. Product View (ViewContent) - Includes selected package details
 */
export function trackViewContent(
  title: string,
  price: number,
  bottles: number = 2,
  bundleId?: string
) {
  const contentId = getBundleContentId(bottles, bundleId);
  const packageType = `${bottles}_bottle_pack`;

  // Meta Pixel
  trackMetaEvent("ViewContent", {
    content_name: title,
    content_type: "product",
    content_ids: [contentId],
    value: price,
    currency: "PKR",
    package_name: title,
    package_type: packageType,
    bottles_count: bottles,
  });

  // TikTok Pixel
  trackTikTokEvent("ViewContent", {
    content_id: contentId,
    content_type: "product",
    content_name: title,
    currency: "PKR",
    value: price,
    package_name: title,
    package_type: packageType,
    bottles_count: bottles,
  });

  // Google Analytics
  trackGoogleEvent("view_item", {
    currency: "PKR",
    value: price,
    items: [
      {
        item_id: contentId,
        item_name: title,
        price: price,
        quantity: 1,
        item_category: packageType,
      },
    ],
  });
}

/**
 * 2. Add To Cart (AddToCart) - Transmits chosen package (1, 2, or 3 bottles) & value
 */
export function trackAddToCart(
  bundleTitle: string,
  price: number,
  quantity: number = 1,
  bottles: number = 2,
  bundleId?: string
) {
  const contentId = getBundleContentId(bottles, bundleId);
  const totalVal = price * quantity;
  const packageType = `${bottles}_bottle_pack`;
  const totalBottles = bottles * quantity;

  // Meta Pixel
  trackMetaEvent("AddToCart", {
    content_name: bundleTitle,
    content_type: "product",
    content_ids: [contentId],
    contents: [
      {
        id: contentId,
        quantity: quantity,
        item_price: price,
      },
    ],
    value: totalVal,
    currency: "PKR",
    num_items: totalBottles,
    package_name: bundleTitle,
    package_type: packageType,
    bottles_count: totalBottles,
  });

  // TikTok Pixel
  trackTikTokEvent("AddToCart", {
    content_id: contentId,
    content_type: "product",
    content_name: bundleTitle,
    quantity: quantity,
    currency: "PKR",
    value: totalVal,
    package_name: bundleTitle,
    package_type: packageType,
    bottles_count: totalBottles,
  });

  // Google Analytics
  trackGoogleEvent("add_to_cart", {
    currency: "PKR",
    value: totalVal,
    items: [
      {
        item_id: contentId,
        item_name: bundleTitle,
        price: price,
        quantity: quantity,
        item_category: packageType,
      },
    ],
  });
}

/**
 * 3. Initiate Checkout (InitiateCheckout) - Transmits chosen package to Meta & TikTok
 */
export function trackInitiateCheckout(
  totalValue: number,
  primaryItem?: ProductItem
) {
  const bottles = primaryItem?.bottles || 2;
  const bundleTitle = primaryItem?.bundleTitle || `${bottles} Bottles Pack`;
  const contentId = getBundleContentId(bottles, primaryItem?.id);
  const packageType = `${bottles}_bottle_pack`;
  const quantity = primaryItem?.quantity || 1;
  const totalBottles = bottles * quantity;

  // Meta Pixel
  trackMetaEvent("InitiateCheckout", {
    content_name: bundleTitle,
    content_type: "product",
    content_ids: [contentId],
    contents: [
      {
        id: contentId,
        quantity: quantity,
        item_price: primaryItem?.price || totalValue,
      },
    ],
    value: totalValue,
    currency: "PKR",
    num_items: totalBottles,
    package_name: bundleTitle,
    package_type: packageType,
    bottles_count: totalBottles,
  });

  // TikTok Pixel
  trackTikTokEvent("InitiateCheckout", {
    content_id: contentId,
    content_type: "product",
    content_name: bundleTitle,
    currency: "PKR",
    value: totalValue,
    quantity: totalBottles,
    package_name: bundleTitle,
    package_type: packageType,
    bottles_count: totalBottles,
  });

  // Google Analytics
  trackGoogleEvent("begin_checkout", {
    currency: "PKR",
    value: totalValue,
    items: [
      {
        item_id: contentId,
        item_name: bundleTitle,
        price: primaryItem?.price || totalValue,
        quantity: quantity,
        item_category: packageType,
      },
    ],
  });
}

/**
 * 4. Purchase Event - Records exact package chosen (1, 2, or 3 bottles), value & customer details
 * Deduplicated via sessionStorage to prevent double-firing on page reloads!
 */
export function trackPurchase(data: PurchaseTrackingData): boolean {
  if (typeof window === "undefined" || !data.orderId) return false;

  // Deduplication guard
  const trackingKey = `eliza_order_tracked_${data.orderId}`;
  try {
    if (sessionStorage.getItem(trackingKey)) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Tracking] Purchase for ${data.orderId} already fired. Skipping deduplication.`);
      }
      return false;
    }
  } catch {
    // ignore
  }

  const primaryItem = data.items[0];
  const bottles =
    primaryItem?.bottles ||
    (primaryItem?.bundleTitle?.includes("3 Bottle")
      ? 3
      : primaryItem?.bundleTitle?.includes("2 Bottle")
      ? 2
      : 1);
  const bundleTitle = primaryItem?.bundleTitle || `${bottles} Bottles Pack`;
  const contentId = getBundleContentId(bottles, primaryItem?.id);
  const packageType = `${bottles}_bottle_pack`;
  const totalBottles = data.items.reduce(
    (sum, item) => sum + (item.bottles || bottles) * (item.quantity || 1),
    0
  );

  // Advanced Matching for TikTok
  if (data.customer && window.ttq && typeof window.ttq.identify === "function") {
    try {
      window.ttq.identify({
        phone_number: data.customer.phone
          ? data.customer.phone.replace(/[^0-9]/g, "")
          : undefined,
        name: data.customer.fullName,
      });
    } catch {
      // ignore
    }
  }

  // Meta Pixel Purchase Event with Specific Package Data
  trackMetaEvent(
    "Purchase",
    {
      content_name: bundleTitle,
      content_type: "product",
      content_ids: [contentId],
      contents: [
        {
          id: contentId,
          quantity: primaryItem?.quantity || 1,
          item_price: primaryItem?.price || data.total,
        },
      ],
      value: data.total,
      currency: "PKR",
      num_items: totalBottles,
      package_name: bundleTitle,
      package_type: packageType,
      bottles_count: totalBottles,
      order_id: data.orderId,
    },
    data.orderId // Event ID for deduplication
  );

  // TikTok Pixel CompletePayment Event with Specific Package Data
  trackTikTokEvent(
    "CompletePayment",
    {
      content_id: contentId,
      content_type: "product",
      content_name: bundleTitle,
      quantity: totalBottles,
      value: data.total,
      currency: "PKR",
      order_id: data.orderId,
      package_name: bundleTitle,
      package_type: packageType,
      bottles_count: totalBottles,
    },
    data.orderId
  );

  // Google Analytics 4 Purchase Event
  trackGoogleEvent("purchase", {
    transaction_id: data.orderId,
    value: data.total,
    currency: "PKR",
    items: data.items.map((it) => ({
      item_id: getBundleContentId(it.bottles || bottles, it.id),
      item_name: it.bundleTitle || bundleTitle,
      price: it.price || data.total,
      quantity: it.quantity || 1,
      item_category: packageType,
    })),
  });

  // Mark as tracked
  try {
    sessionStorage.setItem(trackingKey, "true");
  } catch {
    // ignore
  }

  return true;
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

  trackTikTokEvent("Contact", {
    content_name: "WhatsApp Fast Order",
    value: value || 999,
    currency: "PKR",
  });

  trackGoogleEvent("generate_lead", {
    currency: "PKR",
    value: value || 999,
  });
}
