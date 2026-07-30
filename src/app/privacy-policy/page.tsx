import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, ArrowLeft, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Eliza Gold Pakistan",
  description: "Privacy policy for Eliza Gold Pakistan. Learn how we collect, protect, and handle your personal data when ordering hair oil online.",
};

export default function PrivacyPolicyPage() {
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
            <Lock className="w-3.5 h-3.5 text-[#d4af37]" /> Data Security Guarantee
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#fff3b0]">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            Last Updated: July 2026. Your privacy and trust are our highest priorities at Eliza Gold Pakistan.
          </p>
        </div>
      </section>

      {/* CONTENT BODY */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-sm leading-relaxed">
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-8">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b2912] flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#d4af37]" /> 1. Information We Collect
            </h2>
            <p className="text-gray-600">
              When you place a Cash on Delivery (COD) order or interact with Eliza Gold Pakistan, we collect personal information necessary to deliver your order safely across Pakistan. This includes:
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Full Name and Delivery Contact Number</li>
              <li>Complete Shipping Address (House No, Street, Area, City, Province)</li>
              <li>Order details (Quantity of Roghan-e-Azam Misali Hair Oil ordered)</li>
              <li>Voluntary customer feedback and product reviews</li>
            </ul>
          </section>

          <hr className="border-[#e7e1d5]" />

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b2912] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#d4af37]" /> 2. How We Use Your Information
            </h2>
            <p className="text-gray-600">
              Your data is strictly used for order processing and direct customer service:
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Dispatching packages via courier partners (TCS, Leopards, Trax, M&P)</li>
              <li>Sending SMS or WhatsApp order confirmation and tracking updates</li>
              <li>Providing customer support for delivery inquiries or returns</li>
              <li>Improving store experience and stock management</li>
            </ul>
          </section>

          <hr className="border-[#e7e1d5]" />

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b2912] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#d4af37]" /> 3. Data Protection & Sharing
            </h2>
            <p className="text-gray-600">
              We <strong>NEVER sell, rent, or trade</strong> your personal information to third-party advertisers. Your information is shared only with verified courier logistics companies exclusively to fulfill your Cash on Delivery parcel delivery.
            </p>
          </section>

          <hr className="border-[#e7e1d5]" />

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#0b2912] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#d4af37]" /> 4. Your Rights & Contact Information
            </h2>
            <p className="text-gray-600">
              You have the right to inspect, update, or request deletion of your stored customer records at any time. For privacy inquiries or assistance, please contact our support desk:
            </p>
            <div className="bg-[#0b2912]/5 border border-[#0b2912]/15 p-4 rounded-xl space-y-1 font-medium text-gray-800">
              <p>📍 <strong>Hubs:</strong> Lahore, Karachi, Islamabad (Pakistan)</p>
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
