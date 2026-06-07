"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shield, MapPin, UserCheck, Star, Award, CheckCircle, AlertTriangle, ChevronRight, Plane,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLanguage } from "@/components/LanguageProvider";
import { common, home, visaCards } from "@/lib/i18n/translations";
import { pick } from "@/lib/i18n/types";
import { GsapRoot } from "@/components/marketing/GsapRoot";
import { HeroBookingSearch } from "@/components/marketing/HeroBookingSearch";
import { HeroImageCollage } from "@/components/marketing/HeroImageCollage";
import { ImageBentoGrid } from "@/components/marketing/ImageBentoGrid";
import { ExploreTravelSection } from "@/components/marketing/ExploreTravelSection";
import { TravelMarquee } from "@/components/marketing/TravelMarquee";
import { TravelTestimonials } from "@/components/marketing/TravelTestimonials";
import { StaggerGrid, StaggerItem } from "@/components/AnimatedSection";
import { HOTELS, DESTINATIONS, getReviewLabel, getReviewColor } from "@/lib/hotels-data";
import { travelImages, visaImageFor } from "@/lib/travelImages";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const { lang, toggleLang } = useLanguage();

  // Passport Scanner states
  const [passportExpiry, setPassportExpiry] = useState("");
  const [passportStatus, setPassportStatus] = useState<{
    checked: boolean;
    valid: boolean;
    daysLeft: number;
    message: string;
  } | null>(null);

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
        message: pick(lang, home.passportValid)
      });
    } else {
      setPassportStatus({
        checked: true,
        valid: false,
        daysLeft: diffDays,
        message: pick(lang, home.passportInvalid)
      });
    }
  }

  return (
    <GsapRoot className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SiteHeader lang={lang} onLangToggle={toggleLang} />

      {/* HERO: booking search + destination collage */}
      <section className="sarah-hero relative overflow-x-hidden pb-12 pt-10 sm:pb-16 sm:pt-12">
        <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10 xl:grid xl:grid-cols-12 xl:items-start xl:gap-8 2xl:gap-10">
            <div className="st-hero-in min-w-0 xl:col-span-7 2xl:col-span-8">
              <HeroBookingSearch />
            </div>
            <div className="hidden min-w-0 xl:col-span-5 2xl:col-span-4 xl:block">
              <HeroImageCollage />
            </div>
          </div>
        </div>
      </section>

      {/* BANGLADESH COMPLIANCE SHOWCASE */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="st-reveal mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Shield className="h-10 w-10 text-brand-gold shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base uppercase tracking-tight flex items-center gap-2">
                {pick(lang, home.complianceNotice)} <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">{pick(lang, common.active)}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{pick(lang, home.vatNotice)}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 bg-slate-100 border rounded-xl px-4 py-2.5">
            <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-green-600" /> {pick(lang, home.aitBadge)}</span>
            <span className="hidden sm:inline border-r border-slate-300 h-4" />
            <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-green-600" /> {pick(lang, home.mushakBadge)}</span>
            <span className="hidden sm:inline border-r border-slate-300 h-4" />
            <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-green-600" /> {pick(lang, home.iataBadge)}</span>
          </div>
        </div>
      </section>

      <ImageBentoGrid />

      {/* INTEGRATED SUPPLIERS GRID */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="st-reveal text-center max-w-2xl mx-auto mb-10">
            <span className="bg-brand-navy/5 text-brand-navy text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border border-brand-navy/10 inline-block mb-3">
              {pick(lang, home.suppliersEyebrow)}
            </span>
            <h2 className="text-2xl font-black text-brand-navy">{pick(lang, home.suppliersTitle)}</h2>
            <p className="text-xs text-slate-500 mt-1">{pick(lang, home.suppliersSub)}</p>
          </div>

          <div className="st-reveal grid gap-6 md:grid-cols-4">
            <div className="bg-slate-50 border p-4 rounded-xl space-y-2 hover-lift">
              <h4 className="font-extrabold text-xs text-brand-navy uppercase border-b pb-1">Flights API</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Amadeus Enterprise · Sabre · TBO · Travelpayouts · Duffel Flights · Kiwi API · Pkfare consolidator · Kayak search · Seeru.
              </p>
            </div>
            <div className="bg-slate-50 border p-4 rounded-xl space-y-2 hover-lift">
              <h4 className="font-extrabold text-xs text-brand-navy uppercase border-b pb-1">Stays (Hotels)</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Hotelbeds API · Agoda content sync · Ratehawk B2B · Hotelston GDS · Travelport stays · Stuba luxury hotels.
              </p>
            </div>
            <div className="bg-slate-50 border p-4 rounded-xl space-y-2 hover-lift">
              <h4 className="font-extrabold text-xs text-brand-navy uppercase border-b pb-1">Tours & Activities</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Viator affiliate inventory · Tiqets attractions API · Custom Bangladeshi tour modules.
              </p>
            </div>
            <div className="bg-slate-50 border p-4 rounded-xl space-y-2 hover-lift">
              <h4 className="font-extrabold text-xs text-brand-navy uppercase border-b pb-1">Cars & Taxi transfers</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Cartrawler booking module · Discovercars rental · Kiwitaxi airport transfers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <TravelMarquee />

      {/* INTERACTIVE PASSPORT SCANNER */}
      <section className="py-12 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="st-reveal bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row items-stretch hover-lift">
            <div className="relative hidden md:block w-72 shrink-0 min-h-[300px]">
              <Image src={travelImages.passport} alt="Passport travel documents" fill className="st-shot object-cover" sizes="288px" />
              <div className="absolute inset-0 bg-brand-navy/20" />
            </div>
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 flex-1">
            <div className="shrink-0 bg-brand-navy/5 p-4 rounded-full text-brand-navy md:hidden">
              <UserCheck className="h-12 w-12 text-brand-gold" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-brand-navy">{pick(lang, home.passportScanner)}</h3>
              <p className="text-sm text-slate-600 mt-1">{pick(lang, home.passportDesc)}</p>
              
              <form onSubmit={checkPassportExpiry} className="mt-4 flex flex-col sm:flex-row gap-3">
                <input 
                  type="date"
                  value={passportExpiry}
                  onChange={(e) => setPassportExpiry(e.target.value)}
                  aria-label={lang === "en" ? "Passport expiry date" : "পাসপোর্ট মেয়াদ শেষের তারিখ"}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-brand-navy"
                  required
                />
                <button 
                  type="submit"
                  className="bg-brand-navy hover:bg-opacity-95 text-white font-bold text-sm px-6 py-2 rounded-lg transition"
                >
                  {pick(lang, home.verifyPassport)}
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
                    <p className="text-xs mt-1 text-slate-500">{pick(lang, common.daysRemaining)}: {passportStatus.daysLeft} {pick(lang, common.days)}</p>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </section>

      <ExploreTravelSection />

      {/* FEATURED UMRAH PACKAGES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="st-reveal flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight">{pick(lang, home.featuredPackages)}</h2>
            <p className="text-slate-600 mt-2">{pick(lang, home.featuredPackagesSub)}</p>
          </div>
          <Link href="/umrah" className="text-sm font-bold text-brand-gold hover:underline mt-2 md:mt-0 flex items-center gap-1">
            {pick(lang, home.viewAllPackages)} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <StaggerGrid className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Economy Package */}
          <StaggerItem>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover-lift flex flex-col h-full">
            <div className="relative h-48">
              <Image src={travelImages.umrah} alt="Economy Umrah package" fill className="st-shot object-cover" sizes="(max-width:768px) 100vw, 33vw" />
              <div className="absolute top-3 left-3 bg-brand-navy text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                {pick(lang, common.budgetFriendly)}
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
                  <span className="text-xs text-slate-500 block">{pick(lang, common.packagePrice)}</span>
                  <span className="text-2xl font-black text-brand-navy">BDT 95,000</span>
                </div>
                <Link 
                  href="/umrah/economy-umrah-7d"
                  className="bg-brand-navy hover:bg-opacity-95 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition"
                >
                  {pick(lang, common.viewPlans)}
                </Link>
              </div>
            </div>
          </div>
          </StaggerItem>

          {/* Standard Package */}
          <StaggerItem>
          <div className="bg-white rounded-2xl border border-brand-gold shadow-md overflow-hidden hover-lift flex flex-col relative h-full">
            <div className="absolute top-3 right-3 bg-brand-gold text-brand-navy text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow z-10 animate-shimmer">
              {pick(lang, common.bestValue)}
            </div>
            <div className="relative h-48">
              <Image src={travelImages.makkah} alt="Standard Umrah package" fill className="st-shot object-cover" sizes="(max-width:768px) 100vw, 33vw" />
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
                  <span className="text-xs text-slate-500 block">{pick(lang, common.packagePrice)}</span>
                  <span className="text-2xl font-black text-brand-navy">BDT 145,000</span>
                </div>
                <Link 
                  href="/umrah/standard-umrah-10d"
                  className="bg-brand-navy hover:bg-opacity-95 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition"
                >
                  {pick(lang, common.viewPlans)}
                </Link>
              </div>
            </div>
          </div>
          </StaggerItem>

          {/* Premium Package */}
          <StaggerItem>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover-lift flex flex-col h-full">
            <div className="relative h-48">
              <Image src={travelImages.hotels} alt="Premium Umrah package" fill className="st-shot object-cover" sizes="(max-width:768px) 100vw, 33vw" />
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
                  <span className="text-xs text-slate-500 block">{pick(lang, common.packagePrice)}</span>
                  <span className="text-2xl font-black text-brand-navy">BDT 285,000</span>
                </div>
                <Link 
                  href="/umrah/premium-umrah-14d"
                  className="bg-brand-navy hover:bg-opacity-95 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition"
                >
                  {pick(lang, common.viewPlans)}
                </Link>
              </div>
            </div>
          </div>
          </StaggerItem>
        </StaggerGrid>
      </section>

      {/* VISA QUICK GUIDES */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="st-reveal text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight">{pick(lang, home.visaQuickGuides)}</h2>
            <p className="text-slate-600 mt-2 text-sm">{pick(lang, home.visaQuickGuidesSub)}</p>
          </div>

          <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {visaCards.map((v) => (
              <StaggerItem key={v.code}>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover-lift shadow-sm h-full">
                <div className="relative h-36">
                  <Image src={visaImageFor(v.code)} alt={pick(lang, v.name)} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-xs bg-white/90 text-slate-800 font-bold px-2 py-1 rounded border">ISO: {v.code}</span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                <div>
                  <h3 className="font-extrabold text-brand-navy text-lg">{pick(lang, v.name)}</h3>
                  <p className="text-xs text-slate-500 mt-1">{pick(lang, v.desc)}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                    <span>{pick(lang, common.processing)}</span>
                    <span className="font-bold text-slate-700">~{v.days} {pick(lang, common.days)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-brand-navy mb-4">
                    <span>{pick(lang, common.totalFee)}</span>
                    <span className="text-brand-gold">BDT {v.fee}</span>
                  </div>
                  <Link 
                    href={`/visa/${v.code}`}
                    className="w-full text-center block bg-slate-50 hover:bg-brand-navy hover:text-white border border-slate-200 text-brand-navy font-bold text-xs py-2 rounded-lg transition"
                  >
                    {pick(lang, common.requirementsApply)}
                  </Link>
                </div>
                </div>
              </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* TRENDING STAYS */}
      <section className="bg-white py-16 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="st-reveal flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <span className="bg-red-100 text-red-700 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full inline-block mb-3">
                {pick(lang, home.sarahDeals)}
              </span>
              <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight">
                {pick(lang, home.trendingStays)}
              </h2>
              <p className="text-slate-600 mt-2 text-sm">{pick(lang, home.trendingStaysSub)}</p>
            </div>
            <Link href="/hotels" className="text-sm font-bold text-brand-gold hover:underline mt-2 md:mt-0 flex items-center gap-1">
              {pick(lang, home.viewAllProperties)} <ChevronRight className="h-4 w-4" />
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
                <span className="text-[10px] text-slate-500 group-hover:text-slate-300">{dest.hotels} {pick(lang, common.properties)}</span>
              </Link>
            ))}
          </div>

          {/* Hotel cards grid */}
          <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {HOTELS.filter(h => h.recommended || h.deal).slice(0, 6).map(hotel => (
              <StaggerItem key={hotel.id}>
              <Link href={`/hotels/${hotel.id}`} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover-lift shadow-sm group block h-full">
                <div className="relative h-48">
                  <Image src={hotel.images[0]} alt={hotel.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:768px) 100vw, 33vw" />
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
                      <span className="text-[10px] text-slate-400">{hotel.reviewCount.toLocaleString()} {pick(lang, common.reviews)}</span>
                    </div>
                    <div className="text-right">
                      {hotel.originalPrice && <span className="text-[10px] text-slate-400 line-through block">{formatCurrency(hotel.originalPrice)}</span>}
                      <span className="font-black text-brand-navy">{formatCurrency(hotel.price)}</span>
                      <span className="text-[10px] text-slate-400 block">{pick(lang, common.perNight)}</span>
                    </div>
                  </div>
                </div>
              </Link>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* POPULAR FLIGHT DEALS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="st-reveal text-3xl font-extrabold text-brand-navy tracking-tight text-center mb-10">{pick(lang, home.popularFlights)}</h2>
        <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { from: "Dhaka (DAC)", to: "Jeddah (JED)", price: "68,500", airline: "Saudia Airlines", type: pick(lang, common.roundTrip), image: travelImages.makkah, dest: "JED" },
            { from: "Dhaka (DAC)", to: "Dubai (DXB)", price: "52,000", airline: "Biman Bangladesh", type: pick(lang, common.oneWay), image: travelImages.dubai, dest: "DXB" },
            { from: "Dhaka (DAC)", to: "Singapore (SIN)", price: "44,800", airline: "Singapore Airlines", type: pick(lang, common.roundTrip), image: travelImages.singapore, dest: "SIN" }
          ].map((f, idx) => (
            <StaggerItem key={idx}>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover-lift h-full flex flex-col">
              <div className="relative h-40">
                <Image src={f.image} alt={f.to} fill className="st-shot object-cover" sizes="(max-width:768px) 100vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-[10px] text-brand-gold font-bold uppercase tracking-wider">{f.type}</p>
                  <h4 className="font-extrabold text-lg mt-0.5 flex items-center gap-2">
                    <Plane className="h-4 w-4 text-brand-gold shrink-0" />
                    {f.from} → {f.to}
                  </h4>
                </div>
              </div>
              <div className="p-5 flex justify-between items-center flex-1">
                <p className="text-xs text-slate-500">{f.airline}</p>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">{pick(lang, common.startingAt)}</span>
                  <span className="font-black text-brand-navy text-xl">BDT {f.price}</span>
                  <Link 
                    href={`/flights?origin=DAC&destination=${f.dest}`}
                    className="block text-xs font-bold text-brand-gold hover:underline mt-1"
                  >
                    {pick(lang, common.bookDeal)} →
                  </Link>
                </div>
              </div>
            </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      <TravelTestimonials />

      {/* TRUST & COMPLIANCE BADGES */}
      <section className="bg-slate-900 py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-15" style={{ backgroundImage: `url('${travelImages.visa}')` }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="st-reveal grid gap-8 md:grid-cols-3 text-center items-center">
            <div className="p-4 flex flex-col items-center">
              <Award className="h-12 w-12 text-brand-gold mb-3" />
              <h4 className="text-lg font-bold">{pick(lang, home.trustAtab)}</h4>
              <p className="text-xs text-slate-400 mt-2 max-w-xs">{pick(lang, home.trustAtabDesc)}</p>
            </div>
            <div className="p-4 flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-brand-gold mb-3" />
              <h4 className="text-lg font-bold">{pick(lang, home.trustNbr)}</h4>
              <p className="text-xs text-slate-400 mt-2 max-w-xs">{pick(lang, home.trustNbrDesc)}</p>
            </div>
            <div className="p-4 flex flex-col items-center">
              <Shield className="h-12 w-12 text-brand-gold mb-3" />
              <h4 className="text-lg font-bold">{pick(lang, home.trustSsl)}</h4>
              <p className="text-xs text-slate-400 mt-2 max-w-xs">{pick(lang, home.trustSslDesc)}</p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </GsapRoot>
  );
}
