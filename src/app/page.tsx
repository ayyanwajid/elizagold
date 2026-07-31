/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, FieldValues } from "react-hook-form";
import Lenis from "lenis";
import {
  X,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Plus,
  Minus,
  Leaf,
  Star,
  ShoppingBag,
  Truck,
  RotateCcw,
  Award,
  Check,
  Flame,
  XCircle,
  Ban,
  Zap
} from "lucide-react";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// --- TYPES & DATA ---
interface CartItem {
  id: string;
  name: string;
  bundleTitle: string;
  quantity: number;
  price: number;
  originalPrice: number;
  image: string;
}

const BASE_BUNDLE_OPTIONS = [
  {
    id: "single",
    title: "1 Bottle (Starter Pack)",
    bottles: 1,
    price: 1499,
    originalPrice: 2500,
    badge: null,
    savings: "Save Rs. 1,001"
  },
  {
    id: "popular",
    title: "2 Bottles (Popular Pack)",
    bottles: 2,
    price: 2699,
    originalPrice: 5000,
    badge: "MOST POPULAR",
    savings: "Save Rs. 2,301 + FREE Delivery"
  },
  {
    id: "value",
    title: "3 Bottles (Family Pack)",
    bottles: 3,
    price: 3699,
    originalPrice: 7500,
    badge: "BEST VALUE",
    savings: "Save Rs. 3,801 + FREE Delivery"
  }
];

const PAKISTAN_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Gujranwala",
  "Sialkot",
  "Quetta",
  "Hyderabad",
  "Bahawalpur",
  "Sargodha",
  "Abbottabad",
  "Sukkur",
  "Larkana",
  "Other City"
];

const REVIEWS_DATA = [
  {
    id: 1,
    name: "Fatima Sohail",
    city: "Lahore",
    rating: 5,
    date: "2 days ago",
    title: "Hair fall reduced by 80% in just 2 weeks!",
    comment: "I was extremely skeptical at first because I tried many branded hair oils in Pakistan. But Roghan-e-Azam actually worked! My severe hair fall stopped after 4 applications and my scalp feels so healthy.",
    verified: true
  },
  {
    id: 2,
    name: "Mohammad Usman",
    city: "Karachi",
    rating: 5,
    date: "1 week ago",
    title: "Best natural oil for beard and hair growth",
    comment: "Awesome quality oil! Smells authentic and natural. I got the 2-bottle pack and received it in Karachi in just 2 days via Cash on Delivery. Highly recommended!",
    verified: true
  },
  {
    id: 3,
    name: "Zainab Bibi",
    city: "Islamabad",
    rating: 5,
    date: "2 weeks ago",
    title: "Dandruff completely gone",
    comment: "My winter dandruff was so bad. After applying this oil twice a week before shower, my scalp is completely clean and soft. Will definitely order again.",
    verified: true
  },
  {
    id: 4,
    name: "Ayesha Malik",
    city: "Rawalpindi",
    rating: 5,
    date: "3 weeks ago",
    title: "Visible new hair baby growth!",
    comment: "I noticed baby hairs growing near my forehead line after 1 month of regular use. Truly misali product!",
    verified: true
  }
];

interface CouponDoc { _id: string; code: string; discount: string; discountValue: number; type: string; active: boolean; }

