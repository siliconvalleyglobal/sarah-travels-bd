"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Calendar } from "lucide-react";
import { DESTINATIONS } from "@/lib/hotels-data";
import { GuestRoomPicker, type GuestConfig } from "@/components/GuestRoomPicker";
import {
  SarahAccommodationForm,
  defaultCheckIn,
  defaultCheckOut,
  type StayMode,
} from "@/components/marketing/sarah-booking-shared";

interface HotelSearchBarProps {
  initialCity?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: GuestConfig;
  variant?: "hero" | "compact" | "ota" | "sarah";
  onSearch?: (params: { city: string; checkIn: string; checkOut: string; guests: GuestConfig }) => void;
}

export function HotelSearchBar({
  initialCity = "Mecca",
  initialCheckIn,
  initialCheckOut,
  initialGuests = { rooms: 1, adults: 2, children: 0 },
  variant = "compact",
  onSearch,
}: HotelSearchBarProps) {
  const [destination, setDestination] = useState(initialCity);
  const [destInput, setDestInput] = useState(initialCity);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [checkIn, setCheckIn] = useState(initialCheckIn || defaultCheckIn());
  const [checkOut, setCheckOut] = useState(initialCheckOut || defaultCheckOut());
  const [guests, setGuests] = useState<GuestConfig>(initialGuests);
  const [sarahStayMode, setSarahStayMode] = useState<StayMode>("overnight");
  const destRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (destRef.current && !destRef.current.contains(e.target as Node)) setShowDestDropdown(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = DESTINATIONS.filter(d =>
    d.name.toLowerCase().includes(destInput.toLowerCase()) ||
    d.country.toLowerCase().includes(destInput.toLowerCase())
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = { city: destination, checkIn, checkOut, guests };
    if (onSearch) {
      onSearch(params);
    } else {
      const qs = new URLSearchParams({
        city: destination,
        checkIn,
        checkOut,
        rooms: String(guests.rooms),
        adults: String(guests.adults),
        children: String(guests.children),
      });
      window.location.href = `/hotels?${qs.toString()}`;
    }
  }

  if (variant === "sarah") {
    return (
      <SarahAccommodationForm
        stayMode={sarahStayMode}
        onStayModeChange={setSarahStayMode}
        propertyType="hotels"
        onSubmit={
          onSearch
            ? (p) =>
                onSearch({
                  city: p.city,
                  checkIn: p.checkIn,
                  checkOut: p.checkOut,
                  guests: {
                    rooms: Number(p.rooms),
                    adults: Number(p.adults),
                    children: Number(p.children),
                  },
                })
            : undefined
        }
        searchHref={
          onSearch
            ? undefined
            : (p) => {
                const qs = new URLSearchParams(p);
                return `/hotels?${qs.toString()}`;
              }
        }
      />
    );
  }

  const isDark = variant === "hero";
  const isOta = variant === "ota";

  const fieldClass = isDark
    ? "bg-brand-navy/60 border-white/20 text-white placeholder:text-slate-400"
    : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400";
  const labelClass = isDark ? "text-slate-300" : "text-slate-600";

  return (
    <form onSubmit={handleSubmit} className={isDark || isOta ? "space-y-4" : ""}>
      <div className="grid items-end gap-3 sm:grid-cols-5">
        <div ref={destRef} className="relative sm:col-span-2">
          <label className={`mb-1 block text-xs font-semibold ${labelClass}`}>
            <MapPin className="inline h-3 w-3 mr-1" />Destination
          </label>
          <input
            type="text"
            value={destInput}
            onChange={e => { setDestInput(e.target.value); setShowDestDropdown(true); }}
            onFocus={() => setShowDestDropdown(true)}
            placeholder="City, hotel, or landmark..."
            className={`w-full rounded-lg border px-3 py-2.5 text-sm font-semibold transition focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/10 ${fieldClass}`}
          />
          {showDestDropdown && filtered.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-2xl z-50 divide-y divide-slate-100">
              {filtered.map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => { setDestination(d.name); setDestInput(d.name); setShowDestDropdown(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition flex items-center gap-3"
                >
                  <span className="text-lg">{d.icon}</span>
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">{d.name}</span>
                    <span className="text-[10px] text-slate-500">{d.country} · {d.hotels} properties</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className={`mb-1 block text-xs font-semibold ${labelClass}`}>
            <Calendar className="mr-1 inline h-3 w-3" />Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={e => setCheckIn(e.target.value)}
            required
            className={`w-full rounded-lg border px-3 py-2.5 text-sm font-semibold transition focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/10 ${fieldClass}`}
          />
        </div>

        <div>
          <label className={`mb-1 block text-xs font-semibold ${labelClass}`}>
            <Calendar className="mr-1 inline h-3 w-3" />Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={e => setCheckOut(e.target.value)}
            required
            className={`w-full rounded-lg border px-3 py-2.5 text-sm font-semibold transition focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/10 ${fieldClass}`}
          />
        </div>

        <div>
          <label className={`mb-1 block text-xs font-semibold ${labelClass}`}>Guests & Rooms</label>
          <GuestRoomPicker value={guests} onChange={setGuests} variant={isDark ? "dark" : "light"} />
        </div>
      </div>

      <button
        type="submit"
        className={`flex items-center justify-center gap-2 rounded-lg bg-brand-navy py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-navy-light active:scale-[0.99] ${
          isDark || isOta ? "w-full" : "w-full sm:w-auto sm:px-10"
        }`}
      >
        <Search className="h-4 w-4" /> Search Hotels
      </button>
    </form>
  );
}
