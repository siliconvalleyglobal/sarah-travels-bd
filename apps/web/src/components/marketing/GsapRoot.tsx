"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function GsapRoot({ children, className }: { children: React.ReactNode; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const bookingCard = q(".st-booking-card");
      if (bookingCard.length) {
        gsap.fromTo(
          bookingCard,
          { y: 32 },
          {
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            delay: 0.05,
            clearProps: "transform",
          },
        );
      }

      const heroEls = q(".st-hero-in:not(.st-booking-card .st-hero-in)");
      if (heroEls.length) {
        gsap.fromTo(
          heroEls,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.06,
            ease: "power2.out",
            delay: 0.1,
            clearProps: "opacity,transform",
          },
        );
      }

      const reveals = q(".st-reveal");
      if (reveals.length) {
        gsap.set(reveals, { y: 24, opacity: 0 });
        ScrollTrigger.batch(reveals, {
          onEnter: (batch) => {
            gsap.to(batch, {
              y: 0,
              opacity: 1,
              duration: 0.65,
              stagger: 0.07,
              ease: "power2.out",
              overwrite: "auto",
            });
          },
          start: "top 88%",
          once: true,
        });
      }

      const shots = q(".st-shot");
      const cleanupFns: Array<() => void> = [];
      if (shots.length) {
        gsap.set(shots, { y: 16, opacity: 0, scale: 0.98 });
        ScrollTrigger.batch(shots, {
          onEnter: (batch) => {
            gsap.to(batch, {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.7,
              stagger: 0.06,
              ease: "power2.out",
            });
          },
          start: "top 90%",
          once: true,
        });
        shots.forEach((node) => {
          const el = node as HTMLElement;
          const onEnter = () =>
            gsap.to(el, { scale: 1.03, y: -6, duration: 0.35, ease: "power2.out", overwrite: "auto" });
          const onMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            gsap.to(el, {
              x: px * 12,
              y: -6 + py * 8,
              duration: 0.25,
              ease: "power2.out",
              overwrite: "auto",
            });
          };
          const onLeave = () =>
            gsap.to(el, { scale: 1, x: 0, y: 0, duration: 0.4, ease: "power2.out", overwrite: "auto" });
          el.addEventListener("mouseenter", onEnter);
          el.addEventListener("mousemove", onMove);
          el.addEventListener("mouseleave", onLeave);
          cleanupFns.push(() => {
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mousemove", onMove);
            el.removeEventListener("mouseleave", onLeave);
          });
        });
      }

      const heroImg = q(".st-hero-image-anim");
      if (heroImg.length) {
        gsap.set(heroImg, {
          transformPerspective: 1200,
          y: -40,
          scale: 0.9,
          rotationX: 10,
          transformOrigin: "50% 50%",
        });
        gsap.to(heroImg, {
          y: 0,
          scale: 1,
          rotationX: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: heroImg[0],
            start: "top bottom",
            end: "center center",
            scrub: 1,
          },
        });
      }

      return () => cleanupFns.forEach((fn) => fn());
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
