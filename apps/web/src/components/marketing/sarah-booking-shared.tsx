"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Calendar, ChevronDown, Minus, Plus, Search, Users } from "lucide-react";
import { DESTINATIONS } from "@/lib/hotels-data";
import type { GuestConfig } from "@/components/GuestRoomPicker";
import { SarahTabIcon } from "./sarah-booking-icons";

export const SARAH_BOOKING_ACCENT = "#2283DF";
export const SARAH_BOOKING_ACCENT_HOVER = "#1a6fc7";
export const SARAH_BOOKING_BORDER = "#dfe0e4";

export type SarahBookingTabId =
  | "hotels"
  | "homes"
  | "flight-hotel"
  | "flights"
  | "activities"
  | "transfers";

export type StayMode = "overnight" | "dayuse";
export type TripType = "oneway" | "roundtrip";

export const SARAH_BOOKING_TABS: {
  id: SarahBookingTabId;
  label: string;
  shortLabel?: string;
  badge?: string;
  bundleLabel?: string;
}[] = [
  { id: "hotels", label: "Hotels" },
  { id: "homes", label: "Homes & Apts", shortLabel: "Homes" },
  { id: "flight-hotel", label: "Flight + Hotel", shortLabel: "Fly+Hotel", bundleLabel: "Bundle & Save" },
  { id: "flights", label: "Flights", badge: "New!" },
  { id: "activities", label: "Activities", shortLabel: "Tours" },
  { id: "transfers", label: "Airport transfer", shortLabel: "Transfers" },
];

const RECENT_KEY = "sarah-recent-destinations";

export function defaultCheckIn() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

export function defaultCheckOut() {
  const d = new Date();
  d.setDate(d.getDate() + 9);
  return d.toISOString().split("T")[0];
}

export function formatStayDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return {
    main: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    sub: d.toLocaleDateString("en-US", { weekday: "long" }),
  };
}

export function formatFlightDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** Agoda-like field text: 17px Inter, #333 primary */
export const sarahBookingInputClass =
  "w-full bg-transparent text-[17px] font-normal leading-snug text-[#333] placeholder:text-[15px] placeholder:text-[#9ca3af] focus:outline-none";

export const sarahBookingValueClass =
  "text-[17px] font-semibold leading-snug text-[#333]";

export const sarahBookingMetaClass =
  "text-sm leading-snug text-[#717171]";

export const sarahBookingLabelClass =
  "text-[13px] font-semibold uppercase tracking-wide text-[#9ca3af]";

function saveRecentDestination(name: string) {
  try {
    const prev: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    const next = [name, ...prev.filter((x) => x !== name)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function loadRecentDestinations(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

export function SarahTabBar({
  active,
  onChange,
}: {
  active: SarahBookingTabId;
  onChange: (id: SarahBookingTabId) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<SarahBookingTabId, HTMLButtonElement>>>({});
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollHint = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollWidth - el.scrollLeft - el.clientWidth > 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollHint();
    el.addEventListener("scroll", updateScrollHint, { passive: true });
    window.addEventListener("resize", updateScrollHint);
    return () => {
      el.removeEventListener("scroll", updateScrollHint);
      window.removeEventListener("resize", updateScrollHint);
    };
  }, [updateScrollHint]);

  useEffect(() => {
    tabRefs.current[active]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
    updateScrollHint();
  }, [active, updateScrollHint]);

  return (
    <div className="relative border-b border-[#e8e8e8]">
      <div
        ref={scrollRef}
        className="grid grid-cols-3 divide-x divide-y divide-[#e8e8e8] sm:flex sm:divide-y-0 sm:snap-x sm:snap-mandatory sm:scroll-px-3 sm:overflow-x-auto sm:scroll-smooth sm:pr-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {SARAH_BOOKING_TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                if (node) tabRefs.current[tab.id] = node;
              }}
              type="button"
              onClick={() => onChange(tab.id)}
              className="relative flex min-h-[104px] flex-col items-center justify-center px-2 py-4 transition touch-manipulation sm:min-h-[112px] sm:w-[124px] sm:shrink-0 sm:snap-center md:min-h-[116px] md:flex-1 md:min-w-[118px] md:max-w-[168px]"
            >
              {tab.bundleLabel && (
                <span className="mb-1 text-[11px] font-bold leading-none text-[#7c3aed]">
                  {tab.bundleLabel}
                </span>
              )}
              <SarahTabIcon id={tab.id} active={isActive} />
              <span
                className="mt-2 flex max-w-full flex-col items-center gap-1 text-center text-[13px] font-semibold leading-snug sm:text-sm"
                style={{ color: isActive ? SARAH_BOOKING_ACCENT : "#717171" }}
              >
                <span className="line-clamp-2 px-0.5">{tab.label}</span>
                {tab.badge && (
                  <span className="rounded-sm bg-[#e12d2d] px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-white">
                    {tab.badge}
                  </span>
                )}
              </span>
              <span
                className="absolute bottom-0 left-2 right-2 h-[3px] rounded-t-sm transition"
                style={{ backgroundColor: isActive ? SARAH_BOOKING_ACCENT : "transparent" }}
              />
            </button>
          );
        })}
      </div>

      {canScrollRight && (
        <div
          className="pointer-events-none absolute bottom-0 right-0 top-0 hidden w-10 items-center justify-end bg-gradient-to-l from-white via-white/90 to-transparent pr-1 sm:flex md:hidden"
          aria-hidden
        >
          <ChevronDown className="h-4 w-4 -rotate-90 text-[#9ca3af]" />
        </div>
      )}
    </div>
  );
}

