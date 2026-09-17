"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Truck,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  MapPin,
  Phone,
  User,
  ShoppingBag,
} from "lucide-react";
import { trackPurchase } from "@/lib/tracking";

interface StoredOrder {
  orderId: string;
  customer: {
    fullName: string;
    phone: string;
    city: string;
    address: string;
  };
  items: Array<{
    id: string;
    name: string;
    bundleTitle: string;
    bottles?: number;
    quantity: number;
    price: number;
    originalPrice: number;
    image?: string;
  }>;
  total: number;
  date: string;
  estimatedDelivery: string;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get("order_id") || "EG-CONFIRMED";
  const [orderDetails, setOrderDetails] = useState<StoredOrder | null>(null);

  useEffect(() => {
    let order: StoredOrder | null = null;
    try {
      const stored = sessionStorage.getItem("eliza_last_order");
      if (stored) {
        order = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    if (!order) {
      // Fallback display if user came directly with order_id
      order = {
        orderId: orderIdFromUrl,
        customer: {
          fullName: "Valued Customer",
          phone: "Provided at checkout",
          city: "Pakistan",
          address: "Delivery address saved",
        },
        items: [
          {
            id: "popular",
            name: "Eliza Gold Roghan-e-Azam Misali Hair Oil",
            bundleTitle: "2 Bottles (Popular Pack)",
            quantity: 1,
            price: 2699,
            originalPrice: 5000,
            image: "/assets/product-1.webp",
          },
        ],
        total: 2699,
        date: new Date().toLocaleDateString("en-PK", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        estimatedDelivery: "2 to 3 Business Days",
      };
    }

    setOrderDetails(order);

    // Fire deduplicated Meta & TikTok Purchase event
    trackPurchase({
      orderId: order.orderId,
      total: order.total,
      items: order.items,
      customer: order.customer,
    });
  }, [orderIdFromUrl]);

  const whatsappMessage = encodeURIComponent(
    `Hi Eliza Gold! My Order ID is ${orderDetails?.orderId || orderIdFromUrl}. Please share dispatch updates.`
  );

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
                Official Receipt
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d4af37] hover:underline"
          >
            Return to Store
          </Link>
        </div>
      </header>

      {/* CONFIRMATION HERO */}
      <section className="bg-gradient-to-b from-[#041207] via-[#0b2912] to-[#0a2310] text-white py-12 px-4 border-b border-[#d4af37]/20">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-400 rounded-full mx-auto flex items-center justify-center shadow-lg animate-bounce">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>

          <div className="inline-flex items-center gap-2 bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f7e092] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            🎉 Order Confirmed — Cash on Delivery
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#fff3b0]">
            Shukriya {orderDetails?.customer.fullName}!
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            Aap ka order kamyabi se record ho chuka hai. Hamari team parcel dispatch ke liye process kar rahi hai.
          </p>

          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 rounded-2xl">
            <span className="text-xs text-gray-300 block">Your Tracking Order ID:</span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-[#f7e092] tracking-wider">
              {orderDetails?.orderId}
            </span>
          </div>
        </div>
      </section>

      {/* RECEIPT CONTENT */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-20 space-y-6">
        {/* DISPATCH STATUS BANNER */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-gray-900">
                Estimated Delivery: 2 to 3 Working Days
              </h2>
              <p className="text-xs text-gray-600">
                Delivery via Express Courier across Pakistan. Rider will call before arrival.
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/923287657890?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:brightness-105 active:scale-95 transition-all shadow-sm"
          >
            <MessageCircle className="w-4 h-4" /> Track on WhatsApp
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* DELIVERY & CUSTOMER INFO (6 cols) */}
          <div className="md:col-span-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-4">
            <h3 className="font-serif font-bold text-base text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0b2912]" /> Delivery Information
            </h3>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-800 block">Recipient:</span>
                  <span>{orderDetails?.customer.fullName}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-800 block">Contact Phone:</span>
                  <span>{orderDetails?.customer.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-800 block">City & Destination:</span>
                  <span>{orderDetails?.customer.city}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <PackageCheck className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-800 block">Full Address:</span>
                  <span>{orderDetails?.customer.address}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                <strong>Open Parcel Policy:</strong> Rider se parcel lene se pehle aap parcel check kar saktay hain!
              </span>
            </div>
          </div>

          {/* ORDER ITEMS & COD AMOUNT (6 cols) */}
          <div className="md:col-span-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-4">
            <h3 className="font-serif font-bold text-base text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#0b2912]" /> Package Summary
            </h3>

            <div className="space-y-3">
              {orderDetails?.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 p-1 flex items-center justify-center flex-shrink-0">
                    <Image
                      src={item.image || "/assets/product-1.webp"}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-gray-900 truncate">{item.name}</h4>
                    <p className="text-[11px] text-emerald-800 font-semibold">{item.bundleTitle}</p>
                    <span className="text-[10px] text-gray-500">Qty: {item.quantity}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-900">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Payment Method:</span>
                <span className="font-bold text-[#0b2912]">Cash On Delivery (COD)</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Courier Charges:</span>
                <span className="font-semibold text-emerald-700">INCLUDED</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-900">Total Cash to Pay Courier:</span>
                <span className="text-xl font-black text-gray-900">
                  Rs. {orderDetails?.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* POLICY FOOTNOTE & ACTIONS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center space-y-4">
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="font-bold text-sm text-gray-900">Need to make changes or have questions?</h4>
            <p className="text-xs text-gray-500">
              Customer support is active on WhatsApp:{" "}
              <a href="https://wa.me/923287657890" className="text-emerald-700 font-bold underline">
                +92 328 7657890
              </a>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={`https://wa.me/923287657890?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:brightness-105 active:scale-95 transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4" /> Message on WhatsApp
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#0b2912] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#13421e] active:scale-95 transition-all"
            >
              Back to Home <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
          <div className="w-8 h-8 border-4 border-[#0b2912] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
