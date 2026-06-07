"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { DESTINATIONS } from "@/lib/hotels-data";
import type { GuestConfig } from "@/components/GuestRoomPicker";
import { AgodaTabIcon } from "./agoda-icons";

export const AGODA_BLUE = "#2283DF";
export const AGODA_BLUE_HOVER = "#1a6fc7";
export const AGODA_BORDER = "#dfe0e4";

export type AgodaTabId =
  | "hotels"
  | "homes"
  | "flight-hotel"
  | "flights"
  | "activities"
  | "transfers";

export type StayMode = "overnight" | "dayuse";
export type TripType = "oneway" | "roundtrip";

export const AGODA_TABS: {
  id: AgodaTabId;
  label: string;
  badge?: string;
  bundleLabel?: string;
}[] = [
  { id: "hotels", label: "Hotels" },
  { id: "homes", label: "Homes & Apts" },
  { id: "flight-hotel", label: "Flight + Hotel", bundleLabel: "Bundle & Save" },
  { id: "flights", label: "Flights", badge: "New!" },
  { id: "activities", label: "Activities" },
  { id: "transfers", label: "Airport transfer" },
];

const RECENT_KEY = "agoda-recent-destinations";

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

export function formatAgodaStayDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return {
    main: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    sub: d.toLocaleDateString("en-US", { weekday: "long" }),
  };
}

export function formatAgodaFlightDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export const agodaInputClass =
  "w-full bg-transparent text-[15px] font-normal text-[#333] placeholder:text-[#9ca3af] focus:outline-none";

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

export function AgodaTabBar({
  active,
  onChange,
}: {
  active: AgodaTabId;
  onChange: (id: AgodaTabId) => void;
}) {
  return (
    <div className="flex overflow-x-auto border-b border-[#e8e8e8]">
      {AGODA_TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className="relative flex min-w-[88px] flex-1 flex-col items-center px-2 pb-0 pt-4 transition sm:min-w-[100px]"
          >
            {tab.bundleLabel && (
              <span className="mb-0.5 text-[10px] font-bold leading-none text-[#7c3aed]">
                {tab.bundleLabel}
              </span>
            )}
            <AgodaTabIcon id={tab.id} active={isActive} />
            <span
              className="mt-1.5 flex items-center gap-1 pb-3 text-[11px] font-semibold sm:text-xs"
              style={{ color: isActive ? AGODA_BLUE : "#717171" }}
            >
              {tab.label}
              {tab.badge && (
                <span className="rounded-sm bg-[#e12d2d] px-1 py-px text-[8px] font-bold uppercase leading-none text-white">
                  {tab.badge}
                </span>
              )}
            </span>
            <span
              className="absolute bottom-0 left-2 right-2 h-[3px] rounded-t-sm transition"
              style={{ backgroundColor: isActive ? AGODA_BLUE : "transparent" }}
            />
          </button>
        );
      })}
    </div>
  );
}

export function AgodaUnderlineToggle<T extends string>({
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
          className="border-b-2 pb-1.5 text-sm font-semibold transition"
          style={{
            color: value === opt ? AGODA_BLUE : "#717171",
            borderBottomColor: value === opt ? AGODA_BLUE : "transparent",
          }}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  );
}

export function AgodaFieldRow({
  children,
  searchLabel,
}: {
  children: React.ReactNode;
  searchLabel: string;
}) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-md bg-white md:min-h-[76px] md:flex-row md:items-stretch"
      style={{ border: `1px solid ${AGODA_BORDER}` }}
    >
      <div className="flex flex-1 flex-col md:flex-row md:divide-x md:divide-[#dfe0e4]">
        {children}
      </div>
      <AgodaSearchButton label={searchLabel} />
    </div>
  );
}

export function AgodaField({
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
      className={`flex min-w-0 flex-1 flex-col justify-center border-b px-5 py-4 last:border-b-0 md:border-b-0 ${className}`}
      style={{ borderColor: AGODA_BORDER }}
    >
      {label && (
        <span className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af]">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

export function AgodaSearchButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="flex w-full shrink-0 items-center justify-center px-6 py-4 text-sm font-bold tracking-wider text-white transition md:w-[110px] md:px-0 md:py-0 lg:w-[120px]"
      style={{ backgroundColor: AGODA_BLUE }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = AGODA_BLUE_HOVER;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = AGODA_BLUE;
      }}
    >
      {label}
    </button>
  );
}

