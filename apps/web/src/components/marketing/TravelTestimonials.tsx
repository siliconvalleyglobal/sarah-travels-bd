"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { travelImages } from "@/lib/travelImages";
import { useLanguage } from "@/components/LanguageProvider";
import { testimonials } from "@/lib/i18n/translations";
import { pick } from "@/lib/i18n/types";

const STORY_IMAGES = [
  travelImages.testimonial1,
  travelImages.testimonial2,
  travelImages.testimonial3,
] as const;

export function TravelTestimonials() {
  const { lang } = useLanguage();
  const [active, setActive] = useState(0);
  const story = testimonials.stories[active];

  return (
    <section className="bg-slate-50 py-20 lg:py-28 border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="st-reveal text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">
            {pick(lang, testimonials.eyebrow)}
          </span>
          <h2 className="section-title mt-3">
            {pick(lang, testimonials.titleLead)}
            <span className="gradient-text">{pick(lang, testimonials.titleHighlight)}</span>
          </h2>
        </div>

        <div className="st-reveal mt-8 flex flex-wrap justify-center gap-2">
          {testimonials.stories.map((s, i) => (
            <button
              key={s.company.en}
              onClick={() => setActive(i)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
                active === i
                  ? "bg-brand-navy text-white shadow-elevated"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-brand-gold"
              }`}
            >
              {pick(lang, s.company)}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="st-reveal mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-elevated"
          >
            <div className="grid lg:grid-cols-5 min-h-[320px]">
              <div className="relative lg:col-span-2 min-h-[240px] lg:min-h-0">
                <Image src={STORY_IMAGES[active]} alt={pick(lang, story.person)} fill className="st-shot object-cover" sizes="40vw" />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent to-brand-navy/20" />
                <div className="absolute bottom-4 left-4 rounded-xl bg-brand-navy/90 px-4 py-3 text-white backdrop-blur-sm">
                  <p className="font-display text-2xl font-extrabold text-brand-gold">{story.stat}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/70">{pick(lang, story.statLabel)}</p>
                </div>
              </div>
              <div className="flex flex-col justify-center p-8 lg:col-span-3 lg:p-12">
                <Quote className="h-8 w-8 text-brand-gold/40" />
                <p className="mt-4 text-lg leading-relaxed text-slate-700 font-medium">
                  &ldquo;{pick(lang, story.quote)}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div>
                    <p className="font-display font-extrabold text-brand-navy">{pick(lang, story.person)}</p>
                    <p className="text-sm text-slate-500">{pick(lang, story.role)}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5 text-brand-gold">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
