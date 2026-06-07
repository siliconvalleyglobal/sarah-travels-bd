"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Hotel, FileText, Moon, Compass, Check, ArrowRight } from "lucide-react";
import { travelImages } from "@/lib/travelImages";
import { useLanguage } from "@/components/LanguageProvider";
import { exploreSection } from "@/lib/i18n/translations";
import { pick } from "@/lib/i18n/types";

const TAB_ICONS = [Plane, Hotel, FileText, Moon, Compass] as const;
const TAB_IMAGES = [
  travelImages.flights,
  travelImages.hotels,
  travelImages.visa,
  travelImages.umrah,
  travelImages.tours,
] as const;

export function ExploreTravelSection() {
  const { lang } = useLanguage();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const tab = exploreSection.tabs[active];
  const Icon = TAB_ICONS[active];

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % exploreSection.tabs.length), 5500);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section id="journey" className="border-b border-slate-200 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="st-reveal mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">
            {pick(lang, exploreSection.eyebrow)}
          </span>
          <h2 className="section-title mt-3">
            {pick(lang, exploreSection.titleLead)}
            <span className="gradient-text">{pick(lang, exploreSection.titleHighlight)}</span>
          </h2>
          <p className="mt-4 text-slate-600">{pick(lang, exploreSection.subtitle)}</p>
        </div>

        <div
          className="st-reveal mt-10 flex flex-wrap justify-center gap-1 border-b border-slate-200"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {exploreSection.tabs.map((t, i) => {
            const TabIcon = TAB_ICONS[i];
            return (
              <button
                key={t.id}
                onClick={() => setActive(i)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-colors relative ${
                  active === i ? "text-brand-navy" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <TabIcon className="h-4 w-4" />
                {pick(lang, t.short)}
                {active === i && (
                  <motion.span
                    layoutId="travel-tab-indicator"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-gold rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

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
                <Icon className="h-8 w-8 text-brand-gold mb-4" />
                <h3 className="font-display text-2xl font-extrabold leading-tight lg:text-3xl">
                  {pick(lang, tab.title)}
                </h3>
                <ul className="mt-6 flex flex-col gap-3">
                  {tab.bullets[lang].map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-white/85">
                      <Check className="h-4 w-4 shrink-0 text-brand-gold mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link href={tab.href} className="btn-gold mt-8 w-fit !text-sm">
                  {pick(lang, tab.cta)} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="relative bg-slate-100 p-6 lg:p-10 flex items-center justify-center">
                <div className="absolute -bottom-3 -left-3 h-[90%] w-[90%] rounded-2xl bg-brand-gold/40" />
                <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 shadow-elevated ring-1 ring-slate-200/70">
                  <div className="relative aspect-[16/10]">
                    <Image src={TAB_IMAGES[active]} alt={pick(lang, tab.short)} fill className="st-shot object-cover" sizes="50vw" />
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
