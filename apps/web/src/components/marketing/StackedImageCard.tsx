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
      <div className="absolute -bottom-3 -left-3 h-full w-full rounded-3xl bg-brand-gold/80 -z-10" />
      <div className="relative overflow-hidden rounded-3xl border-2 border-white/20 shadow-elevated ring-1 ring-white/10">
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
