import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Truck, ArrowLeft, Clock, MapPin, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Shipping & Delivery Policy | Eliza Gold Pakistan",
  description: "Shipping details for Eliza Gold Pakistan. Free Express Cash on Delivery (COD) in 2-3 days across all cities in Pakistan.",
  alternates: {
    canonical: "https://eliza.pk/shipping-policy",
  },
  openGraph: {
    title: "Shipping & Delivery Policy | Eliza Gold Pakistan",
    description: "Express Cash on Delivery (COD) across Pakistan in 2-3 days from Lahore, Karachi, and Islamabad hubs.",
    url: "https://eliza.pk/shipping-policy",
  },
};

export default function ShippingPolicyPage() {
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
            <Truck className="w-3.5 h-3.5 text-[#d4af37]" /> Express Delivery Across Pakistan
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#fff3b0]">
            Shipping & Delivery Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            Fast, secure, and reliable Cash on Delivery (COD) shipping directly to your doorstep anywhere in Pakistan.
          </p>
        </div>
      </section>

      {/* CONTENT BODY */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-sm leading-relaxed">
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-8">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b2912] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#d4af37]" /> 1. Delivery Timelines
            </h2>
            <p className="text-gray-600">
              We dispatch all orders within 24 hours of confirmation. Delivery times across Pakistan:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e7e1d5]">
                <h3 className="font-bold text-[#0b2912] text-sm">Major Metro Cities</h3>
                <p className="text-xs text-gray-600 mt-1">Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan</p>
                <span className="inline-block bg-[#0b2912] text-[#fff3b0] text-[10px] font-extrabold px-2.5 py-1 rounded-full mt-2">⚡ 1 to 2 Working Days</span>
              </div>
              <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e7e1d5]">
                <h3 className="font-bold text-[#0b2912] text-sm">Rest of Pakistan</h3>
                <p className="text-xs text-gray-600 mt-1">All other cities, towns, rural areas, & tehsils</p>
                <span className="inline-block bg-[#0b2912] text-[#fff3b0] text-[10px] font-extrabold px-2.5 py-1 rounded-full mt-2">📦 2 to 4 Working Days</span>
              </div>
            </div>
          </section>

          <hr className="border-[#e7e1d5]" />

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b2912] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#d4af37]" /> 2. Dispatch Hubs & Courier Partners
            </h2>
            <p className="text-gray-600">
              To ensure maximum speed, orders are fulfilled from our strategically located warehouses in <strong>Lahore, Karachi, and Islamabad</strong>. We ship exclusively with premium courier partners:
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {["TCS Express", "Leopards Courier", "TRAX Logistics", "M&P Express"].map((partner) => (
                <span key={partner} className="bg-[#0b2912] text-[#fff3b0] border border-[#d4af37]/40 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                  ✓ {partner}
                </span>
              ))}
            </div>
          </section>

          <hr className="border-[#e7e1d5]" />

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b2912] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#d4af37]" /> 3. Cash on Delivery (COD) Charges
            </h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><strong>2-Bottle & 3-Bottle Packs:</strong> 100% FREE Cash on Delivery Shipping across Pakistan.</li>
              <li><strong>1-Bottle Starter Pack:</strong> Flat Rs. 150 Express COD Delivery fee nationwide.</li>
            </ul>
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
