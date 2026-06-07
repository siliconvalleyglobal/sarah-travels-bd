"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Plane, Globe2, MapPin, Luggage, Compass } from "lucide-react";

const ICONS = [
  { Icon: Plane, className: "left-[6%] top-[18%] rotate-[-18deg]", size: 48 },
  { Icon: Globe2, className: "right-[8%] top-[12%] rotate-[12deg]", size: 56 },
  { Icon: MapPin, className: "left-[14%] bottom-[22%] rotate-[8deg]", size: 40 },
  { Icon: Luggage, className: "right-[12%] bottom-[28%] rotate-[-10deg]", size: 44 },
  { Icon: Compass, className: "right-[22%] top-[42%] rotate-[22deg]", size: 36 },
] as const;

export function HeroGraffiti() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const items = root.querySelectorAll(".st-graffiti");
      gsap.to(items, {
        y: "+=18",
        rotation: "+=6",
        duration: 3.2,
        ease: "sine.inOut",
        stagger: { each: 0.4, from: "random" },
        repeat: -1,
        yoyo: true,
      });

      gsap.from(items, {
        opacity: 0,
        scale: 0.85,
        duration: 1,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.3,
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {ICONS.map(({ Icon, className, size }, i) => (
        <div
          key={i}
          className={`st-graffiti absolute text-white/10 ${className}`}
        >
          <Icon style={{ width: size, height: size }} strokeWidth={1.25} />
        </div>
      ))}
      <svg className="st-graffiti absolute left-[4%] top-[55%] h-24 w-24 text-white/[0.06]" viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 8" />
      </svg>
      <svg className="st-graffiti absolute right-[4%] bottom-[12%] h-32 w-32 text-brand-gold/[0.08]" viewBox="0 0 120 120" fill="none">
        <path d="M10 60 Q60 10 110 60 Q60 110 10 60" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
