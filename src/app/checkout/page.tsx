"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, FieldValues } from "react-hook-form";
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCart } from "@/context/CartContext";
import { trackInitiateCheckout } from "@/lib/tracking";

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
  "Sheikhupura",
  "Jhelum",
  "Mardan",
  "Gujrat",
  "Kasur",
  "Rahim Yar Khan",
  "Sahiwal",
  "Okara",
  "Wah Cantt",
  "Other City",
];

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems,
    subtotal,
    shippingFee,
    currentDiscount,
    discountPercent,
    grandTotal,
    clearCart,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Lahore");
  const [otherCityName, setOtherCityName] = useState("");

  const createOrderMutation = useMutation(api.orders.createOrder);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
      city: "Lahore",
      notes: "",
    },
  });

  const currentItem = cartItems[0];

  // Track InitiateCheckout with chosen package details
  useEffect(() => {
    if (cartItems.length > 0 && currentItem) {
      trackInitiateCheckout(grandTotal, currentItem);
    }
  }, [cartItems, grandTotal, currentItem]);

  const onSubmit = async (data: FieldValues) => {
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please select a package.");
      router.push("/cart");
      return;
    }

    setIsSubmitting(true);
    const finalCity = selectedCity === "Other City" ? (otherCityName || "Pakistan") : selectedCity;
    const generatedOrderId = `EG-${Math.floor(10000 + Math.random() * 90000)}`;

    const orderPayload = {
      orderId: generatedOrderId,
      customer: {
        fullName: String(data.fullName || "").trim(),
        phone: String(data.phone || "").trim(),
        city: finalCity,
        address: String(data.address || "").trim(),
      },
      items: cartItems.map((it) => ({
        id: it.id,
        name: it.name,
        bundleTitle: it.bundleTitle,
        quantity: it.quantity,
        price: it.price,
        originalPrice: it.originalPrice,
        image: it.image || "/assets/product-1.webp",
      })),
      addMassager: false,
      total: grandTotal,
      status: "Pending",
      date: new Date().toLocaleDateString("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      estimatedDelivery: "2 to 3 Business Days",
      adminNotes: data.notes ? String(data.notes).trim() : undefined,
    };

    // 1. Save fallback to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem("eliza_orders_list") || "[]");
      localStorage.setItem("eliza_orders_list", JSON.stringify([orderPayload, ...existing]));
    } catch {
      // ignore
    }

    // 2. Save active order for the confirmation page
    try {
      sessionStorage.setItem("eliza_last_order", JSON.stringify({ ...orderPayload, items: cartItems }));
    } catch {
      // ignore
    }

    // 3. Mutate live in Convex
    try {
      if (createOrderMutation) {
        await createOrderMutation(orderPayload);
      }
    } catch (err) {
      console.warn("Convex order submission offline/fallback:", err);
    }

    // 4. Clear cart and redirect to dedicated confirmation page
    clearCart();
    setIsSubmitting(false);
    router.push(`/order-confirmation?order_id=${generatedOrderId}`);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-gray-800 font-sans selection:bg-[#d4af37] selection:text-black">
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
                Cash On Delivery Checkout
              </span>
            </div>
          </Link>

          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-200 hover:text-[#d4af37] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </Link>
        </div>
      </header>

      {/* FUNNEL STEP INDICATOR */}
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center justify-between max-w-md mx-auto text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Cart</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-emerald-600"></div>
          <div className="flex items-center gap-1.5 text-[#0b2912]">
            <span className="w-6 h-6 rounded-full bg-[#0b2912] text-[#fff3b0] flex items-center justify-center text-[11px] shadow-sm">
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

      {/* CHECKOUT BODY */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20">
        <div className="mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Shipping & Cash on Delivery Details
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Please enter your correct delivery address. You pay cash to the rider upon parcel arrival.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT: SHIPPING FORM (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="font-serif font-bold text-base sm:text-lg text-gray-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#0b2912]" /> Customer & Delivery Info
                  </h2>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                    100% Cash on Delivery
                  </span>
                </div>

                {/* FULL NAME */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("fullName", { required: "Please enter your full name" })}
                    placeholder="e.g. Muhammad Ali"
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0b2912] ${
                      errors.fullName ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-[11px] mt-1">{String(errors.fullName.message)}</p>
                  )}
                </div>

                {/* PHONE NUMBER */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    WhatsApp / Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    {...register("phone", {
                      required: "Please provide a valid active phone number for courier updates",
                      minLength: { value: 10, message: "Phone number should be at least 10 digits" },
                    })}
                    placeholder="0300 1234567"
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0b2912] ${
                      errors.phone ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-[11px] mt-1">{String(errors.phone.message)}</p>
                  )}
                  <p className="text-[11px] text-gray-500 mt-1">
                    The courier rider will call/SMS this number before delivery.
                  </p>
                </div>

                {/* CITY SELECTION */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0b2912] bg-white"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  {selectedCity === "Other City" && (
                    <div className="mt-2.5">
                      <input
                        type="text"
                        value={otherCityName}
                        onChange={(e) => setOtherCityName(e.target.value)}
                        placeholder="Enter your town or city name"
                        required
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0b2912]"
                      />
                    </div>
                  )}
                </div>

                {/* DELIVERY ADDRESS */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Complete Street Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    {...register("address", {
                      required: "Please provide complete house/street address for accurate delivery",
                    })}
                    placeholder="House / Flat #, Street #, Sector / Area, Landmark..."
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0b2912] ${
                      errors.address ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-[11px] mt-1">{String(errors.address.message)}</p>
                  )}
                </div>

                {/* OPTIONAL NOTES */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Special Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    {...register("notes")}
                    placeholder="e.g. Call before arrival, deliver after 2 PM"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0b2912]"
                  />
                </div>
              </div>

              {/* PAYMENT METHOD SELECTION CARD */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-300 bg-emerald-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-emerald-700 flex items-center justify-center bg-emerald-700">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">
                        Cash On Delivery (COD)
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Pay cash directly to the courier rider upon delivery. No advance payment required.
                    </p>
                  </div>
                </div>
              </div>

              {/* TRUST BADGES */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-xl border border-gray-200 text-center flex flex-col items-center">
                  <Truck className="w-5 h-5 text-[#0b2912] mb-1" />
                  <span className="text-[11px] font-bold text-gray-900">2-3 Days</span>
                  <span className="text-[9px] text-gray-500">Fast Express Delivery</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200 text-center flex flex-col items-center">
                  <RotateCcw className="w-5 h-5 text-[#0b2912] mb-1" />
                  <span className="text-[11px] font-bold text-gray-900">7-Day Guarantee</span>
                  <span className="text-[9px] text-gray-500">100% Satisfaction</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200 text-center flex flex-col items-center">
                  <ShieldCheck className="w-5 h-5 text-[#0b2912] mb-1" />
                  <span className="text-[11px] font-bold text-gray-900">Open Parcel</span>
                  <span className="text-[9px] text-gray-500">Check Before Pay</span>
                </div>
              </div>
            </div>

            {/* RIGHT: ORDER REVIEW & CONFIRM BUTTON (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="font-serif font-bold text-base sm:text-lg text-gray-900">
                    Order Summary
                  </h2>
                  <Link
                    href="/cart"
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Edit
                  </Link>
                </div>

                {/* SELECTED ITEM DETAILS */}
                {currentItem && (
                  <div className="flex gap-3 items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 p-1 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={currentItem.image || "/assets/product-1.webp"}
                        alt={currentItem.name}
                        width={60}
                        height={60}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-bold text-xs sm:text-sm text-gray-900 truncate">
                        {currentItem.name}
                      </h3>
                      <p className="text-[11px] text-emerald-800 font-semibold">
                        {currentItem.bundleTitle}
                      </p>
                      <div className="flex justify-between items-baseline mt-1">
                        <span className="text-[11px] text-gray-500">Qty: {currentItem.quantity}</span>
                        <span className="text-xs font-bold text-gray-900">
                          Rs. {(currentItem.price * currentItem.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* PRICE BREAKDOWN */}
                <div className="space-y-2.5 text-xs text-gray-600 border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">Rs. {subtotal.toLocaleString()}</span>
                  </div>

                  {currentDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount Voucher ({discountPercent}%)</span>
                      <span>- Rs. {currentDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span className="font-semibold">
                      {shippingFee === 0 ? (
                        <span className="text-emerald-700 font-bold uppercase">FREE</span>
                      ) : (
                        `Rs. ${shippingFee}`
                      )}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-gray-900">Total Cash on Delivery:</span>
                    <span className="text-xl sm:text-2xl font-black text-gray-900">
                      Rs. {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#d4af37] via-[#f7e092] to-[#d4af37] text-[#051408] py-4 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider hover:brightness-105 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#051408] border-t-transparent rounded-full animate-spin" />
                      <span>Confirming Order...</span>
                    </div>
                  ) : (
                    <span>Confirm Cash on Delivery Order →</span>
                  )}
                </button>

                <div className="text-center space-y-1.5">
                  <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
                    <Lock className="w-3 h-3 text-emerald-700" />
                    <span>Safe & Secure 256-Bit SSL Checkout</span>
                  </p>
                  <p className="text-[10px] text-gray-400">
                    By clicking Confirm Order, you agree to receive parcel delivery updates on SMS / WhatsApp.
                  </p>
                </div>

                {/* DIRECT WHATSAPP OPTION */}
                <div className="pt-2 text-center border-t border-gray-100">
                  <a
                    href="https://wa.me/923287657890?text=Hi%20Eliza%20Gold%2C%20I%20want%20to%20place%20an%20order%20directly%20on%20WhatsApp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Prefer WhatsApp ordering? Click here
                  </a>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
