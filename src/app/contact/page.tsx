"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, ArrowLeft, Mail, MapPin, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

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
            <MessageCircle className="w-3.5 h-3.5 text-[#d4af37]" /> 24/7 Customer Care
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fff3b0] via-[#d4af37] to-[#fff3b0]">
            Contact Customer Support
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            Have questions about your hair oil order or delivery? Our customer care specialists are here to assist you.
          </p>
        </div>
      </section>

      {/* CONTENT BODY */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Contact Info Cards (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            
            {/* WhatsApp Card */}
            <a 
              href="https://wa.me/923287657890?text=Hi%20Eliza%20Gold%2C%20I%20have%20a%20question" 
              target="_blank" 
              rel="noreferrer"
              className="block bg-gradient-to-br from-[#0b2912] to-[#041207] text-white p-6 rounded-2xl border border-[#d4af37]/40 shadow-md hover:scale-[1.02] transition-transform group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#25D366] text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
                  <MessageCircle className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-[#f7e092] text-sm group-hover:underline">Instant WhatsApp Care</h3>
                  <p className="text-sm font-extrabold text-white mt-0.5">+92 328 7657890</p>
                  <p className="text-[11px] text-gray-300">Click to chat instantly on WhatsApp</p>
                </div>
              </div>
            </a>

            {/* Email Card */}
            <div className="bg-white p-6 rounded-2xl border border-[#e7e1d5] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-[#0b2912]/10 text-[#0b2912] rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Official Email</h3>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">support@elizagold.pk</p>
                <p className="text-[11px] text-gray-500">Replies within 2 to 4 hours</p>
              </div>
            </div>

            {/* Hours Card */}
            <div className="bg-white p-6 rounded-2xl border border-[#e7e1d5] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-[#0b2912]/10 text-[#0b2912] rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Support Operating Hours</h3>
                <p className="text-xs text-gray-700 mt-0.5">Monday – Saturday: 9:00 AM – 9:00 PM PKT</p>
                <p className="text-[11px] text-gray-500">Sunday: Closed (Orders process automatically)</p>
              </div>
            </div>

            {/* Hub Locations Card */}
            <div className="bg-white p-6 rounded-2xl border border-[#e7e1d5] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-[#0b2912]/10 text-[#0b2912] rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Dispatch Hubs</h3>
                <p className="text-xs text-gray-700 mt-0.5">Lahore • Karachi • Islamabad (Pakistan)</p>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Message Form (7 cols) */}
          <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#e7e1d5] shadow-sm space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-gray-900">Send Us a Direct Message</h2>
              <p className="text-xs text-gray-600 mt-1">Fill out your details below and our team will get back to you promptly.</p>
            </div>

            {formSubmitted ? (
              <div className="bg-[#0b2912]/10 border border-[#0b2912]/30 p-6 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 bg-[#0b2912] text-[#d4af37] rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h3 className="font-serif font-bold text-lg text-[#0b2912]">Message Received!</h3>
                <p className="text-xs text-gray-700">Thank you for reaching out to Eliza Gold Pakistan. Our customer support team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Your Full Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Fatima Sohail" 
                    className="w-full px-4 py-3 bg-[#faf8f5] border border-[#e7e1d5] rounded-xl outline-none focus:border-[#0b2912]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Mobile / WhatsApp Number</label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="0328 7657890" 
                      className="w-full px-4 py-3 bg-[#faf8f5] border border-[#e7e1d5] rounded-xl outline-none focus:border-[#0b2912]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">City</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Lahore" 
                      className="w-full px-4 py-3 bg-[#faf8f5] border border-[#e7e1d5] rounded-xl outline-none focus:border-[#0b2912]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Your Message or Order Query</label>
                  <textarea 
                    rows={4} 
                    required 
                    placeholder="How can we help you today?" 
                    className="w-full px-4 py-3 bg-[#faf8f5] border border-[#e7e1d5] rounded-xl outline-none focus:border-[#0b2912]"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#0b2912] via-[#144821] to-[#0b2912] text-[#fff3b0] py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#d4af37]" /> Send Message
                </button>
              </form>
            )}
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#041207] text-[#e2dacb] py-6 text-center text-xs border-t border-[#d4af37]/20">
        <p>© {new Date().getFullYear()} Eliza Gold Pakistan. All rights reserved.</p>
      </footer>
    </div>
  );
}
