import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Scale, ArrowLeft, CheckCircle2, ShieldAlert, Truck } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Eliza Gold Pakistan",
  description: "Terms and conditions of service for Eliza Gold Pakistan. Read order terms, Cash on Delivery policy, and store policies.",
  alternates: {
    canonical: "https://eliza.pk/terms-of-service",
  },
  openGraph: {
    title: "Terms of Service | Eliza Gold Pakistan",
    description: "Official Terms of Service for Eliza Gold Pakistan Cash on Delivery orders and deliveries.",
    url: "https://eliza.pk/terms-of-service",
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-gray-800 font-sans selection:bg-[#d4af37] selection:text-black">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-[#041207] via-[#0b2912] to-[#041207] text-white border-b border-[#d4af37]/30 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full border border-[#d4af37] bg-black/40 overflow-hidden flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
              <Image src="/assets/logo-icon.webp" alt="Eliza Gold" width={40} height={40} className="w-full h-full object-cover mix-blend-screen" />
            </div>
            <span className="font-serif font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#fff3b0]">
              Eliza Gold
            </span>
          </Link>

          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] bg-white/10 hover:bg-white/20 border border-[#d4af37]/40 px-4 py-2 rounded-full transition-all">
            <ArrowLeft className="w-4 h-4" /> Return to Store
          </Link>
        </div>
      </header>

      {/* HERO BANNER */}
      <section className="bg-gradient-to-b from-[#041207] via-[#0b2912] to-[#0a2310] text-white py-12 px-4 border-b border-[#d4af37]/20">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f7e092] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            <Scale className="w-3.5 h-3.5 text-[#d4af37]" /> Official Store Terms
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#fff3b0]">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            Please read these terms before placing your Cash on Delivery order with Eliza Gold Pakistan.
          </p>
        </div>
      </section>

      {/* CONTENT BODY */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-sm leading-relaxed">
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-8">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b2912] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#d4af37]" /> 1. Order Placement & Cash on Delivery (COD)
            </h2>
            <p className="text-gray-600">
              By submitting an order on Eliza Gold Pakistan, you agree to provide accurate delivery details including a valid active mobile phone number and complete delivery address.
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>All orders are processed on <strong>Cash on Delivery (COD)</strong> across Pakistan.</li>
              <li>Payment must be handed over in cash to the delivery courier representative upon arrival.</li>
              <li>Order verification calls or WhatsApp confirmations may be conducted prior to dispatch.</li>
            </ul>
          </section>

          <hr className="border-[#e7e1d5]" />

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b2912] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#d4af37]" /> 2. Shipping & Courier Dispatch
            </h2>
            <p className="text-gray-600">
              Orders are dispatched within 24 business hours from our nearest distribution hub (Lahore, Karachi, or Islamabad). Estimated delivery time is 2 to 3 working days across all major cities and towns in Pakistan.
            </p>
          </section>

          <hr className="border-[#e7e1d5]" />

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b2912] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#d4af37]" /> 3. Product Authenticity & Satisfaction
            </h2>
            <p className="text-gray-600">
              Eliza Gold Roghan-e-Azam Misali Hair Oil is 100% natural, herbal, and chemical-free. Results may vary depending on individual hair texture, scalp condition, and routine application.
            </p>
          </section>

          <hr className="border-[#e7e1d5]" />

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b2912]">4. Contact & Customer Care</h2>
            <div className="bg-[#0b2912]/5 border border-[#0b2912]/15 p-4 rounded-xl space-y-1 font-medium text-gray-800">
              <p>💬 <strong>WhatsApp Helpline:</strong> +92 328 7657890</p>
              <p>📧 <strong>Email Support:</strong> support@elizagold.pk</p>
            </div>
          </section>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#041207] text-[#e2dacb] py-6 text-center text-xs border-t border-[#d4af37]/20">
        <p>© {new Date().getFullYear()} Eliza Gold Pakistan. All rights reserved.</p>
      </footer>
    </div>
  );
}
