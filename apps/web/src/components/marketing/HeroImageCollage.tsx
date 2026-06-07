"use client";

import Image from "next/image";
import { travelImages } from "@/lib/travelImages";

export function HeroImageCollage() {
  return (
    <div className="relative hidden lg:block h-[520px] w-full">
      {/* Main stacked card */}
      <div className="absolute right-0 top-0 w-[85%] st-hero-image-anim">
        <div className="absolute -bottom-4 -left-4 h-full w-full rounded-3xl bg-brand-gold/70 -z-10" />
        <div className="relative overflow-hidden rounded-3xl border border-white/20 shadow-elevated">
          <div className="relative aspect-[4/3]">
            <Image src={travelImages.hero} alt="International travel" fill priority className="st-shot object-cover" sizes="50vw" />
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy/40 to-transparent" />
          </div>
        </div>
      </div>

      {/* Floating accent cards */}
      <div className="absolute left-0 top-8 w-[42%] animate-float">
        <div className="overflow-hidden rounded-2xl border border-white/30 shadow-elevated ring-1 ring-white/10">
          <div className="relative aspect-[16/10]">
            <Image src={travelImages.makkah} alt="Umrah" fill className="st-shot object-cover" sizes="25vw" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-brand-navy/90 px-3 py-2 text-[10px] font-bold text-brand-gold uppercase tracking-wider">
            Umrah Packages
          </div>
        </div>
      </div>

      <div className="absolute left-[8%] bottom-4 w-[38%] animate-float" style={{ animationDelay: "1.5s" }}>
        <div className="overflow-hidden rounded-2xl border border-white/30 shadow-elevated ring-1 ring-white/10">
          <div className="relative aspect-[16/10]">
            <Image src={travelImages.dubai} alt="Dubai" fill className="st-shot object-cover" sizes="25vw" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-brand-navy/90 px-3 py-2 text-[10px] font-bold text-white uppercase tracking-wider">
            Dubai Stays
          </div>
        </div>
      </div>

      {/* Decorative orb */}
      <div className="absolute -right-8 top-1/3 h-32 w-32 rounded-full bg-brand-gold/20 blur-3xl animate-pulse-soft" />
    </div>
  );
}
