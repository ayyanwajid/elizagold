import React from "react";
import Link from "next/link";
import Image from "next/image";
import { RotateCcw, ArrowLeft, CheckCircle2, ShieldCheck, Truck, MessageCircle } from "lucide-react";

export const metadata = {
  title: "Return & Refund Policy | Eliza Gold Pakistan",
  description: "7-Day Money Back Guarantee and Return Policy for Eliza Gold Pakistan. Hassle-free returns and refunds across Pakistan.",
  alternates: {
    canonical: "https://eliza.pk/return-policy",
  },
  openGraph: {
    title: "Return & Refund Policy | Eliza Gold Pakistan",
    description: "7-Day Money Back Guarantee and Return Policy for Eliza Gold Pakistan. Hassle-free returns and replacements across Pakistan.",
    url: "https://eliza.pk/return-policy",
  },
};

export default function ReturnPolicyPage() {
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
            <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" /> 100% Satisfaction Guarantee
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#fff3b0]">
            7-Day Return & Refund Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            Shop with total confidence. We back Eliza Gold Hair Oil with a hassle-free money back guarantee.
          </p>
        </div>
      </section>

      {/* CONTENT BODY */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-sm leading-relaxed">
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-8">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b2912] flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#d4af37]" /> 1. 7-Day Money Back Guarantee
            </h2>
            <p className="text-gray-600">
              We take extreme pride in the quality of Eliza Gold Roghan-e-Azam Misali Hair Oil. If your product arrives damaged, defective, or incorrect, you are eligible for a <strong>100% replacement or refund</strong> within 7 days of parcel delivery.
            </p>
          </section>

          <hr className="border-[#e7e1d5]" />

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b2912] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#d4af37]" /> 2. Eligibility Criteria for Return
            </h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Item must be returned within 7 days from the delivery date.</li>
              <li>Damaged or leaked bottles must be reported within 24 hours of receiving the parcel via WhatsApp video/photo evidence.</li>
              <li>Returned products must include original box packaging and invoice.</li>
            </ul>
          </section>

          <hr className="border-[#e7e1d5]" />

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b2912] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#d4af37]" /> 3. How to Initiate a Return or Exchange
            </h2>
            <p className="text-gray-600">
              Initiating a return is simple. Simply send a message to our WhatsApp support team with your Order ID:
            </p>
            <div className="bg-[#0b2912]/5 border border-[#0b2912]/15 p-4 rounded-xl space-y-2">
              <a 
                href="https://wa.me/923287657890?text=Hi%20Eliza%20Gold%2C%20I%20want%20to%20request%20a%20return%2Fexchange" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl text-xs font-bold shadow hover:brightness-105 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" /> Contact WhatsApp Support: +92 328 7657890
              </a>
              <p className="text-xs text-gray-600">Our customer care agent will guide you step-by-step and arrange your replacement parcel.</p>
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
