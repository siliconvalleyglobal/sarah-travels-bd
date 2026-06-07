"use client";

import Image from "next/image";

interface StackedImageCardProps {
  src: string;
  alt: string;
  className?: string;
  heroAnim?: boolean;
  priority?: boolean;
}

export function StackedImageCard({ src, alt, className, heroAnim, priority }: StackedImageCardProps) {
  return (
    <div className={`relative ${heroAnim ? "st-hero-image-anim" : ""} ${className ?? ""}`}>
      <div className="absolute -bottom-2 -left-2 h-full w-full rounded-2xl bg-brand-gold/50 -z-10 sm:-bottom-3 sm:-left-3 sm:rounded-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 shadow-elevated ring-1 ring-white/40 sm:rounded-3xl">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="st-shot object-cover will-change-transform"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/50 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}