export function SarahPillToggle<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  labels: Record<T, string>;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className="rounded-full border px-5 py-2.5 text-[15px] font-semibold transition sm:text-base"
          style={{
            borderColor: value === opt ? SARAH_BOOKING_ACCENT : SARAH_BOOKING_BORDER,
            color: value === opt ? SARAH_BOOKING_ACCENT : "#333",
          }}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  );
}

export function SarahUnderlineToggle<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  labels: Record<T, string>;
}) {
  return (
    <div className="mb-5 flex gap-6">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className="border-b-2 pb-2 text-[15px] font-semibold transition sm:text-base"
          style={{
            color: value === opt ? SARAH_BOOKING_ACCENT : "#717171",
            borderBottomColor: value === opt ? SARAH_BOOKING_ACCENT : "transparent",
          }}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  );
}

export function SarahFieldRow({
  children,
  searchLabel,
  searchShortLabel,
}: {
  children: React.ReactNode;
  searchLabel: string;
  searchShortLabel?: string;
}) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-lg bg-white md:min-h-[96px] md:flex-row md:items-stretch"
      style={{ border: `1px solid ${SARAH_BOOKING_BORDER}` }}
    >
      <div className="flex flex-1 flex-col md:flex-row md:divide-x md:divide-[#dfe0e4]">
        {children}
      </div>
      <SarahSearchButton label={searchLabel} shortLabel={searchShortLabel} />
    </div>
  );
}

