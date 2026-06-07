"use client";

import Image from "next/image";
import { Plane } from "lucide-react";
import { travelImages } from "@/lib/travelImages";
import { useLanguage } from "@/components/LanguageProvider";
import { heroCollage } from "@/lib/i18n/translations";
import { pick } from "@/lib/i18n/types";
import { StackedImageCard } from "./StackedImageCard";

const destinations = [
  { src: travelImages.makkah, label: "Umrah", alt: "Umrah packages" },
  { src: travelImages.dubai, label: "Dubai", alt: "Dubai stays" },
  { src: travelImages.singapore, label: "Singapore", alt: "Singapore travel" },
];

export function HeroImageCollage() {
  const { lang } = useLanguage();

  return (
    <div className="flex flex-col gap-4 xl:sticky xl:top-28">
      <StackedImageCard
        src={travelImages.heroStack1}
        alt="Travel destinations worldwide"
        priority
        heroAnim
        className="w-full"
      />

      <div className="grid grid-cols-3 gap-2.5">
        {destinations.map((d) => (
          <div
            key={d.label}
            className="group relative overflow-hidden rounded-xl shadow-soft ring-1 ring-slate-200/70"
          >
            <div className="relative aspect-[3/4]">
              <Image
                src={d.src}
                alt={d.alt}
                fill
                className="st-shot object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 1280px) 25vw, 15vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/15 to-transparent" />
              <p className="absolute bottom-2 left-2 right-2 text-center text-[10px] font-bold uppercase tracking-wide text-white">
                {d.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-brand-gold/30 bg-white/80 px-4 py-3.5 shadow-soft backdrop-blur-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-brand-gold">
          <Plane className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-navy">{pick(lang, heroCollage.trusted)}</p>
          <p className="truncate text-sm text-slate-600">{pick(lang, heroCollage.services)}</p>
        </div>
      </div>
    </div>
  );
}
