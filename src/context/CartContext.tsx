"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export interface CartItem {
  id: string;
  name: string;
  bundleTitle: string;
  bottles: number;
  quantity: number;
  price: number;
  originalPrice: number;
  image: string;
}

export interface BundleOption {
  id: string;
  title: string;
  bottles: number;
  price: number;
  originalPrice: number;
  badge: string | null;
  savings: string;
}

export const BASE_BUNDLE_TEMPLATES: BundleOption[] = [
  {
    id: "single",
    title: "1 Bottle (Starter Pack)",
    bottles: 1,
    price: 1499,
    originalPrice: 2500,
    badge: null,
    savings: "Save Rs. 1,001",
  },
  {
    id: "popular",
    title: "2 Bottles (Popular Pack)",
    bottles: 2,
    price: 2699,
    originalPrice: 5000,
    badge: "MOST POPULAR",
    savings: "Save Rs. 2,301 + FREE Delivery",
  },
  {
    id: "value",
    title: "3 Bottles (Family Pack)",
    bottles: 3,
    price: 3699,
    originalPrice: 7500,
    badge: "BEST VALUE",
    savings: "Save Rs. 3,801 + FREE Delivery",
  },
];

const DEFAULT_IMAGE = "/assets/product-1.webp";

interface CartContextType {
  cartItems: CartItem[];
  bundles: BundleOption[];
  addToCart: (bundle: BundleOption, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  couponCode: string;
  discountPercent: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  subtotal: number;
  shippingFee: number;
  currentDiscount: number;
  grandTotal: number;
  isSingleBottlePack: boolean;
  isFreeDelivery: boolean;
  freeDeliverySiteWide: boolean;
  singleBottleShippingFee: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "eliza_cart_items_v3";
const COUPON_STORAGE_KEY = "eliza_active_coupon_v3";

const FALLBACK_COUPONS: Record<string, number> = {
  SAVE10: 10,
  ELIZA10: 10,
  GOLD15: 15,
  SPECIAL20: 20,
};

interface CouponDoc {
  _id: string;
  code: string;
  discount: string;
  discountValue: number;
  type: string;
  active: boolean;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Live sync with Convex storeSettings (editable from Admin Dashboard)
  const settingsQuery = useQuery(api.settings.getSettings);
  const couponsQuery = (useQuery(api.coupons.listCoupons) ?? []) as CouponDoc[];

  const freeDeliverySiteWide = settingsQuery?.freeDeliverySiteWide ?? false;
  const singleBottleShippingFee = settingsQuery?.singleBottleShippingFee ?? 150;

  // Dynamic bundles mapped to live Admin prices
  const bundles = useMemo<BundleOption[]>(() => {
    if (!settingsQuery?.productPrices) return BASE_BUNDLE_TEMPLATES;
    const prices = settingsQuery.productPrices;
    return [
      {
        ...BASE_BUNDLE_TEMPLATES[0],
        price: prices.bottle1 || BASE_BUNDLE_TEMPLATES[0].price,
        savings: `Save Rs. ${(BASE_BUNDLE_TEMPLATES[0].originalPrice - (prices.bottle1 || BASE_BUNDLE_TEMPLATES[0].price)).toLocaleString()}`,
      },
      {
        ...BASE_BUNDLE_TEMPLATES[1],
        price: prices.bottle2 || BASE_BUNDLE_TEMPLATES[1].price,
        savings: `Save Rs. ${(BASE_BUNDLE_TEMPLATES[1].originalPrice - (prices.bottle2 || BASE_BUNDLE_TEMPLATES[1].price)).toLocaleString()} + FREE Delivery`,
      },
      {
        ...BASE_BUNDLE_TEMPLATES[2],
        price: prices.bottle3 || BASE_BUNDLE_TEMPLATES[2].price,
        savings: `Save Rs. ${(BASE_BUNDLE_TEMPLATES[2].originalPrice - (prices.bottle3 || BASE_BUNDLE_TEMPLATES[2].price)).toLocaleString()} + FREE Delivery`,
      },
    ];
  }, [settingsQuery]);

  // Active items in cart
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // fallback
      }
    }
    const defaultBundle = BASE_BUNDLE_TEMPLATES[1]; // 2-Bottle Popular pack
    return [
      {
        id: defaultBundle.id,
        name: "Eliza Gold Roghan-e-Azam Misali Hair Oil",
        bundleTitle: defaultBundle.title,
        bottles: defaultBundle.bottles,
        quantity: 1,
        price: defaultBundle.price,
        originalPrice: defaultBundle.originalPrice,
        image: DEFAULT_IMAGE,
      },
    ];
  });

  // Whenever live admin prices change, sync active cart item price
  useEffect(() => {
    if (bundles.length > 0) {
      setCartItems((prev) =>
        prev.map((item) => {
          const matchedBundle = bundles.find((b) => b.id === item.id);
          if (matchedBundle && matchedBundle.price !== item.price) {
            return {
              ...item,
              price: matchedBundle.price,
              bundleTitle: matchedBundle.title,
            };
          }
          return item;
        })
      );
    }
  }, [bundles]);

  const [couponCode, setCouponCode] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon) {
        const parsed = JSON.parse(savedCoupon);
        if (parsed.code && parsed.percent) {
          setCouponCode(parsed.code);
          setDiscountPercent(parsed.percent);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const addToCart = (bundle: BundleOption, quantity: number = 1) => {
    const newItem: CartItem = {
      id: bundle.id,
      name: "Eliza Gold Roghan-e-Azam Misali Hair Oil",
      bundleTitle: bundle.title,
      bottles: bundle.bottles,
      quantity: Math.max(1, quantity),
      price: bundle.price,
      originalPrice: bundle.originalPrice,
      image: DEFAULT_IMAGE,
    };
    setCartItems([newItem]);
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponCode("");
    setDiscountPercent(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();

    // 1. Check Convex live coupons from admin
    const liveCoupons = (couponsQuery ?? []).filter((c) => c.active);
    const matchedLive = liveCoupons.find((c) => c.code.toUpperCase() === cleanCode);
    if (matchedLive) {
      const pct = Number(matchedLive.discountValue) || 10;
      setCouponCode(cleanCode);
      setDiscountPercent(pct);
      try {
        localStorage.setItem(
          COUPON_STORAGE_KEY,
          JSON.stringify({ code: cleanCode, percent: pct })
        );
      } catch {
        // ignore
      }
      return { success: true, message: `Coupon "${cleanCode}" applied! (${pct}% OFF)` };
    }

    // 2. Check fallback coupons
    if (FALLBACK_COUPONS[cleanCode]) {
      const pct = FALLBACK_COUPONS[cleanCode];
      setCouponCode(cleanCode);
      setDiscountPercent(pct);
      try {
        localStorage.setItem(
          COUPON_STORAGE_KEY,
          JSON.stringify({ code: cleanCode, percent: pct })
        );
      } catch {
        // ignore
      }
      return { success: true, message: `Coupon "${cleanCode}" applied! (${pct}% OFF)` };
    }

    return {
      success: false,
      message: `Invalid coupon code. Try ${Object.keys(FALLBACK_COUPONS).join(", ")}`,
    };
  };

  const removeCoupon = () => {
    setCouponCode("");
    setDiscountPercent(0);
    try {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const currentDiscount =
    discountPercent > 0 ? Math.round(subtotal * (discountPercent / 100)) : 0;

  const isSingleBottlePack =
    cartItems.length > 0 &&
    (cartItems[0].bottles === 1 || cartItems[0].bundleTitle.startsWith("1 Bottle"));

  // Follows Admin dashboard configuration:
  // If admin toggles freeDeliverySiteWide = true, shipping is 0 for all!
  // Otherwise, 2+ bottles have Free Delivery and 1 bottle uses admin's singleBottleShippingFee
  const isFreeDelivery = cartItems.length > 0 && (freeDeliverySiteWide || !isSingleBottlePack);
  const shippingFee = cartItems.length === 0 ? 0 : isFreeDelivery ? 0 : singleBottleShippingFee;
  const grandTotal = Math.max(0, subtotal - currentDiscount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        bundles,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        couponCode,
        discountPercent,
        applyCoupon,
        removeCoupon,
        subtotal,
        shippingFee,
        currentDiscount,
        grandTotal,
        isSingleBottlePack,
        isFreeDelivery,
        freeDeliverySiteWide,
        singleBottleShippingFee,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
