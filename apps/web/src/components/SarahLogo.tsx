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
        <span className="text-xl font-black tracking-tight flex flex-col leading-none text-left">
          <span className="text-white flex items-center font-sans tracking-wide">
            SARAH
          </span>
          <span className="text-[9px] font-bold text-brand-gold uppercase tracking-[0.2em] font-sans mt-0.5">
            TRAVELS BD
          </span>
        </span>
      )}
    </div>
  );
}