export function SarahField({
  label,
  children,
  className = "",
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col justify-center border-b px-5 py-4 last:border-b-0 sm:px-6 sm:py-5 md:border-b-0 ${className}`}
      style={{ borderColor: SARAH_BOOKING_BORDER }}
    >
      {label && (
        <span className={`mb-1.5 ${sarahBookingLabelClass}`}>
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

export function SarahSearchButton({ label, shortLabel }: { label: string; shortLabel?: string }) {
  const compact = shortLabel ?? label;
  return (
    <button
      type="submit"
      className="flex min-h-[56px] w-full shrink-0 touch-manipulation items-center justify-center px-6 py-4 text-[15px] font-bold uppercase tracking-[0.06em] text-white transition md:min-h-[96px] md:w-[148px] md:px-4 md:text-base md:py-0"
      style={{ backgroundColor: SARAH_BOOKING_ACCENT }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = SARAH_BOOKING_ACCENT_HOVER;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = SARAH_BOOKING_ACCENT;
      }}
    >
      <span className="md:hidden">{compact}</span>
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

export function SarahSearchButtonWide({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="mt-5 flex w-full touch-manipulation items-center justify-center rounded-full py-4 text-[15px] font-bold uppercase tracking-[0.12em] text-white transition hover:opacity-95 sm:mt-6 sm:py-[1.125rem] sm:text-base"
      style={{ backgroundColor: SARAH_BOOKING_ACCENT }}
    >
      {label}
    </button>
  );
}

export function SarahDateField({
  value,
  onChange,
  min,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
}) {
  const { main, sub } = formatStayDate(value);
  return (
    <label className="relative block cursor-pointer">
      <div className="pointer-events-none">
        <div className={sarahBookingValueClass}>{main}</div>
        <div className={sarahBookingMetaClass}>{sub}</div>
      </div>
      <input
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        required
      />
    </label>
  );
}

export function SarahFlightDateField({
  value,
  onChange,
  min,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
}) {
  return (
    <label className="relative block cursor-pointer">
      <div className={`pointer-events-none ${sarahBookingValueClass}`}>
        {formatFlightDate(value)}
      </div>
      <input
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        required
      />
    </label>
  );
}

export function SarahCounterField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const display =
    label === "Passenger"
      ? `${value} Passenger${value > 1 ? "s" : ""}`
      : `${value} Room${value > 1 ? "s" : ""}`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className={sarahBookingValueClass}>{display}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#9ca3af] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 w-full min-w-0 rounded-lg border border-[#dfe0e4] bg-white p-4 shadow-xl sm:left-auto sm:right-0 sm:w-auto sm:min-w-[200px]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#333]">{label}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => value > min && onChange(value - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dfe0e4] hover:bg-slate-50"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-bold">{value}</span>
              <button
                type="button"
                onClick={() => value < max && onChange(value + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dfe0e4] hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SarahGuestField({
  value,
  onChange,
  compact = false,
}: {
  value: GuestConfig;
  onChange: (v: GuestConfig) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function adjust(field: keyof GuestConfig, delta: number) {
    const next = { ...value, [field]: value[field] + delta };
    if (next.rooms < 1 || next.rooms > 8) return;
    if (next.adults < 1 || next.adults > 16) return;
    if (next.children < 0 || next.children > 8) return;
    onChange(next);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        {compact ? (
          <span className={sarahBookingValueClass}>
            {value.adults} adult{value.adults !== 1 ? "s" : ""}, {value.rooms} room{value.rooms !== 1 ? "s" : ""}
          </span>
        ) : (
          <div>
            <div className={sarahBookingValueClass}>
              {value.adults} adult{value.adults > 1 ? "s" : ""}
            </div>
            <div className={sarahBookingMetaClass}>
              {value.rooms} room{value.rooms > 1 ? "s" : ""}
            </div>
          </div>
        )}
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#9ca3af] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 w-full min-w-0 rounded-lg border border-[#dfe0e4] bg-white p-4 shadow-xl sm:left-auto sm:right-0 sm:w-auto sm:min-w-[280px]">
          {(["rooms", "adults", "children"] as const).map((field) => (
            <div key={field} className="mb-3 flex items-center justify-between last:mb-0">
              <span className="text-sm font-semibold capitalize text-[#333]">{field}</span>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => adjust(field, -1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dfe0e4] hover:bg-slate-50">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-bold">{value[field]}</span>
                <button type="button" onClick={() => adjust(field, 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dfe0e4] hover:bg-slate-50">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setOpen(false)} className="mt-3 w-full rounded-md py-2.5 text-xs font-bold text-white" style={{ backgroundColor: SARAH_BOOKING_ACCENT }}>
            Done
          </button>
        </div>
      )}
    </div>
  );
}

export function SarahPassengerField({
  passengers,
  cabin,
  onPassengersChange,
  onCabinChange,
}: {
  passengers: number;
  cabin: string;
  onPassengersChange: (n: number) => void;
  onCabinChange: (c: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} className={`flex w-full min-w-0 items-center justify-between gap-2 text-left ${sarahBookingValueClass}`}>
        <span className="truncate">{passengers} Passenger{passengers > 1 ? "s" : ""}, {cabin}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#9ca3af] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 w-full min-w-0 rounded-lg border border-[#dfe0e4] bg-white p-4 shadow-xl sm:left-auto sm:right-0 sm:w-auto sm:min-w-[260px]">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#333]">Passengers</span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => passengers > 1 && onPassengersChange(passengers - 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dfe0e4]">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-bold">{passengers}</span>
              <button type="button" onClick={() => passengers < 9 && onPassengersChange(passengers + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dfe0e4]">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <select value={cabin} onChange={(e) => onCabinChange(e.target.value)} className="w-full rounded-md border border-[#dfe0e4] px-3 py-2 text-sm">
            <option value="Economy">Economy</option>
            <option value="Premium Economy">Premium Economy</option>
            <option value="Business">Business</option>
            <option value="First">First</option>
          </select>
          <button type="button" onClick={() => setOpen(false)} className="mt-3 w-full rounded-md py-2.5 text-xs font-bold text-white" style={{ backgroundColor: SARAH_BOOKING_ACCENT }}>
            Done
          </button>
        </div>
      )}
    </div>
  );
}

export function SarahDestinationField({
  value,
  onChange,
  onSelect,
  onFocusChange,
  placeholder = "Search city, hotel or area",
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (name: string) => void;
  onFocusChange?: (focused: boolean) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [recents, setRecents] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecents(loadRecentDestinations());
  }, []);

  const filtered = DESTINATIONS.filter(
    (d) =>
      !value ||
      d.name.toLowerCase().includes(value.toLowerCase()) ||
      d.country.toLowerCase().includes(value.toLowerCase()),
  ).slice(0, 8);

  const showRecents = open && !value && recents.length > 0;
  const items = showRecents
    ? recents.map((name) => ({ id: name, name, country: "Recent search", icon: "🕐" }))
    : filtered;

  const pick = useCallback(
    (name: string) => {
      onSelect(name);
      onChange(name);
      saveRecentDestination(name);
      setRecents(loadRecentDestinations());
      setOpen(false);
      onFocusChange?.(false);
    },
    [onChange, onFocusChange, onSelect],
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        onFocusChange?.(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onFocusChange]);

  return (
    <div ref={ref} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => {
          setOpen(true);
          onFocusChange?.(true);
        }}
        onKeyDown={(e) => {
          if (!open || !items.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => (h + 1) % items.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => (h - 1 + items.length) % items.length);
          } else if (e.key === "Enter" && items[highlight]) {
            e.preventDefault();
            pick(items[highlight].name);
          } else if (e.key === "Escape") {
            setOpen(false);
            onFocusChange?.(false);
          }
        }}
        placeholder={placeholder}
        className={sarahBookingInputClass}
        aria-label="Destination"
        autoComplete="off"
      />
      {open && items.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-[60] mt-1 max-h-56 divide-y divide-slate-100 overflow-y-auto overscroll-contain rounded-md border border-[#dfe0e4] bg-white shadow-xl">
          {showRecents && (
            <div className="bg-[#f5f8fc] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#717171]">
              Recent searches
            </div>
          )}
          {items.map((d, i) => (
            <button
              key={d.id}
              type="button"
              onMouseEnter={() => setHighlight(i)}
              onClick={() => pick(d.name)}
              className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm ${i === highlight ? "bg-[#e8f4fc]" : "hover:bg-[#f5f8fc]"}`}
            >
              <span>{d.icon}</span>
              <span className="font-semibold text-[#333]">{d.name}</span>
              {!showRecents && <span className="text-[#717171]">{d.country}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SarahAccommodationForm({
  stayMode,
  onStayModeChange,
  showStayToggle = true,
  showAddFlight = true,
  propertyType,
  searchHref,
  onSubmit,
  onFocusChange,
}: {
  stayMode: StayMode;
  onStayModeChange: (m: StayMode) => void;
  showStayToggle?: boolean;
  showAddFlight?: boolean;
  propertyType?: "hotels" | "homes";
  searchHref?: (params: Record<string, string>) => string;
  onSubmit?: (params: Record<string, string>) => void;
  onFocusChange?: (focused: boolean) => void;
}) {
  const [destination, setDestination] = useState("");
  const [destInput, setDestInput] = useState("");
  const [checkIn, setCheckIn] = useState(defaultCheckIn());
  const [checkOut, setCheckOut] = useState(defaultCheckOut());
  const [guests, setGuests] = useState<GuestConfig>({ rooms: 1, adults: 1, children: 0 });
  const [addFlight, setAddFlight] = useState(false);
  const [flightOrigin, setFlightOrigin] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const city = destination || destInput;
        if (!city.trim()) return;
        const params: Record<string, string> = {
          city,
          checkIn,
          checkOut: stayMode === "dayuse" ? checkIn : checkOut,
          rooms: String(guests.rooms),
          adults: String(guests.adults),
          children: String(guests.children),
          stayMode,
        };
        if (propertyType === "homes") params.type = "homes";
        if (addFlight) {
          params.addFlight = "1";
          if (flightOrigin) params.origin = flightOrigin;
        }
        if (onSubmit) onSubmit(params);
        else if (searchHref) window.location.href = searchHref(params);
      }}
    >
      {showStayToggle && (
        <SarahPillToggle
          options={["overnight", "dayuse"] as StayMode[]}
          value={stayMode}
          onChange={onStayModeChange}
          labels={{ overnight: "Overnight Stays", dayuse: "Day Use Stays" }}
        />
      )}

      <div
        className="overflow-hidden rounded-lg bg-white"
        style={{ border: `1px solid ${SARAH_BOOKING_BORDER}` }}
      >
        <div
          className="flex items-center gap-4 px-4 py-4 sm:px-6 sm:py-5"
          style={{ borderBottom: `1px solid ${SARAH_BOOKING_BORDER}` }}
        >
          <Search className="h-6 w-6 shrink-0 text-[#9ca3af]" strokeWidth={2} />
          <div className="min-w-0 flex-1">
            <SarahDestinationField
              value={destInput}
              onChange={setDestInput}
              onSelect={setDestination}
              onFocusChange={onFocusChange}
            />
          </div>
        </div>

        <div className="flex flex-col divide-y divide-[#dfe0e4] md:flex-row md:divide-x md:divide-y-0">
          <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4 sm:px-6 sm:py-5">
            <Calendar className="h-6 w-6 shrink-0 text-[#9ca3af]" strokeWidth={2} />
            <div className="min-w-0 flex-1">
              <SarahDateField value={checkIn} onChange={setCheckIn} />
            </div>
          </div>

          {stayMode === "overnight" && (
            <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4 sm:px-6 sm:py-5">
              <Calendar className="h-6 w-6 shrink-0 text-[#9ca3af]" strokeWidth={2} />
              <div className="min-w-0 flex-1">
                <SarahDateField value={checkOut} onChange={setCheckOut} min={checkIn} />
              </div>
            </div>
          )}

          <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4 sm:px-6 sm:py-5">
            <Users className="h-6 w-6 shrink-0 text-[#9ca3af]" strokeWidth={2} />
            <div className="min-w-0 flex-1">
              <SarahGuestField value={guests} onChange={setGuests} compact />
            </div>
          </div>
        </div>

        {addFlight && showAddFlight && (
          <div
            className="flex flex-col gap-2 px-3 py-3.5 sm:flex-row sm:items-center sm:gap-3 sm:px-4 sm:py-4"
            style={{ borderTop: `1px solid ${SARAH_BOOKING_BORDER}` }}
          >
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Flying from</span>
            <input
              type="text"
              value={flightOrigin}
              onChange={(e) => setFlightOrigin(e.target.value)}
              placeholder="City or airport"
              className={sarahBookingInputClass}
            />
          </div>
        )}
      </div>

      {showAddFlight && (
        <button
          type="button"
          onClick={() => setAddFlight(!addFlight)}
          className="mt-3 text-[15px] font-semibold transition hover:underline"
          style={{ color: SARAH_BOOKING_ACCENT }}
        >
          {addFlight ? "− Remove flight" : "+ Add a flight"}
        </button>
      )}

      <SarahSearchButtonWide label="SEARCH" />
    </form>
  );
}
