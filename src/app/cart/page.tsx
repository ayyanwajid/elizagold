"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  MessageCircle,
} from "lucide-react";
import { useCart, BundleOption } from "@/context/CartContext";
import { trackAddToCart } from "@/lib/tracking";

export default function CartPage() {
  const {
    cartItems,
    bundles,
    addToCart,
    updateQuantity,
    couponCode,
    discountPercent,
    applyCoupon,
    removeCoupon,
    subtotal,
    shippingFee,
    currentDiscount,
    grandTotal,
    isFreeDelivery,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const currentItem = cartItems[0];

  // Track AddToCart cleanly on cart page view & package switch
  useEffect(() => {
    if (currentItem) {
      trackAddToCart(
        currentItem.bundleTitle,
        currentItem.price,
        currentItem.quantity,
        currentItem.bottles || 1,
        currentItem.id
      );
    }
  }, [currentItem]);

  const handleSelectBundle = (bundle: BundleOption) => {
    const qty = currentItem?.quantity || 1;
    addToCart(bundle, qty);
    trackAddToCart(bundle.title, bundle.price, qty, bundle.bottles, bundle.id);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = applyCoupon(inputCoupon);
    setCouponFeedback(res);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-gray-800 font-sans selection:bg-[#d4af37] selection:text-black">
      {/* TOP URGENCY / ANNOUNCEMENT BAR */}
      <div className="bg-[#0b2912] text-[#fff3b0] text-[11px] sm:text-xs py-2 px-4 text-center tracking-wider font-semibold border-b border-[#d4af37]/30 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
        <span>SPECIAL OFFER: Free Express Delivery on 2+ Bottles across Pakistan!</span>
      </div>

      {/* HEADER */}
      <header className="bg-gradient-to-r from-[#041207] via-[#0b2912] to-[#041207] text-white border-b border-[#d4af37]/30 sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full border border-[#d4af37] bg-black/40 overflow-hidden flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
              <Image
                src="/assets/logo-icon.webp"
                alt="Eliza Gold"
                width={36}
                height={36}
                className="w-full h-full object-cover mix-blend-screen"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#fff3b0]">
                Eliza Gold
              </span>
              <span className="text-[8px] text-[#d4af37]/90 tracking-widest uppercase font-bold -mt-0.5">
                Roghan-e-Azam Misali
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-200 hover:text-[#d4af37] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
          </Link>
        </div>
      </header>

      {/* STEP PROGRESS BAR */}
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center justify-between max-w-md mx-auto text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5 text-[#0b2912]">
            <span className="w-6 h-6 rounded-full bg-[#0b2912] text-[#fff3b0] flex items-center justify-center text-[11px] shadow-sm">
              1
            </span>
            <span>Your Cart</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-gray-300"></div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[11px]">
              2
            </span>
            <span>Checkout</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-gray-300"></div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[11px]">
              3
            </span>
            <span>Confirmation</span>
          </div>
        </div>
      </div>

      {/* MAIN CART CONTENT */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20">
        <div className="mb-6 text-center sm:text-left">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Review Your Hair Care Package
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            100% Cash on Delivery across Pakistan. Pay only when you inspect the parcel.
          </p>
        </div>

        {/* FREE DELIVERY ALERT / STATUS */}
        <div
          className={`mb-6 p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
            !isFreeDelivery
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          }`}
        >
          <Truck className={`w-5 h-5 flex-shrink-0 ${!isFreeDelivery ? "text-amber-600" : "text-emerald-600"}`} />
          <div className="text-xs sm:text-sm flex-1">
            {!isFreeDelivery ? (
              <span>
                <strong>Tip:</strong> Upgrade to the <strong>2 or 3 Bottle Pack</strong> to unlock{" "}
                <strong className="text-emerald-700">100% FREE Express Delivery</strong>!
              </span>
            ) : (
              <span>
                🎉 <strong>Congratulations!</strong> You have unlocked{" "}
                <strong className="text-emerald-700">100% FREE Express Courier Shipping</strong> anywhere in Pakistan!
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: CART ITEMS & BUNDLE SELECTOR (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* ACTIVE ITEM CARD */}
            {currentItem ? (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-[#0b2912]/5 border border-gray-200 overflow-hidden flex-shrink-0 p-1 flex items-center justify-center">
                    <Image
                      src={currentItem.image || "/assets/product-1.webp"}
                      alt={currentItem.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#b38a16] bg-[#d4af37]/10 px-2 py-0.5 rounded-full inline-block mb-1">
                      Pure Ayurvedic Formula
                    </span>
                    <h2 className="font-serif font-bold text-base sm:text-lg text-gray-900 leading-snug">
                      {currentItem.name}
                    </h2>
                    <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                      Selected: {currentItem.bundleTitle}
                    </p>

                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-lg font-bold text-gray-900">
                        Rs. {(currentItem.price * currentItem.quantity).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        Rs. {(currentItem.originalPrice * currentItem.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* QUANTITY CONTROL */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Quantity:</span>
                  <div className="flex items-center gap-3 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                    <button
                      type="button"
                      onClick={() => updateQuantity(currentItem.id, -1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-gray-900 min-w-[20px] text-center">
                      {currentItem.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(currentItem.id, 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                <p className="text-gray-600 mb-4 text-sm">Your cart is empty.</p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-[#0b2912] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#13421e] transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Browse Packages
                </Link>
              </div>
            )}

            {/* SWITCH BUNDLE OPTIONS IN-CART */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Switch Package & Save More:
              </h3>
              <div className="space-y-2.5">
                {bundles.map((b) => {
                  const isSelected = currentItem?.id === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => handleSelectBundle(b)}
                      className={`cursor-pointer p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-[#d4af37] bg-[#d4af37]/5 shadow-sm ring-1 ring-[#d4af37]"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-[#0b2912] bg-[#0b2912]" : "border-gray-300"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900">{b.title}</span>
                            {b.badge && (
                              <span className="bg-[#0b2912] text-[#fff3b0] text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                                {b.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-emerald-700 font-medium">{b.savings}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">
                          Rs. {b.price.toLocaleString()}
                        </span>
                        <div className="text-[10px] text-gray-400 line-through">
                          Rs. {b.originalPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TRUST GUARANTEES */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-gray-200 text-center flex flex-col items-center">
                <Truck className="w-5 h-5 text-[#0b2912] mb-1" />
                <span className="text-[11px] font-bold text-gray-900">Express COD</span>
                <span className="text-[9px] text-gray-500">2-3 Business Days</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-200 text-center flex flex-col items-center">
                <RotateCcw className="w-5 h-5 text-[#0b2912] mb-1" />
                <span className="text-[11px] font-bold text-gray-900">7-Day Guarantee</span>
                <span className="text-[9px] text-gray-500">Hassle-Free Return</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-200 text-center flex flex-col items-center">
                <ShieldCheck className="w-5 h-5 text-[#0b2912] mb-1" />
                <span className="text-[11px] font-bold text-gray-900">Open Parcel</span>
                <span className="text-[9px] text-gray-500">Verify Before Pay</span>
              </div>
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY & CHECKOUT BUTTON (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
              <h2 className="font-serif font-bold text-lg text-gray-900 border-b border-gray-100 pb-3">
                Order Summary
              </h2>

              {/* COUPON SECTION */}
              <div>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      placeholder="Promo / Coupon Code"
                      className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#0b2912]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-black transition-all"
                  >
                    Apply
                  </button>
                </form>

                {couponFeedback && (
                  <p
                    className={`text-[11px] mt-1.5 flex items-center gap-1 ${
                      couponFeedback.success ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {couponFeedback.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    {couponFeedback.message}
                  </p>
                )}

                {discountPercent > 0 && (
                  <div className="mt-2 flex items-center justify-between bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <span>Discount Code ({couponCode})</span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-red-600 text-[11px] underline hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* LINE ITEMS */}
              <div className="space-y-2.5 text-xs text-gray-600 border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">Rs. {subtotal.toLocaleString()}</span>
                </div>

                {currentDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount ({discountPercent}%)</span>
                    <span>- Rs. {currentDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Courier Delivery Fee</span>
                  <span className="font-semibold">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase">FREE</span>
                    ) : (
                      `Rs. ${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="font-bold text-[#0b2912]">Cash On Delivery (COD)</span>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-900">Total Payable Amount:</span>
                  <span className="text-xl sm:text-2xl font-black text-gray-900">
                    Rs. {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* PROCEED TO CHECKOUT BUTTON */}
              <Link
                href="/checkout"
                className="w-full bg-gradient-to-r from-[#d4af37] via-[#f7e092] to-[#d4af37] text-[#051408] py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider hover:brightness-105 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2 group text-center"
              >
                <span>Proceed to Cash on Delivery</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="text-center">
                <p className="text-[11px] text-gray-500">
                  🔒 No credit card required. Pay cash directly to the courier upon delivery.
                </p>
              </div>

              {/* WHATSAPP QUICK HELP */}
              <div className="pt-2 text-center">
                <a
                  href="https://wa.me/923287657890?text=Hi%20Eliza%20Gold%2C%20I%20have%20a%20question%20about%20my%20order"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold hover:underline"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Order via WhatsApp instead? Click here
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
