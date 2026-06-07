"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield, MapPin, UserCheck, Star, Award, CheckCircle, AlertTriangle, ChevronRight,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { GsapRoot } from "@/components/marketing/GsapRoot";
import { HeroBookingSearch } from "@/components/marketing/HeroBookingSearch";
import { HOTELS, DESTINATIONS, getReviewLabel, getReviewColor } from "@/lib/hotels-data";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const [lang, setLang] = useState<"en" | "bn">("en");

  // Passport Scanner states
  const [passportExpiry, setPassportExpiry] = useState("");
  const [passportStatus, setPassportStatus] = useState<{
    checked: boolean;
    valid: boolean;
    daysLeft: number;
    message: string;
  } | null>(null);

  // Language Dictionary
  const t = {
    en: {
      brand: "Sarah Travels BD",
      passportScanner: "Passport Validity Scanner",
      verifyPassport: "Verify Passport Expiry",
      whyChooseUs: "Why Choose Sarah Travels BD?",
      featuredPackages: "Featured Umrah & Hajj Packages",
      visaQuickGuides: "Country Visa Guides",
      popularFlights: "Popular International Flights",
      complianceNotice: "NBR Tax & AIT Compliance System",
      vatNotice: "VAT 15% applied to Service Fee only (transparent breakdown)",
      aitNotice: "AIT 0.3% deducted automatically per air ticket for NBR filing",
      officeAddresses: "Our Offices",
      licenses: "ATAB & IATA Certifications",
      placeholderExpiry: "Select Passport Expiry Date",
      passportValid: "Passport is valid for travel! (More than 6 months left)",
      passportInvalid: "Warning: Passport expires in less than 6 months. Renewal required!",
    },
    bn: {
      brand: "সারা ট্রাভেলস বিডি",
      passportScanner: "পাসপোর্ট মেয়াদ যাচাইকরণ",
      verifyPassport: "মেয়াদ যাচাই করুন",
      whyChooseUs: "কেন সারা ট্রাভেলস বিডি বেছে নেবেন?",
      featuredPackages: "উমরাহ ও হজ স্পেশাল প্যাকেজ",
      visaQuickGuides: "ভিসা গাইড ও প্রয়োজনীয় ডকুমেন্টস",
      popularFlights: "জনপ্রিয় আন্তর্জাতিক ফ্লাইট ডিল",
      complianceNotice: "এনবিআর কর ও এআইটি কমপ্লায়েন্স সিস্টেম",
      vatNotice: "ভ্যাট ১৫% শুধুমাত্র সার্ভিস চার্জের উপর প্রযোজ্য (স্বচ্ছ হিসাব)",
      aitNotice: "আইটি ০.৩% প্রতিটি টিকেটের উপর সরাসরি প্রযোজ্য এনবিআর জমার জন্য",
      officeAddresses: "আমাদের অফিসসমূহ",
      licenses: "আটাব এবং আইএটিএ লাইসেন্স তথ্য",
      placeholderExpiry: "পাসপোর্টের মেয়াদ শেষ হওয়ার তারিখ",
      passportValid: "পাসপোর্ট ভ্রমণের জন্য প্রস্তুত! (৬ মাসের বেশি সময় আছে)",
      passportInvalid: "সতর্কতা: পাসপোর্টের মেয়াদ ৬ মাসের কম। দ্রুত রিনিউ করুন!",
    }
  }[lang];

  // Passport validation logic
  function checkPassportExpiry(e: React.FormEvent) {
    e.preventDefault();
    if (!passportExpiry) return;
    const expiryDate = new Date(passportExpiry);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 180) {
      setPassportStatus({
        checked: true,
        valid: true,
        daysLeft: diffDays,
        message: t.passportValid
      });
    } else {
      setPassportStatus({
        checked: true,
        valid: false,
        daysLeft: diffDays,
        message: t.passportInvalid
      });
    }
  }

  return (
    <GsapRoot className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SiteHeader lang={lang} onLangToggle={() => setLang(lang === "en" ? "bn" : "en")} />

      {/* ── HERO: Agoda-style light search focus ──────────────────── */}
      <section className="agoda-hero relative pb-10 pt-8 sm:pb-14 sm:pt-10">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HeroBookingSearch />
        </div>
      </section>

      {/* ── BANGLADESH COMPLIANCE SHOWCASE ───────────────────────────── */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Shield className="h-10 w-10 text-brand-gold shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base uppercase tracking-tight flex items-center gap-2">
                {t.complianceNotice} <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">ACTIVE</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{t.vatNotice}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 bg-slate-100 border rounded-xl px-4 py-2.5">
            <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-green-600" /> AIT 0.3% AUTO-CALCULATED</span>
            <span className="hidden sm:inline border-r border-slate-300 h-4" />
            <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-green-600" /> MUSHAK 6.3 DIGITAL GENERATION</span>
            <span className="hidden sm:inline border-r border-slate-300 h-4" />
            <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-green-600" /> IATA REGISTERED #9601234</span>
          </div>
        </div>
      </section>

      {/* ── INTEGRATED SUPPLIERS GRID (NEW TRUST FACTOR) ─────────────── */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="bg-brand-navy/5 text-brand-navy text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border border-brand-navy/10 inline-block mb-3">
              Global Connectivity
            </span>
            <h2 className="text-2xl font-black text-brand-navy">Integrated Global Suppliers Ecosystem</h2>
            <p className="text-xs text-slate-500 mt-1">Direct server connections for real-time rates and live inventory verification.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <div className="bg-slate-50 border p-4 rounded-xl space-y-2">
              <h4 className="font-extrabold text-xs text-brand-navy uppercase border-b pb-1">Flights API</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Amadeus Enterprise · Sabre · TBO · Travelpayouts · Duffel Flights · Kiwi API · Pkfare consolidator · Kayak search · Seeru.
              </p>
            </div>
            <div className="bg-slate-50 border p-4 rounded-xl space-y-2">
              <h4 className="font-extrabold text-xs text-brand-navy uppercase border-b pb-1">Stays (Hotels)</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Hotelbeds API · Agoda content sync · Ratehawk B2B · Hotelston GDS · Travelport stays · Stuba luxury hotels.
              </p>
            </div>
            <div className="bg-slate-50 border p-4 rounded-xl space-y-2">
              <h4 className="font-extrabold text-xs text-brand-navy uppercase border-b pb-1">Tours & Activities</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Viator affiliate inventory · Tiqets attractions API · Custom Bangladeshi tour modules.
              </p>
            </div>
            <div className="bg-slate-50 border p-4 rounded-xl space-y-2">
              <h4 className="font-extrabold text-xs text-brand-navy uppercase border-b pb-1">Cars & Taxi transfers</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Cartrawler booking module · Discovercars rental · Kiwitaxi airport transfers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE PASSPORT SCANNER ────────────────────────────── */}
      <section className="py-12 bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-center gap-8 hover-lift">
            <div className="shrink-0 bg-brand-navy/5 p-4 rounded-full text-brand-navy">
              <UserCheck className="h-12 w-12 text-brand-gold" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-brand-navy">{t.passportScanner}</h3>
              <p className="text-sm text-slate-600 mt-1">
                {lang === "en" 
                  ? "Ensure your travel stays stress-free. Type in your passport expiration date to verify if you satisfy the global 6-month validity rule before booking flights." 
                  : "আপনার পাসপোর্ট মেয়াদ চেক করে নিশ্চিত হোন। আন্তর্জাতিক নিয়মানুযায়ী ভ্রমণের জন্য পাসপোর্টের অন্তত ৬ মাসের মেয়াদ থাকা আবশ্যক।"}
              </p>
              
              <form onSubmit={checkPassportExpiry} className="mt-4 flex flex-col sm:flex-row gap-3">
                <input 
                  type="date"
                  value={passportExpiry}
                  onChange={(e) => setPassportExpiry(e.target.value)}
                  placeholder={t.placeholderExpiry}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-brand-navy"
                  required
                />
                <button 
                  type="submit"
                  className="bg-brand-navy hover:bg-opacity-95 text-white font-bold text-sm px-6 py-2 rounded-lg transition"
                >
                  {t.verifyPassport}
                </button>
              </form>

              {passportStatus?.checked && (
                <div className={`mt-4 rounded-xl p-4 flex items-start gap-3 border ${
                  passportStatus.valid 
                    ? "bg-green-50 border-green-200 text-green-800" 
                    : "bg-red-50 border-red-200 text-red-800"
                }`}>
                  {passportStatus.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold text-sm">{passportStatus.message}</p>
                    <p className="text-xs mt-1 text-slate-500">Days remaining: {passportStatus.daysLeft} days</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED UMRAH PACKAGES ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight">{t.featuredPackages}</h2>
            <p className="text-slate-600 mt-2">
              {lang === "en" ? "Guided Umrah packages with premium airline flight booking and distance verified Mecca hotels." : "সম্পূর্ণ গাইডেন্স ও দেশের সেরা বিমান ও হোটেল সুবিধাসহ নির্ভরযোগ্য উমরাহ অফার সমূহ।"}
            </p>
          </div>
          <Link href="/umrah" className="text-sm font-bold text-brand-gold hover:underline mt-2 md:mt-0 flex items-center gap-1">
            {lang === "en" ? "View All Packages" : "সব প্যাকেজ দেখুন"} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Economy Package */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover-lift flex flex-col">
            <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1591604129939-f1efa4f849f1?w=800&q=80')" }}>
              <div className="absolute top-3 left-3 bg-brand-navy text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                {lang === "en" ? "Budget Friendly" : "বাজেট ফ্রেন্ডলি"}
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-brand-navy">Economy Umrah — 7 Days</h3>
                <p className="text-xs text-slate-500 mt-1">Route: DAC - JED - DAC | Airline: SV (Saudia)</p>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-gold shrink-0" /> Makkah Hotel: 500m from Haram (3-Star)</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-gold shrink-0" /> Madinah Hotel: 800m from Mosque (3-Star)</p>
                  <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600 shrink-0" /> 30% Downpayment (BDT 28,500 only)</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Package Price</span>
                  <span className="text-2xl font-black text-brand-navy">BDT 95,000</span>
                </div>
                <Link 
                  href="/umrah/economy-umrah-7d"
                  className="bg-brand-navy hover:bg-opacity-95 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition"
                >
                  {lang === "en" ? "View Plans" : "প্ল্যান দেখুন"}
                </Link>
              </div>
            </div>
          </div>

          {/* Standard Package */}
          <div className="bg-white rounded-2xl border border-brand-gold shadow-md overflow-hidden hover-lift flex flex-col relative">
            <div className="absolute top-3 right-3 bg-brand-gold text-brand-navy text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow z-10 animate-shimmer">
              BEST VALUE
            </div>
            <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80')" }}>
              <div className="absolute top-3 left-3 bg-brand-navy text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                10 Days Program
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-brand-navy">Standard Umrah — 10 Days</h3>
                <p className="text-xs text-slate-500 mt-1">Route: DAC - JED - MED - DAC | Airline: BG (Biman)</p>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-gold shrink-0" /> Makkah Hotel: 300m from Haram (4-Star)</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-gold shrink-0" /> Madinah Hotel: 400m from Mosque (4-Star)</p>
                  <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600 shrink-0" /> AC Transport, Guided Ziyarat included</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Package Price</span>
                  <span className="text-2xl font-black text-brand-navy">BDT 145,000</span>
                </div>
                <Link 
                  href="/umrah/standard-umrah-10d"
                  className="bg-brand-navy hover:bg-opacity-95 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition"
                >
                  {lang === "en" ? "View Plans" : "প্ল্যান দেখুন"}
                </Link>
              </div>
            </div>
          </div>

          {/* Premium Package */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover-lift flex flex-col">
            <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80')" }}>
              <div className="absolute top-3 left-3 bg-brand-navy text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                Premium Luxury
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-brand-navy">Premium Umrah — 14 Days</h3>
                <p className="text-xs text-slate-500 mt-1">Route: DAC - JED - MED - DAC | Airline: EK (Emirates)</p>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-gold shrink-0" /> Makkah Hotel: Haram Front View (5-Star)</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-gold shrink-0" /> Madinah Hotel: Mosque Front View (5-Star)</p>
                  <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600 shrink-0" /> VIP Private SUV Transport, All Meals</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Package Price</span>
                  <span className="text-2xl font-black text-brand-navy">BDT 285,000</span>
                </div>
                <Link 
                  href="/umrah/premium-umrah-14d"
                  className="bg-brand-navy hover:bg-opacity-95 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition"
                >
                  {lang === "en" ? "View Plans" : "প্ল্যান দেখুন"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VISA QUICK GUIDES ────────────────────────────────────────── */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight">{t.visaQuickGuides}</h2>
            <p className="text-slate-600 mt-2 text-sm">
              {lang === "en" ? "Up-to-date visa criteria, processing fees, and checklist requirements verified under Bangladesh passport guidelines." : "বাংলাদেশ পাসপোর্টের জন্য হালনাগাদ ভিসা তথ্য, সরকারি ও প্রসেসিং ফি এবং প্রয়োজনীয় ফাইল গাইডলাইন।"}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { code: "SA", name: lang === "en" ? "Saudi Arabia" : "সৌদি আরব", fee: "12,000", days: 7, desc: "Umrah, Tourist & Family visa." },
              { code: "AE", name: lang === "en" ? "United Arab Emirates" : "সংযুক্ত আরব আমিরাত", fee: "8,500", days: 5, desc: "Dubai, Abu Dhabi Tourist entry." },
              { code: "MY", name: lang === "en" ? "Malaysia" : "মালয়েশিয়া", fee: "4,500", days: 3, desc: "eVisa fast-track Tourist entry." },
              { code: "TH", name: lang === "en" ? "Thailand" : "থাইল্যান্ড", fee: "5,500", days: 5, desc: "Medical and Tourist visa files." }
            ].map(v => (
              <div key={v.code} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover-lift shadow-sm">
                <div>
                  <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2 py-1 rounded border mb-2 inline-block">ISO: {v.code}</span>
                  <h3 className="font-extrabold text-brand-navy text-lg mt-1">{v.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{v.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                    <span>{lang === "en" ? "Processing" : "প্রসেসিং সময়"}</span>
                    <span className="font-bold text-slate-700">~{v.days} Days</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-brand-navy mb-4">
                    <span>{lang === "en" ? "Total Fee" : "মোট ফি"}</span>
                    <span className="text-brand-gold">BDT {v.fee}</span>
                  </div>
                  <Link 
                    href={`/visa/${v.code}`}
                    className="w-full text-center block bg-slate-50 hover:bg-brand-navy hover:text-white border border-slate-200 text-brand-navy font-bold text-xs py-2 rounded-lg transition"
                  >
                    {lang === "en" ? "Requirements & Apply" : "প্রয়োজনীয় ফাইল ও আবেদন"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING STAYS (AGODA-STYLE) ─────────────────────────────── */}
      <section className="bg-white py-16 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <span className="bg-red-100 text-red-700 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full inline-block mb-3">
                {lang === "en" ? "Sarah Deals" : "সারা ডিল"}
              </span>
              <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight">
                {lang === "en" ? "Trending Stays & Hotels" : "জনপ্রিয় হোটেল ও স্টে"}
              </h2>
              <p className="text-slate-600 mt-2 text-sm">
                {lang === "en" ? "Handpicked properties with verified reviews, free cancellation, and best-price guarantee." : "যাচাইকৃত রিভিউ, ফ্রি ক্যানসেলেশন ও বেস্ট প্রাইস গ্যারান্টিসহ নির্বাচিত হোটেল।"}
              </p>
            </div>
            <Link href="/hotels" className="text-sm font-bold text-brand-gold hover:underline mt-2 md:mt-0 flex items-center gap-1">
              {lang === "en" ? "View all properties" : "সব হোটেল দেখুন"} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Popular destinations */}
          <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-thin">
            {DESTINATIONS.slice(0, 6).map(dest => (
              <Link
                key={dest.id}
                href={`/hotels?city=${dest.name}`}
                className="shrink-0 bg-slate-50 hover:bg-brand-navy hover:text-white border border-slate-200 hover:border-brand-navy rounded-xl px-5 py-3 transition group"
              >
                <span className="text-lg block mb-0.5">{dest.icon}</span>
                <span className="font-bold text-sm text-brand-navy group-hover:text-white block">{dest.name}</span>
                <span className="text-[10px] text-slate-500 group-hover:text-slate-300">{dest.hotels} properties</span>
              </Link>
            ))}
          </div>

          {/* Hotel cards grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {HOTELS.filter(h => h.recommended || h.deal).slice(0, 6).map(hotel => (
              <Link key={hotel.id} href={`/hotels/${hotel.id}`} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover-lift shadow-sm group">
                <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url('${hotel.images[0]}')` }}>
                  {hotel.deal && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded">
                      {hotel.deal.label} -{hotel.deal.discount}%
                    </span>
                  )}
                  <span className={`absolute top-3 right-3 ${getReviewColor(hotel.reviewScore)} text-white text-xs font-black px-2 py-1 rounded`}>
                    {hotel.reviewScore.toFixed(1)}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex text-brand-gold mb-1">
                    {Array.from({ length: hotel.stars }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                  </div>
                  <h3 className="font-extrabold text-brand-navy text-sm leading-tight group-hover:text-brand-gold transition">{hotel.name}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-brand-gold" /> {hotel.city}, {hotel.country}
                  </p>
                  <div className="flex justify-between items-end mt-3 pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{getReviewLabel(hotel.reviewScore)}</span>
                      <span className="text-[10px] text-slate-400">{hotel.reviewCount.toLocaleString()} reviews</span>
                    </div>
                    <div className="text-right">
                      {hotel.originalPrice && <span className="text-[10px] text-slate-400 line-through block">{formatCurrency(hotel.originalPrice)}</span>}
                      <span className="font-black text-brand-navy">{formatCurrency(hotel.price)}</span>
                      <span className="text-[10px] text-slate-400 block">/ night</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR FLIGHT DEALS ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight text-center mb-10">{t.popularFlights}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { from: "Dhaka (DAC)", to: "Jeddah (JED)", price: "68,500", airline: "Saudia Airlines", type: "Round Trip" },
            { from: "Dhaka (DAC)", to: "Dubai (DXB)", price: "52,000", airline: "Biman Bangladesh", type: "One Way" },
            { from: "Dhaka (DAC)", to: "Singapore (SIN)", price: "44,800", airline: "Singapore Airlines", type: "Round Trip" }
          ].map((f, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 flex justify-between items-center shadow-sm hover-lift">
              <div>
                <p className="text-xs text-brand-gold font-bold uppercase tracking-wider">{f.type}</p>
                <h4 className="font-extrabold text-brand-navy text-lg mt-1">{f.from} ✈ {f.to}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{f.airline}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Starting at</span>
                <span className="font-black text-brand-navy text-xl">BDT {f.price}</span>
                <Link 
                  href={`/flights?origin=DAC&destination=${f.to.substring(0,3)}`}
                  className="block text-xs font-bold text-brand-gold hover:underline mt-1"
                >
                  Book Deal →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUST & COMPLIANCE BADGES SECTION ───────────────────────── */}
      <section className="bg-slate-900 py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80')" }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3 text-center items-center">
            <div className="p-4 flex flex-col items-center">
              <Award className="h-12 w-12 text-brand-gold mb-3" />
              <h4 className="text-lg font-bold">ATAB Registered Agent</h4>
              <p className="text-xs text-slate-400 mt-2 max-w-xs">
                Member of Association of Travel Agents of Bangladesh. License Registry No: ATAB-10452/2026.
              </p>
            </div>
            <div className="p-4 flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-brand-gold mb-3" />
              <h4 className="text-lg font-bold">100% NBR Compliant</h4>
              <p className="text-xs text-slate-400 mt-2 max-w-xs">
                Ensuring secure, transparent tax structures with automatic AIT (0.3% air tickets) and service fee VAT generation on digital invoicing.
              </p>
            </div>
            <div className="p-4 flex flex-col items-center">
              <Shield className="h-12 w-12 text-brand-gold mb-3" />
              <h4 className="text-lg font-bold">SSLCommerz Secured Checkout</h4>
              <p className="text-xs text-slate-400 mt-2 max-w-xs">
                Complete integration with SSLCommerz, processing bKash, Nagad, Rocket, cards, and Net Banking instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </GsapRoot>
  );
}
