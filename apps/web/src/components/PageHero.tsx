"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  backgroundImage?: string;
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function PageHero({ title, subtitle, icon: Icon, badge, backgroundImage, children, className, compact }: PageHeroProps) {
  return (
    <section className={cn("hero-mesh relative overflow-hidden text-white", compact ? "py-12" : "py-16 lg:py-20", className)}>
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${backgroundImage}')` }}
          />
          <div className="absolute inset-0 bg-brand-navy/75" />
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-navy/40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          {badge && (
            <span className="mb-4 inline-flex rounded-full border border-brand-gold/40 bg-brand-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold">
              {badge}
            </span>
          )}
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            {Icon && <Icon className="mb-3 inline h-8 w-8 text-brand-gold sm:mr-3 sm:mb-0 sm:inline" />}
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">{subtitle}</p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </motion.div>
      </div>
    </section>
  );
}
