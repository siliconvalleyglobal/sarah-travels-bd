import React from "react";
import { LogoMark } from "@/components/brand/LogoMark";

interface SarahLogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function SarahLogo({ className = "h-8 w-auto", iconOnly = false }: SarahLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoMark className="h-7 w-7 shrink-0" wingFill="#D4AF37" bodyFill="currentColor" />
      
      {!iconOnly && (
        <span className="flex flex-col leading-none text-left">
          <span className="font-display text-lg font-extrabold tracking-tight text-white sm:text-xl">
            SARAH
          </span>
          <span className="type-label mt-1 text-brand-gold tracking-[0.18em]">
            TRAVELS BD
          </span>
        </span>
      )}
    </div>
  );
}
