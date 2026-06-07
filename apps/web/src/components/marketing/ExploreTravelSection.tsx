"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Hotel, FileText, Moon, Compass, Check, ArrowRight } from "lucide-react";
import { travelImages } from "@/lib/travelImages";

const TABS = [
  {
    id: "flights",
    short: "Flights",
    icon: Plane,
    title: "Search 6+ airlines with transparent BDT pricing",
    bullets: ["Amadeus-powered mock search with live PNR generation", "Service fee + VAT breakdown before checkout", "bKash, Nagad, SSLCommerz sandbox payments", "Instant e-ticket confirmation on payment"],
    image: travelImages.flights,
    href: "/flights",
    cta: "Search Flights",
  },
  {
    id: "hotels",
    short: "Hotels",
    icon: Hotel,
    title: "Premium stays from Dubai to Cox's Bazar",
    bullets: ["Agoda-style search with filters and map view", "Room-level booking with confirmation codes", "Deal badges and amenity filters", "My Bookings integration"],
    image: travelImages.hotels,
    href: "/hotels",
    cta: "Find Hotels",
  },
  {
    id: "visa",
    short: "Visa",
    icon: FileText,
    title: "End-to-end visa with document upload",
    bullets: ["5-step wizard: checklist → photo → form → pay", "Regulatory photo cropper simulation", "Passport & bank statement upload to API", "Live application status tracking"],
    image: travelImages.visa,
    href: "/visa",
    cta: "Apply for Visa",
  },
  {
    id: "umrah",
    short: "Umrah",
    icon: Moon,
    title: "Complete packages with installment plans",
    bullets: ["Economy to Premium 7–14 day packages", "30% down-payment to confirm booking", "Makkah & Madinah hotel distance verified", "Pilgrim document collection"],
    image: travelImages.umrah,
    href: "/umrah",
    cta: "View Packages",
  },
  {
    id: "tours",
    short: "Tours",
    icon: Compass,
    title: "Guided Bangladesh & international tours",
    bullets: ["Cox's Bazar, Sundarbans, Sylhet, Maldives", "Itinerary timelines and inclusions", "Per-guest pricing with service fee", "Instant confirmation on payment"],
    image: travelImages.tours,
    href: "/tours",
    cta: "Explore Tours",
  },
] as const;

export function ExploreTravelSection({ lang }: { lang: "en" | "bn" }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const tab = TABS[active];

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % TABS.length), 5500);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section id="journey" className="border-b border-slate-200 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="st-reveal mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">Full Travel Platform</span>
          <h2 className="section-title mt-3">
            {lang === "en" ? "Everything you need to " : "ভ্রমণের জন্য "}
            <span className="gradient-text">{lang === "en" ? "book & go" : "সবকিছু এক জায়গায়"}</span>
          </h2>
          <p className="mt-4 text-slate-600">
            {lang === "en"
              ? "Flights, hotels, visa, Umrah, tours and transfers — one account, one checkout flow, full booking history."
              : "ফ্লাইট, হোটেল, ভিসা, উমরাহ, ট্যুর ও গাড়ি — একটি অ্যাকাউন্টে সব বুকিং।"}
          </p>
        </div>

        {/* Tab bar */}
        <div
          className="st-reveal mt-10 flex flex-wrap justify-center gap-1 border-b border-slate-200"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {TABS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-colors relative ${
                active === i ? "text-brand-navy" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.short}
              {active === i && (
                <motion.span
                  layoutId="travel-tab-indicator"
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-gold rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab panel */}
        <div className="st-reveal mt-10 overflow-hidden rounded-3xl border border-slate-200 shadow-elevated">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="grid lg:grid-cols-2 min-h-[400px]"
            >
              <div className="flex flex-col justify-center bg-brand-navy p-8 lg:p-12 text-white">
                <tab.icon className="h-8 w-8 text-brand-gold mb-4" />
                <h3 className="font-display text-2xl font-extrabold leading-tight lg:text-3xl">{tab.title}</h3>
                <ul className="mt-6 flex flex-col gap-3">
                  {tab.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-white/85">
                      <Check className="h-4 w-4 shrink-0 text-brand-gold mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link href={tab.href} className="btn-gold mt-8 w-fit !text-sm">
                  {tab.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="relative bg-slate-100 p-6 lg:p-10 flex items-center justify-center">
                <div className="absolute -bottom-3 -left-3 h-[90%] w-[90%] rounded-2xl bg-brand-gold/40" />
                <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 shadow-elevated ring-1 ring-slate-200/70">
                  <div className="relative aspect-[16/10]">
                    <Image src={tab.image} alt={tab.short} fill className="st-shot object-cover" sizes="50vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/30 to-transparent" />
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