export default function Home() {
  // State Management
  const [selectedImage, setSelectedImage] = useState(0);

  // Live store settings & coupons — Convex is the source of truth, so a
  // change the admin saves reaches every visitor, not just their own browser.
  const settingsQuery = useQuery(api.settings.getSettings);
  const couponsQuery = useQuery(api.coupons.listCoupons) as CouponDoc[] | undefined;

  const announcementText = settingsQuery?.announcementText ?? "FLASH SALE: 40% OFF + FREE CASH ON DELIVERY ACROSS PAKISTAN";
  const whatsappNumber = settingsQuery?.whatsappNumber ?? "+923287657890";
  const freeDeliverySiteWide = settingsQuery?.freeDeliverySiteWide ?? false;
  const singleBottleShippingFee = settingsQuery?.singleBottleShippingFee ?? 150;
  const activeCoupons = useMemo(() => (couponsQuery ?? []).filter((c) => c.active), [couponsQuery]);

  const bundleOptions = useMemo(() => {
    if (!settingsQuery) return BASE_BUNDLE_OPTIONS;
    const prices = settingsQuery.productPrices;
    return BASE_BUNDLE_OPTIONS.map((b, i) => ({
      ...b,
      price: i === 0 ? prices.bottle1 : i === 1 ? prices.bottle2 : prices.bottle3
    }));
  }, [settingsQuery]);

  const [selectedBundleId, setSelectedBundleId] = useState(BASE_BUNDLE_OPTIONS[1].id);
  const selectedBundle = bundleOptions.find((b) => b.id === selectedBundleId) ?? bundleOptions[1];
  const [quantity, setQuantity] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(10);

  interface OrderConfirmationDetails {
    orderId: string;
    customer: {
      fullName: string;
      phone: string;
      city: string;
      address: string;
    };
    items: CartItem[];
    total: number;
    date: string;
    estimatedDelivery: string;
  }

  const [orderConfirmed, setOrderConfirmed] = useState<OrderConfirmationDetails | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewsList, setReviewsList] = useState(REVIEWS_DATA);

  // Live Countdown Timer State (Urgency Boost)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 28, seconds: 45 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sticky Mobile Order Bar State
  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Social Proof Order Toast Notifications State
  const [activeToastIndex, setActiveToastIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const SOCIAL_PROOF_TOASTS = [
    { name: "Fatima S.", city: "Lahore", item: "2 Bottles (Popular Pack)", time: "3 mins ago" },
    { name: "Usman K.", city: "Karachi", item: "3 Bottles (Family Pack)", time: "7 mins ago" },
    { name: "Zainab B.", city: "Islamabad", item: "2 Bottles (Popular Pack)", time: "12 mins ago" },
    { name: "Ayesha M.", city: "Rawalpindi", item: "1 Bottle (Starter Pack)", time: "15 mins ago" }
  ];

  useEffect(() => {
    const toastInterval = setInterval(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4500);
      setActiveToastIndex(prev => (prev + 1) % SOCIAL_PROOF_TOASTS.length);
    }, 11000);
    return () => clearInterval(toastInterval);
  }, [SOCIAL_PROOF_TOASTS.length]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { register: registerReview, handleSubmit: handleSubmitReview, reset: resetReviewForm } = useForm();

  const galleryImages = [
    "/assets/eliza-gold-combo-100ml.webp",
    "/assets/eliza-gold-bottle-100ml.webp",
    "/assets/eliza-gold-box-100ml.webp",
    "/assets/product-3.webp",
    "/assets/product-4.webp",
    "/assets/product-5.webp"
  ];

  // Preload gallery images in browser memory for 0ms instant thumbnail switching
  useEffect(() => {
    galleryImages.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Cart helper functions
  const handleAddToCart = () => {
    const newItem: CartItem = {
      id: `${selectedBundle.id}-${Date.now()}`,
      name: `Roghan-e-Azam Misali Hair Oil`,
      bundleTitle: selectedBundle.title,
      quantity: quantity,
      price: selectedBundle.price,
      originalPrice: selectedBundle.originalPrice,
      image: galleryImages[0]
    };
    setCartItems([newItem]); // Single product shop or replace
    setIsDrawerOpen(true);
  };

  const handleBuyNow = () => {
    handleAddToCart();
  };

  const updateCartQty = (delta: number) => {
    if (cartItems.length === 0) return;
    const updated = cartItems.map(item => {
      const newQty = Math.max(1, item.quantity + delta);
      return { ...item, quantity: newQty };
    });
    setCartItems(updated);
  };

  // Cart Financials
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const currentDiscount = discountApplied ? Math.round(subtotal * (discountPercent / 100)) : 0;
  // Per the Shipping Policy: only the 1-Bottle Starter Pack carries a delivery
  // fee — 2 & 3-Bottle packs are always free, regardless of price. The admin
  // can also force free delivery site-wide from the dashboard for promotions.
  const isSingleBottlePack = cartItems[0]?.bundleTitle?.startsWith("1 Bottle") ?? false;
  const isFreeDelivery = cartItems.length > 0 && (freeDeliverySiteWide || !isSingleBottlePack);
  const shippingFee = isFreeDelivery ? 0 : singleBottleShippingFee;
  const grandTotal = Math.max(0, subtotal - currentDiscount + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    const matchedCoupon = activeCoupons.find(c => c.code === code && c.active);
    if (matchedCoupon) {
      setDiscountApplied(true);
      setDiscountPercent(matchedCoupon.discountValue || 10);
    } else {
      alert(`Invalid coupon code. Available codes: ${activeCoupons.map(c => c.code).join(", ")}`);
    }
  };

  // Convex Cloud Mutations & Queries
  const createOrderMutation = useMutation(api.orders.createOrder);
  const addReviewMutation = useMutation(api.reviews.addReview);
  const convexReviews = useQuery(api.reviews.listReviews);

  useEffect(() => {
    if (convexReviews && Array.isArray(convexReviews) && convexReviews.length > 0) {
      const formatted = convexReviews.map((r: any, idx: number) => ({
        id: idx + 1,
        name: r.name || "Anonymous",
        city: r.city || "Pakistan",
        rating: Number(r.rating) || 5,
        date: r.date || "Just now",
        title: r.title || "Review",
        comment: r.comment || "",
        verified: !!r.verified
      }));
      setReviewsList(formatted);
    }
  }, [convexReviews]);

  const handleCheckoutSubmit = async (data: FieldValues) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const orderDetails: OrderConfirmationDetails = {
      orderId: `EG-${Math.floor(10000 + Math.random() * 90000)}`,
      customer: {
        fullName: String(data.fullName || ""),
        phone: String(data.phone || ""),
        city: String(data.city || ""),
        address: String(data.address || "")
      },
      items: cartItems,
      total: grandTotal,
      date: new Date().toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }),
      estimatedDelivery: "2 to 3 Business Days"
    };

    // Save to localStorage for fallback
    try {
      const existing = JSON.parse(localStorage.getItem("eliza_orders_list") || "[]");
      const updated = [{ ...orderDetails, status: "Pending" }, ...existing];
      localStorage.setItem("eliza_orders_list", JSON.stringify(updated));
    } catch {
      // fallback
    }

    // Sync live to Convex Cloud
    try {
      if (createOrderMutation) {
        await createOrderMutation({
          orderId: orderDetails.orderId,
          customer: orderDetails.customer,
          items: orderDetails.items,
          addMassager: false, // retained only because the Convex orders schema still requires the field
          total: orderDetails.total,
          status: "Pending",
          date: orderDetails.date,
          estimatedDelivery: orderDetails.estimatedDelivery
        });
      }
    } catch (err) {
      console.log("Convex cloud order save offline fallback:", err);
    }

    setOrderConfirmed(orderDetails);
    setCartItems([]);
  };

  const handleReviewSubmit = async (data: FieldValues) => {
    const newRev = {
      id: Date.now(),
      name: String(data.name || "Anonymous"),
      city: String(data.city || "Pakistan"),
      rating: Number(data.rating) || 5,
      date: "Just now",
      title: String(data.title || "Great Product"),
      comment: String(data.comment || ""),
      verified: true
    };

    setReviewsList([newRev, ...reviewsList]);
    setReviewModalOpen(false);
    resetReviewForm();

    // Sync live to Convex Cloud
    try {
      if (addReviewMutation) {
        await addReviewMutation({
          name: newRev.name,
          city: newRev.city,
          rating: newRev.rating,
          date: newRev.date,
          title: newRev.title,
          comment: newRev.comment,
          verified: newRev.verified
        });
      }
    } catch (err) {
      console.log("Convex cloud review save offline fallback:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1917] font-sans selection:bg-[#d4af37]/20 selection:text-[#0b2912] overflow-x-hidden">
      
      {/* ANNOUNCEMENT BAR WITH LIVE COUNTDOWN TIMER */}
      <div className="bg-[#0b2912] text-white text-xs py-2.5 px-4 text-center tracking-widest uppercase font-semibold flex flex-wrap items-center justify-center gap-2 border-b border-[#d4af37]/20">
        <Flame className="w-4 h-4 text-[#d4af37] animate-pulse" />
        <span>{announcementText}</span>
        <span className="bg-[#d4af37] text-[#0b2912] font-black px-2.5 py-0.5 rounded text-[11px] font-mono tracking-tight shadow-inner">
          ENDS IN {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="hidden md:inline text-[#d4af37] font-bold">| USE CODE: {activeCoupons[0]?.code || "ELIZA10"} FOR EXTRA {activeCoupons[0]?.discountValue || 10}% OFF</span>
      </div>


      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#041207] via-[#0a2911] to-[#041207] backdrop-blur-md border-b border-[#d4af37]/30 px-3 sm:px-6 md:px-12 py-2.5 sm:py-3.5 flex items-center justify-between shadow-xl">
        <a href="#product-buy" className="flex items-center gap-2.5 sm:gap-4 group">
          <div className="relative w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-black/40 border-2 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.5)] overflow-hidden flex items-center justify-center p-0.5 sm:p-1 shrink-0 group-hover:scale-105 transition-transform">
            <Image
              src="/assets/logo-icon.png"
              alt="Eliza Gold Emblem Icon"
              width={100}
              height={100}
              className="w-full h-full object-cover mix-blend-screen transform scale-110"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xl sm:text-2xl md:text-3xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#fff3b0] drop-shadow-md leading-none">
              Eliza Gold
            </span>
            <span className="text-[8px] sm:text-[9px] md:text-[10px] text-[#d4af37]/90 tracking-[0.2em] sm:tracking-[0.25em] font-extrabold uppercase mt-0.5 sm:mt-1">
              Roghan-e-Azam Misali
            </span>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-gray-200">
          <a href="#product-buy" className="hover:text-[#d4af37] transition-colors">Product</a>
          <a href="#benefits" className="hover:text-[#d4af37] transition-colors">Benefits</a>
          <a href="#ingredients" className="hover:text-[#d4af37] transition-colors">Ingredients</a>
          <a href="#reviews" className="hover:text-[#d4af37] transition-colors">Reviews ({reviewsList.length})</a>
          <a href="#faq" className="hover:text-[#d4af37] transition-colors">FAQ</a>
        </nav>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="relative flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#d4af37] via-[#f7e092] to-[#d4af37] text-[#051408] px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-extrabold uppercase tracking-wider hover:brightness-110 transition-all shadow-md active:scale-95"
        >
          <ShoppingBag className="w-4 h-4 text-[#051408]" />
          <span>Cart</span>
          <span className="bg-[#051408] text-[#d4af37] w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black">
            {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
          </span>
        </button>
      </header>

      <main>
        {/* MAIN PRODUCT SHOWCASE HERO SECTION */}
        <section id="product-buy" className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* GALLERY (7 COLS ON DESKTOP) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Image Frame */}
              <div className="relative aspect-[4/5] sm:aspect-square w-full rounded-2xl bg-white border border-[#e7e1d5] overflow-hidden shadow-sm group">
                {galleryImages.map((imgSrc, idx) => (
                  <Image
                    key={imgSrc}
                    src={imgSrc}
                    alt={`Roghan-e-Azam Misali Hair Oil View ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 650px"
                    quality={90}
                    priority={idx === 0}
                    className={`object-contain p-4 group-hover:scale-105 transition-all duration-200 ease-out ${
                      selectedImage === idx
                        ? "opacity-100 z-10 scale-100"
                        : "opacity-0 z-0 scale-95 pointer-events-none absolute inset-0"
                    }`}
                  />
                ))}
              </div>

              {/* Mobile Non-Overlapping Trust Badges Row */}
              <div className="flex sm:hidden items-center justify-center gap-2 pt-1">
                <span className="bg-[#0b2912] text-[#fff3b0] border border-[#d4af37]/40 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Leaf className="w-3.5 h-3.5 text-[#d4af37]" /> 100% Original Herbal
                </span>
                <span className="bg-[#0b2912] text-[#f7e092] border border-[#d4af37]/40 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#f7e092]" /> Ayurvedic Formula
                </span>
              </div>

              {/* Thumbnails Picker */}
              <div className="grid grid-cols-6 gap-2 sm:gap-3">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square rounded-xl bg-white border-2 overflow-hidden transition-all ${
                      selectedImage === idx
                        ? "border-[#0b2912] ring-2 ring-[#0b2912]/20 shadow-md scale-95"
                        : "border-[#e7e1d5] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="100px"
                      quality={70}
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>

              {/* Quick Feature Highlights Grid */}
              <div className="grid grid-cols-3 gap-3 pt-4 text-center">
                <div className="bg-white p-3 rounded-xl border border-[#e7e1d5] flex flex-col items-center">
                  <Truck className="w-5 h-5 text-[#0b2912] mb-1" />
                  <span className="text-[11px] font-bold text-gray-800">Free Express COD</span>
                  <span className="text-[9px] text-gray-500">2-3 Days Pakistan-wide</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#e7e1d5] flex flex-col items-center">
                  <RotateCcw className="w-5 h-5 text-[#0b2912] mb-1" />
                  <span className="text-[11px] font-bold text-gray-800">Money Back Guarantee</span>
                  <span className="text-[9px] text-gray-500">7 Days Return Policy</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#e7e1d5] flex flex-col items-center">
                  <ShieldCheck className="w-5 h-5 text-[#0b2912] mb-1" />
                  <span className="text-[11px] font-bold text-gray-800">Verified Quality</span>
                  <span className="text-[9px] text-gray-500">100% Chemical Free</span>
                </div>
              </div>
            </div>

            {/* BUY BOX (5 COLS ON DESKTOP) */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-6">
              
              {/* Title & Rating */}
              <div>
                <div className="hidden sm:flex items-center gap-2 mb-3">
                  <span className="bg-[#0b2912] text-[#fff3b0] border border-[#d4af37]/40 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                    <Leaf className="w-3.5 h-3.5 text-[#d4af37]" /> 100% Original Herbal
                  </span>
                  <span className="bg-[#0b2912] text-[#f7e092] border border-[#d4af37]/40 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#f7e092]" /> Ayurvedic Formula
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-700">4.9/5.0</span>
                  <a href="#reviews" className="text-xs text-[#0b2912] font-semibold underline">
                    ({reviewsList.length} verified reviews)
                  </a>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                  Roghan-e-Azam Misali Hair Oil
                </h1>
                <p className="text-sm text-gray-600 mt-1.5 font-medium">
                  100ml Original Botanical Scalp & Hair Growth Remedy
                </p>
              </div>

              {/* Stock Urgency Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-medium">
                  <Flame className="w-4 h-4 text-amber-600 animate-bounce" />
                  <span>High Demand: <b>14 items left</b> in stock today</span>
                </div>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">FAST SELLING</span>
              </div>

              {/* BUNDLE SELECTION CARDS */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Select Quantity & Save:
                </label>

                {bundleOptions.map((bundle) => {
                  const isSelected = selectedBundle.id === bundle.id;
                  return (
                    <div
                      key={bundle.id}
                      onClick={() => setSelectedBundleId(bundle.id)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#0b2912] bg-[#0b2912]/[0.03] shadow-sm"
                          : "border-[#e7e1d5] hover:border-gray-300 bg-white"
                      }`}
                    >
                      {bundle.badge && (
                        <span className="absolute -top-2.5 right-4 bg-[#d4af37] text-[#0b2912] text-[9px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                          {bundle.badge}
                        </span>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-[#0b2912] bg-[#0b2912]" : "border-gray-300"}`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">{bundle.title}</h3>
                            <p className="text-xs text-emerald-700 font-semibold">{bundle.savings}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-[#0b2912] text-lg">Rs. {bundle.price.toLocaleString()}</div>
                          <div className="text-xs text-gray-400 line-through">Rs. {bundle.originalPrice.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* QUANTITY PICKER & ACTION BUTTONS */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Qty:</span>
                  <div className="flex items-center border border-[#e7e1d5] rounded-lg bg-gray-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2.5 text-gray-600 hover:text-black transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2.5 text-gray-600 hover:text-black transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Primary Buy Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyNow}
                  className="w-full bg-[#0b2912] text-white py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#154620] transition-colors shadow-lg flex items-center justify-center gap-3"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Order Now — Cash On Delivery</span>
                </motion.button>

                <p className="text-center text-[11px] text-gray-500 font-medium flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Pay Cash when parcel arrives at your doorstep
                </p>
              </div>

              {/* Instant Benefit Bullets */}
              <div className="border-t border-[#e7e1d5] pt-4 space-y-2 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Stops severe hair fall in 14 days of regular application</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Stimulates dormant hair follicles for new baby growth</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Eradicates dry scalp dandruff & itchiness naturally</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* COMPARISON MATRIX SECTION */}
        <section id="benefits" className="bg-[#faf8f5] py-20 md:py-28 border-y border-[#e7e1d5] relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#0b2912] bg-[#0b2912]/10 px-4 py-1.5 rounded-full border border-[#0b2912]/20">
                Unmatched Quality Comparison
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-gray-900 mt-4">
                Eliza Gold <span className="text-[#d4af37]">vs</span> Ordinary Oils
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
                Most commercial hair oils rely on cheap mineral oil & synthetic fragrance. Discover why Roghan-e-Azam stands superior.
              </p>
            </div>

            {/* MOBILE COMPARISON CARDS (Visible on Mobile Screens) */}
            <div className="block sm:hidden space-y-4">
              {[
                {
                  icon: <Leaf className="w-6 h-6 text-emerald-600" />,
                  title: "100% Pure Botanical Extracts",
                  subtitle: "Cold-pressed Amla, Aloe Vera, Bhringraj, & Neem"
                },
                {
                  icon: <Ban className="w-6 h-6 text-emerald-600" />,
                  title: "Zero Mineral Oil & Paraffin",
                  subtitle: "No pores-clogging petroleum derivatives"
                },
                {
                  icon: <Zap className="w-6 h-6 text-amber-500" />,
                  title: "Proven 14-Day Hair Fall Control",
                  subtitle: "Cleanses roots & stops shedding"
                },
                {
                  icon: <Sparkles className="w-6 h-6 text-[#d4af37]" />,
                  title: "Dermatologically Safety Tested",
                  subtitle: "Safe for all scalp types & dyed hair"
                },
                {
                  icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
                  title: "7-Day Money Back Guarantee",
                  subtitle: "Full refund assurance if unsatisfied"
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-[#e7e1d5] p-4.5 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm leading-snug">{item.title}</h4>
                      <p className="text-xs text-gray-500 font-normal mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-gray-100">
                    <div className="bg-[#0b2912] text-white p-3 rounded-xl border border-[#d4af37]/40 text-center flex flex-col items-center justify-center">
                      <span className="text-[9px] text-[#d4af37] font-extrabold uppercase tracking-wider block">Eliza Gold</span>
                      <div className="flex items-center justify-center gap-1.5 mt-1 text-xs font-extrabold text-[#f7e092]">
                        <CheckCircle2 className="w-4 h-4 text-[#f7e092]" />
                        <span>Included</span>
                      </div>
                    </div>

                    <div className="bg-gray-100 text-gray-500 p-3 rounded-xl border border-gray-200 text-center flex flex-col items-center justify-center">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Ordinary Oils</span>
                      <div className="flex items-center justify-center gap-1.5 mt-1 text-xs font-bold text-red-500">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span>Missing</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP COMPARISON TABLE (Visible on Tablet & Desktop Screens) */}
            <div className="hidden sm:block overflow-x-auto pb-4">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr>
                    <th className="py-6 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest w-1/3">
                      Key Standard
                    </th>
                    <th className="py-4 px-6 w-1/3 align-bottom">
                      <div className="bg-gradient-to-b from-[#0b2912] via-[#061e0c] to-[#041207] text-white p-5 rounded-t-2xl border-t-2 border-x-2 border-[#d4af37] shadow-[0_-5px_25px_rgba(212,175,55,0.25)] text-center flex flex-col items-center">
                        {/* Gold Crown Badge */}
                        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#d4af37] via-[#f7e092] to-[#d4af37] text-[#041207] text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md border border-[#fff3b0] mb-2">
                          <Award className="w-3.5 h-3.5" />
                          <span>Winner • Best Hair Care</span>
                        </div>
                        <h3 className="font-serif font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#fff3b0]">
                          Eliza Gold Roghan-e-Azam
                        </h3>
                        <p className="text-[11px] text-emerald-200/80 font-medium mt-0.5">100% Pure Herbal Formulation</p>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-sm font-bold text-gray-400 text-center w-1/3 align-bottom">
                      <div className="bg-gray-100 p-5 rounded-t-2xl border-t border-x border-gray-200 text-center flex flex-col items-center justify-end h-full">
                        <h3 className="font-bold text-gray-500 text-base">Ordinary Market Oils</h3>
                        <p className="text-[11px] text-gray-400 font-normal mt-0.5">Synthetic & Diluted Base</p>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7e1d5] text-sm">
                  {/* Row 1 */}
                  <tr className="bg-white hover:bg-emerald-50/40 transition-colors">
                    <td className="py-5 px-6 font-bold text-gray-800 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 shrink-0">
                        <Leaf className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">100% Pure Botanical Extracts</p>
                        <p className="text-[11px] text-gray-500 font-normal">Amla, Aloe Vera, Bhringraj, Neem</p>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center bg-[#0b2912] text-white border-x-2 border-[#d4af37] shadow-sm">
                      <div className="w-9 h-9 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-[#f7e092] flex items-center justify-center mx-auto shadow-md">
                        <CheckCircle2 className="w-5 h-5 text-[#f7e092]" />
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center bg-gray-50/60 border-x border-gray-200">
                      <div className="w-9 h-9 rounded-full bg-red-50 border border-red-200 text-red-500 flex items-center justify-center mx-auto">
                        <XCircle className="w-5 h-5 text-red-500" />
                      </div>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="bg-white hover:bg-emerald-50/40 transition-colors">
                    <td className="py-5 px-6 font-bold text-gray-800 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 shrink-0">
                        <Ban className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Zero Mineral Oil & Liquid Paraffin</p>
                        <p className="text-[11px] text-gray-500 font-normal">No pores-clogging petroleum derivatives</p>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center bg-[#0b2912] text-white border-x-2 border-[#d4af37] shadow-sm">
                      <div className="w-9 h-9 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-[#f7e092] flex items-center justify-center mx-auto shadow-md">
                        <CheckCircle2 className="w-5 h-5 text-[#f7e092]" />
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center bg-gray-50/60 border-x border-gray-200 text-gray-400">
                      <div className="w-9 h-9 rounded-full bg-red-50 border border-red-200 text-red-500 flex items-center justify-center mx-auto">
                        <XCircle className="w-5 h-5 text-red-500" />
                      </div>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="bg-white hover:bg-emerald-50/40 transition-colors">
                    <td className="py-5 px-6 font-bold text-gray-800 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 shrink-0">
                        <Zap className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Proven 14-Day Hair Fall Control</p>
                        <p className="text-[11px] text-gray-500 font-normal">Cleanses roots & stops shedding</p>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center bg-[#0b2912] text-white border-x-2 border-[#d4af37] shadow-sm">
                      <div className="w-9 h-9 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-[#f7e092] flex items-center justify-center mx-auto shadow-md">
                        <CheckCircle2 className="w-5 h-5 text-[#f7e092]" />
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center bg-gray-50/60 border-x border-gray-200 text-gray-400">
                      <div className="w-9 h-9 rounded-full bg-red-50 border border-red-200 text-red-500 flex items-center justify-center mx-auto">
                        <XCircle className="w-5 h-5 text-red-500" />
                      </div>
                    </td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="bg-white hover:bg-emerald-50/40 transition-colors">
                    <td className="py-5 px-6 font-bold text-gray-800 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 shrink-0">
                        <Sparkles className="w-5 h-5 text-[#d4af37]" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Dermatologically Safety Tested</p>
                        <p className="text-[11px] text-gray-500 font-normal">Safe for all scalp types & dyed hair</p>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center bg-[#0b2912] text-white border-x-2 border-[#d4af37] shadow-sm">
                      <div className="w-9 h-9 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-[#f7e092] flex items-center justify-center mx-auto shadow-md">
                        <CheckCircle2 className="w-5 h-5 text-[#f7e092]" />
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center bg-gray-50/60 border-x border-gray-200 text-gray-400">
                      <div className="w-9 h-9 rounded-full bg-red-50 border border-red-200 text-red-500 flex items-center justify-center mx-auto">
                        <XCircle className="w-5 h-5 text-red-500" />
                      </div>
                    </td>
                  </tr>

                  {/* Row 5 */}
                  <tr className="bg-white hover:bg-emerald-50/40 transition-colors">
                    <td className="py-5 px-6 font-bold text-gray-800 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 shrink-0">
                        <ShieldCheck className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">7-Day Money Back Quality Assurance</p>
                        <p className="text-[11px] text-gray-500 font-normal">Full refund guarantee if unsatisfied</p>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center bg-[#0b2912] text-white border-x-2 border-b-2 border-[#d4af37] rounded-b-2xl shadow-xl">
                      <div className="w-9 h-9 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-[#f7e092] flex items-center justify-center mx-auto shadow-md">
                        <CheckCircle2 className="w-5 h-5 text-[#f7e092]" />
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center bg-gray-50/60 border-x border-b border-gray-200 rounded-b-2xl text-gray-400">
                      <div className="w-9 h-9 rounded-full bg-red-50 border border-red-200 text-red-500 flex items-center justify-center mx-auto">
                        <XCircle className="w-5 h-5 text-red-500" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Trust Bottom Banner CTA */}
            <div className="mt-12 bg-white border-2 border-[#d4af37]/40 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-full bg-[#0b2912] text-[#d4af37] flex items-center justify-center font-bold text-xl shrink-0">
                  👑
                </div>
                <div>
                  <h4 className="font-serif font-bold text-gray-900 text-lg">Experience Premium Pure Herbal Care</h4>
                  <p className="text-xs text-gray-600 mt-0.5">Order today with 40% OFF Flash Sale + Free Cash On Delivery across Pakistan.</p>
                </div>
              </div>
              <a
                href="#product-buy"
                className="bg-gradient-to-r from-[#d4af37] via-[#f7e092] to-[#d4af37] text-[#041207] px-6 py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shrink-0"
              >
                Buy Eliza Gold Now
              </a>
            </div>

          </div>
        </section>

        {/* MODEL SPOTLIGHT & ORGANIC NATURAL INGREDIENTS SECTION */}
        <section id="ingredients" className="py-20 md:py-28 bg-gradient-to-b from-[#041207] via-[#0b2912] to-[#041207] text-white relative overflow-hidden">
          {/* Floating Organic Accents */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/10 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 bg-[#d4af37]/20 border border-[#d4af37]/40 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#f7e092] mb-4">
                <Leaf className="w-4 h-4 text-[#d4af37]" />
                100% Organic & Cold-Pressed Botanicals
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#fff3b0]">
                Nature’s Miracle Hair Elixir
              </h2>
              <p className="text-sm sm:text-base text-emerald-100/80 mt-4 leading-relaxed">
                Formulated with handpicked organic Ayurvedic herbs, cold-pressed to preserve 100% active nutrients for long, thick, & radiant black hair.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* MODEL SPOTLIGHT SHOWCASE (FULL COLOR HIGH RES MODEL PHOTO) */}
              <div className="lg:col-span-5 relative group">
                <div className="relative rounded-3xl overflow-hidden border-2 border-[#d4af37]/60 shadow-[0_0_40px_rgba(212,175,55,0.3)] bg-black">
                  <Image
                    src="/assets/product-6.png"
                    alt="Eliza Gold Brand Ambassador Model"
                    width={700}
                    height={1000}
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Luxury Floating Glass Badges */}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-[#d4af37]/40 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg">
                    <Award className="w-4 h-4 text-[#d4af37]" />
                    <span>Official Brand Model</span>
                  </div>

                  <div className="absolute bottom-4 right-4 bg-gradient-to-r from-[#0b2912]/90 to-black/90 backdrop-blur-md border border-[#d4af37]/50 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-2xl flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#d4af37] animate-spin" />
                    <div>
                      <p className="font-extrabold text-[#f7e092] text-xs">100% Guaranteed Results</p>
                      <p className="text-[10px] text-gray-300">Shine • Thickness • Root Strength</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* GRAPHICAL INGREDIENTS BREAKDOWN GRID */}
              <div className="lg:col-span-7 space-y-6">
                <div className="border-b border-[#d4af37]/30 pb-4">
                  <h3 className="font-serif text-2xl font-bold text-[#f7e092]">Active Botanical Ingredients</h3>
                  <p className="text-xs text-emerald-200/70 mt-1">Zero mineral oil • Zero silicone • Zero artificial colors</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Ingredient 1: Amla */}
                  <div className="bg-[#0b2912]/60 backdrop-blur-md border border-[#d4af37]/30 p-5 rounded-2xl hover:border-[#d4af37] transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-xl shrink-0">
                        🟢
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base group-hover:text-[#f7e092] transition-colors">Fresh Amla (Gooseberry)</h4>
                        <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">Vitamin C Powerhouse</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Strengthens hair roots from deep inside, stops premature graying, and gives hair natural jet-black shine.
                    </p>
                  </div>

                  {/* Ingredient 2: Aloe Vera */}
                  <div className="bg-[#0b2912]/60 backdrop-blur-md border border-[#d4af37]/30 p-5 rounded-2xl hover:border-[#d4af37] transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-xl shrink-0">
                        🌵
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base group-hover:text-[#f7e092] transition-colors">Pure Organic Aloe Vera</h4>
                        <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">Scalp Hydration & Anti-Dandruff</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Locks in deep scalp moisture, cools scalp heat, and completely eliminates dry itchiness and white flakes.
                    </p>
                  </div>

                  {/* Ingredient 3: Bhringraj */}
                  <div className="bg-[#0b2912]/60 backdrop-blur-md border border-[#d4af37]/30 p-5 rounded-2xl hover:border-[#d4af37] transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-xl shrink-0">
                        🌿
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base group-hover:text-[#f7e092] transition-colors">Bhringraj (King of Herbs)</h4>
                        <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">Follicle Re-Activator</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Legendary herb that awakens dormant scalp follicles, triggering fresh new baby hair growth along thinning lines.
                    </p>
                  </div>

                  {/* Ingredient 4: Neem Leaf */}
                  <div className="bg-[#0b2912]/60 backdrop-blur-md border border-[#d4af37]/30 p-5 rounded-2xl hover:border-[#d4af37] transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-xl shrink-0">
                        🍃
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base group-hover:text-[#f7e092] transition-colors">Neem Leaf Extract</h4>
                        <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">Anti-Bacterial Scalp Shield</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Protects the scalp from fungal infections, root weakness, and daily environmental pollution damage.
                    </p>
                  </div>

                  {/* Ingredient 5: Almond & Sesame Base */}
                  <div className="sm:col-span-2 bg-[#0b2912]/60 backdrop-blur-md border border-[#d4af37]/30 p-5 rounded-2xl hover:border-[#d4af37] transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-xl shrink-0">
                        🌰
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base group-hover:text-[#f7e092] transition-colors">Cold-Pressed Almond & Sesame Carrier Base</h4>
                        <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">Deep Shaft Penetration</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Lightweight, non-sticky natural oil base enriched with Vitamin E to seal split ends and soften coarse hair textures.
                    </p>
                  </div>

                </div>

                {/* Cold Pressed Process Banner */}
                <div className="bg-gradient-to-r from-[#d4af37]/20 via-[#0b2912] to-[#d4af37]/20 border border-[#d4af37]/40 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-[#d4af37] shrink-0" />
                    <div>
                      <h5 className="font-bold text-[#f7e092] text-xs uppercase tracking-wider">Traditional Cold-Press Extraction</h5>
                      <p className="text-[11px] text-gray-300">No high-heat processing. 100% potent natural nutrients preserved.</p>
                    </div>
                  </div>
                  <a
                    href="#product-buy"
                    className="bg-[#d4af37] text-[#041207] px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider hover:bg-[#f7e092] transition-colors shrink-0"
                  >
                    Try Roghan-e-Azam
                  </a>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* 3-STEP HAIR GROWTH ROUTINE TIMELINE */}
        <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0b2912]">Proven Treatment Timeline</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-gray-900 mt-2">
              What to Expect
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[#e7e1d5] shadow-sm relative">
              <span className="text-4xl font-serif font-black text-[#d4af37]/40 absolute top-4 right-6">01</span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">Week 1 - 2</span>
              <h3 className="font-bold text-gray-900 text-xl mt-4 mb-2">Scalp Detox & Fall Reduction</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Herbal extracts deeply penetrate the roots, cleansing clogged follicles, stopping excessive hair shedding during comb/wash.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#e7e1d5] shadow-sm relative">
              <span className="text-4xl font-serif font-black text-[#d4af37]/40 absolute top-4 right-6">02</span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">Week 3 - 4</span>
              <h3 className="font-bold text-gray-900 text-xl mt-4 mb-2">Dandruff & Repair</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Scalp flakiness and dryness are eliminated. Hair strands become softer, silkier, and noticeably shinier.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#e7e1d5] shadow-sm relative">
              <span className="text-4xl font-serif font-black text-[#d4af37]/40 absolute top-4 right-6">03</span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">Week 6+</span>
              <h3 className="font-bold text-gray-900 text-xl mt-4 mb-2">New Hair Growth</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Dormant roots re-activate, showing visible new baby hair growth along hairline and thinner scalp areas.
              </p>
            </div>
          </div>
        </section>

        {/* VERIFIED REVIEWS SECTION */}
        <section id="reviews" className="bg-white py-16 md:py-24 border-t border-[#e7e1d5]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            
            {/* Header & Write Review Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#0b2912]">Real Customers, Real Results</span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-1">Verified Customer Reviews</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-800">4.9 out of 5</span>
                  <span className="text-sm text-gray-500">({reviewsList.length} total reviews)</span>
                </div>
              </div>

              <button
                onClick={() => setReviewModalOpen(true)}
                className="bg-[#0b2912] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1a4422] transition-colors"
              >
                Write A Review
              </button>
            </div>

            {/* Reviews Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="bg-[#faf8f5] p-6 rounded-2xl border border-[#e7e1d5] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-[#0b2912] text-white font-bold flex items-center justify-center text-sm">
                        {rev.name ? rev.name[0] : "U"}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                          {rev.name}
                          {rev.verified && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Buyer
                            </span>
                          )}
                        </h4>
                        <span className="text-xs text-gray-500">{rev.city}, Pakistan • {rev.date}</span>
                      </div>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(Math.max(0, Math.min(5, Number(rev.rating) || 5)))].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>

                  <h5 className="font-bold text-gray-900 text-base">{rev.title}</h5>
                  <p className="text-sm text-gray-600 font-normal leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section id="faq" className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0b2912]">Got Questions?</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-1">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How to use Roghan-e-Azam Misali Hair Oil?",
                a: "Apply 10-15ml oil directly onto scalp roots using fingertips. Massage gently in circular motions for 5-10 minutes. Leave for minimum 2 hours (or overnight) before washing with a mild shampoo."
              },
              {
                q: "Is Cash on Delivery available across Pakistan?",
                a: "Yes! We offer 100% Cash on Delivery all over Pakistan including Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, Multan, Faisalabad, Quetta, and all smaller cities and villages."
              },
              {
                q: "Can both Men and Women use this hair oil?",
                a: "Yes, Roghan-e-Azam is 100% suitable and effective for both men and women (ages 12 to 65+). It works equally great for hair fall, beard growth, and scalp nourish."
              },
              {
                q: "What are the shipping charges?",
                a: "Delivery is completely FREE on all 2-Bottle and 3-Bottle order packs! For single bottle orders, standard shipping is Rs. 150."
              }
            ].map((faq, i) => (
              <details key={i} className="bg-white border border-[#e7e1d5] rounded-xl p-5 group [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-gray-900 text-base">
                  <span>{faq.q}</span>
                  <span className="text-[#0b2912] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed font-normal pt-2 border-t border-gray-100">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gradient-to-b from-[#041207] via-[#0b2912] to-[#041207] text-white pt-16 pb-12 px-6 border-t border-[#d4af37]/30 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#d4af37]/20 relative z-10 text-sm">
          
          {/* Col 1: Brand Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <a href="#product-buy" className="flex items-center gap-3 group inline-flex">
              <div className="relative w-12 h-12 rounded-full bg-black/40 border-2 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)] overflow-hidden flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                <Image
                  src="/assets/logo-icon.png"
                  alt="Eliza Gold Emblem Icon"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover mix-blend-screen transform scale-110"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#fff3b0] leading-none">
                  Eliza Gold
                </span>
                <span className="text-[9px] text-[#d4af37]/90 tracking-[0.2em] font-extrabold uppercase mt-1">
                  Roghan-e-Azam Misali
                </span>
              </div>
            </a>

            <p className="text-xs text-gray-300 font-normal leading-relaxed">
              Pakistan&apos;s premier 100% organic hair care brand. Empowering natural hair growth, scalp repair, & long-lasting shine through cold-pressed Ayurvedic botanicals.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="bg-[#0b2912] border border-[#d4af37]/40 px-2.5 py-1 rounded-full text-[#f7e092] font-semibold">🌿 100% Organic</span>
              <span className="bg-[#0b2912] border border-[#d4af37]/40 px-2.5 py-1 rounded-full text-[#f7e092] font-semibold">🇵🇰 Pakistan COD</span>
              <span className="bg-[#0b2912] border border-[#d4af37]/40 px-2.5 py-1 rounded-full text-[#f7e092] font-semibold">🛡️ 7-Day Guarantee</span>
            </div>
          </div>

          {/* Col 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif font-bold text-[#f7e092] text-sm uppercase tracking-wider border-b border-[#d4af37]/20 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><a href="#product-buy" className="hover:text-[#d4af37] transition-colors">Order Now</a></li>
              <li><Link href="/shipping-policy" className="hover:text-[#d4af37] transition-colors">Shipping Policy</Link></li>
              <li><Link href="/return-policy" className="hover:text-[#d4af37] transition-colors">Return Policy</Link></li>
              <li><Link href="/contact" className="hover:text-[#d4af37] transition-colors">Contact Support</Link></li>
              <li><a href="#faq" className="hover:text-[#d4af37] transition-colors">Frequently Asked Questions</a></li>
            </ul>
          </div>

          {/* Col 3: Customer Care (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-[#f7e092] text-sm uppercase tracking-wider border-b border-[#d4af37]/20 pb-2">
              Customer Support
            </h4>
            <div className="space-y-2 text-xs text-gray-300">
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-emerald-400 font-bold hover:underline bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-lg"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp: +92 328 7657890</span>
              </a>
              <p className="text-gray-300"><strong>Email:</strong> support@elizagold.pk</p>
              <p className="text-gray-300"><strong>Operating Hours:</strong> Mon – Sat (9:00 AM – 9:00 PM PKT)</p>
              <p className="text-gray-400 text-[11px] pt-1">Dispatch Hubs: Lahore, Karachi, & Islamabad</p>
            </div>
          </div>

          {/* Col 4: Express Delivery & Partners (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-[#f7e092] text-sm uppercase tracking-wider border-b border-[#d4af37]/20 pb-2">
              Express Delivery & COD
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Fast 2 to 3 Days Express Courier Shipping across all cities & villages of Pakistan. Pay Cash directly to courier upon arrival.
            </p>
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Official Courier Partners:</span>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="bg-black/50 border border-white/10 text-white px-2.5 py-1 rounded text-[11px] font-extrabold tracking-wider">TCS</span>
                <span className="bg-black/50 border border-white/10 text-white px-2.5 py-1 rounded text-[11px] font-extrabold tracking-wider">LEOPARDS</span>
                <span className="bg-black/50 border border-white/10 text-white px-2.5 py-1 rounded text-[11px] font-extrabold tracking-wider">M&P</span>
                <span className="bg-black/50 border border-white/10 text-white px-2.5 py-1 rounded text-[11px] font-extrabold tracking-wider">TRAX</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 relative z-10">
          <p>© {new Date().getFullYear()} Eliza Gold Pakistan. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-400 text-[11px]">
            <Link href="/privacy-policy" className="hover:text-[#d4af37] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms-of-service" className="hover:text-[#d4af37] transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="/return-policy" className="hover:text-[#d4af37] transition-colors">Return Policy</Link>
            <span>•</span>
            <Link href="/shipping-policy" className="hover:text-[#d4af37] transition-colors">Shipping Policy</Link>
          </div>
        </div>
      </footer>

      {/* SLIDE-OUT CART & COD CHECKOUT DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#faf8f5] shadow-2xl z-[101] flex flex-col max-h-screen"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-[#e7e1d5] bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#0b2912]" />
                  <h2 className="font-serif font-bold text-lg text-gray-900">Your Cart & COD Checkout</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <ShoppingBag className="w-14 h-14 text-gray-300 mx-auto" />
                  <p className="text-sm font-semibold text-gray-600">Your cart is currently empty</p>
                  <button
                    type="button"
                    onClick={() => handleAddToCart()}
                    className="bg-[#0b2912] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#154620] transition-colors"
                  >
                    Add 2 Bottles (Popular Pack)
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(handleCheckoutSubmit)} className="flex flex-col flex-1 overflow-hidden">
                  {/* Drawer Scrollable Body */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
                    
                    {/* FREE SHIPPING PROGRESS BAR */}
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs">
                      <div className="flex justify-between font-bold text-emerald-900 mb-1.5">
                        <span>{isFreeDelivery ? "You unlocked FREE Delivery!" : "Switch to a 2-Bottle Pack or larger for FREE Delivery"}</span>
                        <span>{isFreeDelivery ? "100%" : "50%"}</span>
                      </div>
                      <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full transition-all duration-500"
                          style={{ width: isFreeDelivery ? "100%" : "50%" }}
                        />
                      </div>
                    </div>

                    {/* CART ITEM SHOWCASE */}
                    <div className="bg-white p-4 rounded-xl border border-[#e7e1d5] flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 bg-[#faf8f5] rounded-lg border border-[#e7e1d5] overflow-hidden shrink-0">
                          <Image src={cartItems[0].image} alt="Cart product" fill sizes="64px" quality={80} className="object-contain p-1" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{cartItems[0].name}</h4>
                          <span className="text-xs text-gray-500 font-medium">{cartItems[0].bundleTitle}</span>
                          <div className="font-bold text-[#0b2912] text-sm mt-1">Rs. {cartItems[0].price.toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Qty controller */}
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                        <button type="button" onClick={() => updateCartQty(-1)} className="p-1.5 text-gray-600 hover:text-black">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-bold text-xs">{cartItems[0].quantity}</span>
                        <button type="button" onClick={() => updateCartQty(1)} className="p-1.5 text-gray-600 hover:text-black">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* COUPON CODE FORM */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon Code (e.g. ELIZA10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white uppercase font-bold outline-none focus:border-[#0b2912]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {discountApplied && (
                      <p className="text-xs font-bold text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {discountPercent}% Discount Applied Successfully!</p>
                    )}

                    {/* COD SHIPPING ADDRESS FORM */}
                    <div className="bg-white p-4 rounded-xl border-2 border-[#0b2912]/20 space-y-4 shadow-sm">
                      <div className="bg-[#0b2912]/5 -mx-4 -mt-4 p-3 border-b border-[#0b2912]/10 rounded-t-xl flex items-center justify-between">
                        <h3 className="font-bold text-[#0b2912] text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-[#0b2912]" /> Shipping Address (Cash On Delivery)
                        </h3>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Required</span>
                      </div>

                      <div className="space-y-3.5 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...register("fullName", { required: "Full name is required" })}
                            type="text"
                            placeholder="e.g. Mohammad Ali"
                            className="w-full px-3.5 py-2.5 text-sm border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-[#0b2912] focus:ring-2 focus:ring-[#0b2912]/20 transition-all font-medium"
                          />
                          {errors.fullName && <span className="text-xs text-red-600 font-bold mt-1 block">⚠ Full name is required</span>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">
                            Mobile Phone Number (For Courier SMS) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            {...register("phone", {
                              required: "Mobile phone is required",
                              validate: (value) => {
                                const cleaned = String(value).replace(/[\s-]/g, "");
                                return /^(?:\+92|0092|0)3\d{9}$/.test(cleaned) || "Enter a valid Pakistani mobile number (e.g. 03001234567)";
                              }
                            })}
                            placeholder="03001234567"
                            className="w-full px-3.5 py-2.5 text-sm border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-[#0b2912] focus:ring-2 focus:ring-[#0b2912]/20 transition-all font-medium"
                          />
                          {errors.phone && <span className="text-xs text-red-600 font-bold mt-1 block">⚠ {String(errors.phone.message || "Valid phone number required")}</span>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">
                            City <span className="text-red-500">*</span>
                          </label>
                          <select
                            {...register("city", { required: "City is required" })}
                            className="w-full px-3.5 py-2.5 text-sm border-2 border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-[#0b2912] focus:ring-2 focus:ring-[#0b2912]/20 transition-all font-medium"
                          >
                            <option value="">Select your city...</option>
                            {PAKISTAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          {errors.city && <span className="text-xs text-red-600 font-bold mt-1 block">⚠ City is required</span>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">
                            Full Delivery Street Address <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={2}
                            {...register("address", { required: "Address is required" })}
                            placeholder="House / Flat No., Street, Sector or Area Name"
                            className="w-full px-3.5 py-2.5 text-sm border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-[#0b2912] focus:ring-2 focus:ring-[#0b2912]/20 transition-all resize-none font-medium"
                          />
                          {errors.address && <span className="text-xs text-red-600 font-bold mt-1 block">⚠ Address is required</span>}
                        </div>
                      </div>
                    </div>

                    {/* FINANCIAL SUMMARY */}
                    <div className="bg-white p-4 rounded-xl border border-[#e7e1d5] space-y-2 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Items Subtotal</span>
                        <span>Rs. {subtotal.toLocaleString()}</span>
                      </div>
                      {discountApplied && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>Discount ({discountPercent}% OFF)</span>
                          <span>- Rs. {currentDiscount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping Fee</span>
                        {isFreeDelivery ? (
                          <span className="text-emerald-700 font-bold">FREE (COD)</span>
                        ) : (
                          <span className="font-bold text-gray-900">Rs. {shippingFee.toLocaleString()}</span>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-2 flex justify-between items-center text-sm font-bold text-gray-900">
                        <span>Total Payable (Cash On Delivery)</span>
                        <span className="text-base text-[#0b2912]">Rs. {grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Drawer Sticky Footer CTA */}
                  <div className="p-4 sm:p-5 border-t border-[#e7e1d5] bg-white shrink-0 shadow-lg">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#0b2912] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#154620] transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span>Processing Order...</span>
                      ) : (
                        <>
                          <span>Complete Order — Rs. {grandTotal.toLocaleString()}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>

                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi%20Eliza%20Gold,%20I%20want%20to%20order%20${encodeURIComponent(cartItems[0]?.bundleTitle || "Roghan-e-Azam Hair Oil")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full mt-2.5 bg-[#25D366] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#1ebd59] transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" /> Fast Order via WhatsApp
                    </a>
                  </div>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ORDER CONFIRMATION RECEIPT MODAL */}
      <AnimatePresence>
        {orderConfirmed && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-8 space-y-6 shadow-2xl relative border border-[#e7e1d5] my-auto"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-gray-900">Order Placed Successfully!</h2>
                <p className="text-xs text-gray-500 font-medium">Thank you for choosing Eliza Gold Pakistan</p>
              </div>

              <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e7e1d5] text-xs space-y-2">
                <div className="flex justify-between font-bold text-gray-900 border-b border-gray-200 pb-2">
                  <span>Order Tracking No:</span>
                  <span className="text-[#0b2912] font-mono">{orderConfirmed.orderId}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Customer Name:</span>
                  <span className="font-semibold text-gray-900">{orderConfirmed.customer.fullName}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phone Number:</span>
                  <span className="font-semibold text-gray-900">{orderConfirmed.customer.phone}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>City / Address:</span>
                  <span className="font-semibold text-gray-900">{orderConfirmed.customer.city}, {orderConfirmed.customer.address}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Payment Method:</span>
                  <span className="font-semibold text-emerald-700">Cash On Delivery (COD)</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Delivery:</span>
                  <span className="font-semibold text-gray-900">{orderConfirmed.estimatedDelivery}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#0b2912] border-t border-gray-200 pt-2">
                  <span>Total Amount to Pay Rider:</span>
                  <span>Rs. {orderConfirmed.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi%20Eliza%20Gold,%20I%20just%20placed%20order%20${orderConfirmed.orderId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#20ba5a] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> Track Order via WhatsApp
                </a>

                <button
                  onClick={() => setOrderConfirmed(null)}
                  className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WRITE A REVIEW MODAL */}
      <AnimatePresence>
        {reviewModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl relative border border-[#e7e1d5]"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-serif font-bold text-lg text-gray-900">Write Customer Review</h3>
                <button onClick={() => setReviewModalOpen(false)} className="text-gray-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview(handleReviewSubmit)} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Your Name</label>
                  <input
                    {...registerReview("name", { required: true })}
                    placeholder="e.g. Saima Tariq"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#0b2912]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Your City</label>
                  <input
                    {...registerReview("city", { required: true })}
                    placeholder="e.g. Lahore"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#0b2912]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Rating</label>
                  <select
                    {...registerReview("rating")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#0b2912]"
                  >
                    <option value="5">★★★★★ 5 Stars (Excellent)</option>
                    <option value="4">★★★★☆ 4 Stars (Good)</option>
                    <option value="3">★★★☆☆ 3 Stars (Average)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Review Title</label>
                  <input
                    {...registerReview("title", { required: true })}
                    placeholder="e.g. Amazing results!"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#0b2912]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Detailed Review</label>
                  <textarea
                    rows={3}
                    {...registerReview("comment", { required: true })}
                    placeholder="Share your experience using Roghan-e-Azam..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#0b2912] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0b2912] text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-[#164420]"
                >
                  Submit Review
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-30 bg-[#25D366] text-white p-3.5 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 font-bold text-xs"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">WhatsApp Order</span>
      </a>

      {/* STICKY MOBILE ORDER BAR */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-[#041207]/95 backdrop-blur-lg border-t border-[#d4af37]/40 p-3 sm:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.5)] flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Eliza Gold Hair Oil</span>
              <span className="text-sm font-extrabold text-[#f7e092]">Rs. {selectedBundle.price.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 line-through ml-1.5">Rs. {selectedBundle.originalPrice.toLocaleString()}</span>
            </div>
            <button
              onClick={() => handleBuyNow()}
              className="bg-gradient-to-r from-[#d4af37] via-[#f7e092] to-[#d4af37] text-[#041207] px-4 py-2.5 rounded-full font-black text-xs uppercase tracking-wider shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#041207]" />
              <span>Order Now</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REAL-TIME SOCIAL PROOF ORDER TOAST */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="fixed bottom-20 sm:bottom-6 left-4 z-30 bg-white border-2 border-[#d4af37]/40 p-3.5 rounded-2xl shadow-2xl max-w-xs hidden sm:flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-[#0b2912] text-[#d4af37] flex items-center justify-center font-bold text-xs shrink-0">
              🛍️
            </div>
            <div className="text-xs">
              <p className="font-bold text-gray-900 leading-tight">
                {SOCIAL_PROOF_TOASTS[activeToastIndex].name} <span className="font-normal text-gray-500">from {SOCIAL_PROOF_TOASTS[activeToastIndex].city}</span>
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                Ordered {SOCIAL_PROOF_TOASTS[activeToastIndex].item}
              </p>
              <span className="text-[9px] text-gray-400 font-medium block mt-0.5">
                Verified Purchase • {SOCIAL_PROOF_TOASTS[activeToastIndex].time}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