export function AgodaDateField({
  value,
  onChange,
  min,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
}) {
  const { main, sub } = formatAgodaStayDate(value);
  return (
    <label className="relative block cursor-pointer">
      <div className="pointer-events-none">
        <div className="text-[15px] font-semibold text-[#333]">{main}</div>
        <div className="text-xs text-[#717171]">{sub}</div>
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

export function AgodaFlightDateField({
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
      <div className="pointer-events-none text-[15px] font-semibold text-[#333]">
        {formatAgodaFlightDate(value)}
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

export function AgodaCounterField({
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
        <span className="text-[15px] font-semibold text-[#333]">{display}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#9ca3af] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[200px] rounded-lg border border-[#dfe0e4] bg-white p-4 shadow-xl">
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

export function AgodaGuestField({
  value,
  onChange,
}: {
  value: GuestConfig;
  onChange: (v: GuestConfig) => void;
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
        <div>
          <div className="text-[15px] font-semibold text-[#333]">
            {value.adults} adult{value.adults > 1 ? "s" : ""}
          </div>
          <div className="text-xs text-[#717171]">
            {value.rooms} room{value.rooms > 1 ? "s" : ""}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#9ca3af] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[280px] rounded-lg border border-[#dfe0e4] bg-white p-4 shadow-xl">
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
          <button type="button" onClick={() => setOpen(false)} className="mt-3 w-full rounded-md py-2.5 text-xs font-bold text-white" style={{ backgroundColor: AGODA_BLUE }}>
            Done
          </button>
        </div>
      )}
    </div>
  );
}

export function AgodaPassengerField({
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
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left text-[15px] font-semibold text-[#333]">
        <span>{passengers} Passenger{passengers > 1 ? "s" : ""}, {cabin}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#9ca3af] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[260px] rounded-lg border border-[#dfe0e4] bg-white p-4 shadow-xl">
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
          <button type="button" onClick={() => setOpen(false)} className="mt-3 w-full rounded-md py-2.5 text-xs font-bold text-white" style={{ backgroundColor: AGODA_BLUE }}>
            Done
          </button>
        </div>
      )}
    </div>
  );
}

export function AgodaDestinationField({
  value,
  onChange,
  onSelect,
  onFocusChange,
  placeholder = "Begin typing property name or keyword to search, use arrow keys or tab key to navigate, press Enter to select",
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
        className={agodaInputClass}
        aria-label="Destination"
        autoComplete="off"
      />
      {open && items.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-[60] mt-1 max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-md border border-[#dfe0e4] bg-white shadow-xl">
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

export function AgodaAccommodationForm({
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
  const [guests, setGuests] = useState<GuestConfig>({ rooms: 1, adults: 2, children: 0 });
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
        <AgodaUnderlineToggle
          options={["overnight", "dayuse"] as StayMode[]}
          value={stayMode}
          onChange={onStayModeChange}
          labels={{ overnight: "Overnight Stays", dayuse: "Day Use Stays" }}
        />
      )}

      <AgodaFieldRow searchLabel="SEARCH">
        <AgodaField className="flex-[2.5] md:min-w-[220px] lg:min-w-[300px]">
          <AgodaDestinationField
            value={destInput}
            onChange={setDestInput}
            onSelect={setDestination}
            onFocusChange={onFocusChange}
          />
        </AgodaField>

        <AgodaField className="min-w-[128px]">
          <AgodaDateField value={checkIn} onChange={setCheckIn} />
        </AgodaField>

        {stayMode === "overnight" && (
          <AgodaField className="min-w-[128px]">
            <AgodaDateField value={checkOut} onChange={setCheckOut} min={checkIn} />
          </AgodaField>
        )}

        {addFlight && showAddFlight && (
          <AgodaField label="Flying from" className="min-w-[140px]">
            <input
              type="text"
              value={flightOrigin}
              onChange={(e) => setFlightOrigin(e.target.value)}
              placeholder="City or airport"
              className={agodaInputClass}
            />
          </AgodaField>
        )}

        <AgodaField className="min-w-[118px]">
          <AgodaGuestField value={guests} onChange={setGuests} />
        </AgodaField>
      </AgodaFieldRow>

      {showAddFlight && (
        <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-[#333]">
          <input
            type="checkbox"
            checked={addFlight}
            onChange={(e) => setAddFlight(e.target.checked)}
            className="h-[18px] w-[18px] rounded border-[#ccc]"
            style={{ accentColor: AGODA_BLUE }}
          />
          Add a flight
        </label>
      )}
    </form>
  );
}
