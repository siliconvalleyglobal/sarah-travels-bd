"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { travelImages } from "@/lib/travelImages";
import { useLanguage } from "@/components/LanguageProvider";
import { bentoSection, bentoTiles } from "@/lib/i18n/translations";
import { pick } from "@/lib/i18n/types";

const TILE_IMAGES = [
  travelImages.flights,
  travelImages.hotels,
  travelImages.visa,
  travelImages.umrah,
  travelImages.tours,
  travelImages.cars,
] as const;

export function ImageBentoGrid() {
  const { lang } = useLanguage();

  return (
    <section className="bg-white py-20 lg:py-28 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="st-reveal mb-12 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">
            {pick(lang, bentoSection.eyebrow)}
          </span>
          <h2 className="section-title mt-3">
            {pick(lang, bentoSection.titleLead)}
            <span className="gradient-text">{pick(lang, bentoSection.titleHighlight)}</span>
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          {bentoTiles.map((tile, i) => (
            <Link
              key={tile.href}
              href={tile.href}
              className={`st-reveal group relative overflow-hidden rounded-2xl border border-slate-200 shadow-soft transition-shadow hover:shadow-elevated ${
                "large" in tile && tile.large ? "sm:col-span-2 lg:row-span-1" : ""
              }`}
            >
              <div className={`relative ${"large" in tile && tile.large ? "aspect-[21/9]" : "aspect-[4/3]"}`}>
                <Image
                  src={TILE_IMAGES[i]}
                  alt={pick(lang, tile.title)}
                  fill
                  className="st-shot object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h3 className="font-display text-lg font-extrabold">{pick(lang, tile.title)}</h3>
                  <p className="mt-1 text-xs text-white/70">{pick(lang, tile.sub)}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-gold opacity-0 transition-opacity group-hover:opacity-100">
                    {lang === "en" ? "Explore" : "দেখুন"} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
