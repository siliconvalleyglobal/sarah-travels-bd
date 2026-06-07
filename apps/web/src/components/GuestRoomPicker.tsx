"use client";

import { useState, useRef, useEffect } from "react";
import { Users, Minus, Plus, ChevronDown } from "lucide-react";

export interface GuestConfig {
  rooms: number;
  adults: number;
  children: number;
}

interface GuestRoomPickerProps {
  value: GuestConfig;
  onChange: (config: GuestConfig) => void;
  variant?: "dark" | "light" | "agoda";
  className?: string;
}

export function GuestRoomPicker({ value, onChange, variant = "light", className = "" }: GuestRoomPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const label = `${value.rooms} Room${value.rooms > 1 ? "s" : ""}, ${value.adults} Adult${value.adults > 1 ? "s" : ""}${value.children > 0 ? `, ${value.children} Child${value.children > 1 ? "ren" : ""}` : ""}`;

  const btnClass =
    variant === "dark"
      ? "bg-brand-navy/60 border-white/20 text-white"
      : variant === "agoda"
        ? "border-0 bg-transparent p-0 text-sm font-medium text-slate-900 shadow-none"
        : "bg-white border-slate-200 text-slate-900";

  function adjust(field: keyof GuestConfig, delta: number) {
    const next = { ...value, [field]: value[field] + delta };
    if (next.rooms < 1 || next.rooms > 8) return;
    if (next.adults < 1 || next.adults > 16) return;
    if (next.children < 0 || next.children > 8) return;
    onChange(next);
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 border rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-brand-gold transition ${btnClass} ${variant === "agoda" ? "rounded-none px-0 py-0" : ""}`}
      >
        <span className={`flex items-center gap-2 truncate ${variant === "agoda" ? "gap-0" : ""}`}>
          {variant !== "agoda" && <Users className="h-4 w-4 shrink-0 text-brand-gold" />}
          <span className="truncate">{label}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-4 space-y-4 min-w-[280px]">
          {(["rooms", "adults", "children"] as const).map(field => (
            <div key={field} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900 capitalize">{field}</span>
                {field === "children" && <span className="text-[10px] text-slate-400 block">Ages 0-17</span>}
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => adjust(field, -1)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center font-bold text-sm">{value[field]}</span>
                <button type="button" onClick={() => adjust(field, 1)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setOpen(false)} className="w-full bg-brand-navy text-white text-xs font-bold py-2.5 rounded-lg hover:bg-opacity-95 transition">
            Done
          </button>
        </div>
      )}
    </div>
  );
}
