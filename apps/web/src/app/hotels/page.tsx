"use client";

import { useState, use, useMemo, useCallback, useEffect } from "react";
import { Map, List, ChevronDown, Sparkles, TrendingUp, Loader2, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHero } from "@/components/PageHero";
import { GsapRoot } from "@/components/marketing/GsapRoot";
import { StaggerGrid, StaggerItem } from "@/components/AnimatedSection";
import { travelImages } from "@/lib/travelImages";
import { HotelSearchBar } from "@/components/HotelSearchBar";
import { HotelCard } from "@/components/HotelCard";
import { HotelFilters, DEFAULT_FILTERS, type HotelFilterState } from "@/components/HotelFilters";
import { HOTELS, getHotelsByCity, type Hotel } from "@/lib/hotels-data";
import { searchHotels } from "@/lib/hotels-api";
import type { GuestConfig } from "@/components/GuestRoomPicker";

type SortOption = "recommended" | "price_asc" | "price_desc" | "rating" | "distance";

export default function HotelsSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; checkIn?: string; checkOut?: string; rooms?: string; adults?: string; children?: string }>;
}) {
  const params = use(searchParams);
  const cityQuery = params.city ?? "Mecca";
  const checkIn = params.checkIn ?? "";
  const checkOut = params.checkOut ?? "";
  const guests: GuestConfig = {
    rooms: Number(params.rooms) || 1,
    adults: Number(params.adults) || 2,
    children: Number(params.children) || 0,
  };

  const [filters, setFilters] = useState<HotelFilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>("recommended");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [baseHotels, setBaseHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    searchHotels({
      city: cityQuery,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      rooms: guests.rooms,
      adults: guests.adults,
      children: guests.children,
    })
      .then((res) => {
        if (!cancelled) setBaseHotels(res.hotels);
      })
      .catch(() => {
        if (!cancelled) {
          const fallback = getHotelsByCity(cityQuery);
          setBaseHotels(fallback.length > 0 ? fallback : HOTELS);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [cityQuery, checkIn, checkOut, guests.rooms, guests.adults, guests.children]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const diff = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  const searchParamsStr = useMemo(() => {
    const qs = new URLSearchParams();
    if (cityQuery) qs.set("city", cityQuery);
    if (checkIn) qs.set("checkIn", checkIn);
    if (checkOut) qs.set("checkOut", checkOut);
    qs.set("rooms", String(guests.rooms));
    qs.set("adults", String(guests.adults));
    qs.set("children", String(guests.children));
    return qs.toString();
  }, [cityQuery, checkIn, checkOut, guests]);

  const priceRange = useMemo(() => ({
    min: baseHotels.length ? Math.min(...baseHotels.map(h => h.price)) : 0,
    max: baseHotels.length ? Math.max(...baseHotels.map(h => h.price)) : 300000,
  }), [baseHotels]);

  const filteredHotels = useMemo(() => {
    let result = [...baseHotels];

    if (filters.stars.length > 0) result = result.filter(h => filters.stars.includes(h.stars));
    if (filters.minPrice > 0) result = result.filter(h => h.price >= filters.minPrice);
    if (filters.maxPrice < 300000) result = result.filter(h => h.price <= filters.maxPrice);
    if (filters.minRating > 0) result = result.filter(h => h.reviewScore >= filters.minRating);
    if (filters.propertyTypes.length > 0) result = result.filter(h => filters.propertyTypes.includes(h.propertyType));
    if (filters.amenities.length > 0) result = result.filter(h => filters.amenities.every(a => h.amenities.includes(a)));
    if (filters.freeCancellation) result = result.filter(h => h.freeCancellation);
    if (filters.breakfastIncluded) result = result.filter(h => h.breakfastIncluded);
    if (filters.payAtHotel) result = result.filter(h => h.payAtHotel);
    if (filters.dealsOnly) result = result.filter(h => h.deal);

    switch (sort) {
      case "price_asc": result.sort((a, b) => a.price - b.price); break;
      case "price_desc": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.reviewScore - a.reviewScore); break;
      case "distance": result.sort((a, b) => a.distanceKm - b.distanceKm); break;
      default: result.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0) || b.reviewScore - a.reviewScore);
    }

    return result;
  }, [baseHotels, filters, sort]);

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const dealCount = baseHotels.filter(h => h.deal).length;

  return (
    <GsapRoot className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <SiteHeader variant="compact" />

      <PageHero
        compact
        icon={MapPin}
        badge="2M+ Properties"
        title={`Hotels in ${cityQuery}`}
        subtitle="Sarah Price Guarantee · Free cancellation on selected stays · Agoda, Hotelbeds & Ratehawk inventory."
        backgroundImage={travelImages.hotels}
      />

      {/* Sticky search bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[52px] z-40">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <HotelSearchBar
            initialCity={cityQuery}
            initialCheckIn={checkIn || undefined}
            initialCheckOut={checkOut || undefined}
            initialGuests={guests}
            variant="compact"
          />
        </div>
      </div>

      {/* Deals banner */}
      {dealCount > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
          <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 flex items-center gap-3 text-sm">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="font-bold">{dealCount} Sarah Deals available in {cityQuery}</span>
            <span className="text-white/80 text-xs hidden sm:inline">— Save up to 18% on selected properties</span>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl w-full px-4 py-6 sm:px-6 flex-1">
        {/* Results header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-brand-navy">
              {filteredHotels.length} properties in {cityQuery}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {checkIn && checkOut ? `${checkIn} → ${checkOut} · ` : ""}
              {guests.rooms} room{guests.rooms > 1 ? "s" : ""}, {guests.adults} adult{guests.adults > 1 ? "s" : ""}
              {guests.children > 0 ? `, ${guests.children} child${guests.children > 1 ? "ren" : ""}` : ""}
              {nights > 1 ? ` · ${nights} nights` : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 text-xs font-bold flex items-center gap-1 transition ${viewMode === "list" ? "bg-brand-navy text-white" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <List className="h-3.5 w-3.5" /> List
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-3 py-2 text-xs font-bold flex items-center gap-1 transition ${viewMode === "map" ? "bg-brand-navy text-white" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Map className="h-3.5 w-3.5" /> Map
              </button>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortOption)}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-navy cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Guest Rating</option>
                <option value="distance">Distance</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden bg-brand-navy text-white text-xs font-bold px-3 py-2 rounded-lg"
            >
              Filters
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4 items-start">
          {/* Sidebar filters */}
          <div className={`lg:block ${showMobileFilters ? "block" : "hidden"}`}>
            <HotelFilters
              filters={filters}
              onChange={setFilters}
              priceRange={priceRange}
              resultCount={filteredHotels.length}
              onClear={clearFilters}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl border p-16 text-center">
                <Loader2 className="h-10 w-10 text-brand-gold mx-auto mb-4 animate-spin" />
                <p className="text-sm text-slate-500">Searching properties in {cityQuery}…</p>
              </div>
            ) : viewMode === "map" ? (
              <MapView hotels={filteredHotels} city={cityQuery} />
            ) : filteredHotels.length === 0 ? (
              <div className="bg-white rounded-2xl border p-16 text-center">
                <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-brand-navy text-lg">No properties match your filters</h3>
                <p className="text-sm text-slate-500 mt-2">Try adjusting your filters or search a different destination.</p>
                <button onClick={clearFilters} className="mt-4 bg-brand-navy text-white text-xs font-bold px-6 py-2.5 rounded-lg">
                  Clear all filters
                </button>
              </div>
            ) : (
              <StaggerGrid className="space-y-4">
                {filteredHotels.map(hotel => (
                  <StaggerItem key={hotel.id}>
                    <HotelCard hotel={hotel} nights={nights} searchParams={searchParamsStr} />
                  </StaggerItem>
                ))}
              </StaggerGrid>
            )}
          </div>
        </div>
      </div>

      {/* Footer trust strip */}
      <div className="bg-brand-navy text-white py-8 mt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid gap-6 sm:grid-cols-3 text-center text-xs">
          <div>
            <span className="font-black text-brand-gold text-lg block mb-1">2M+</span>
            <span className="text-slate-400">Properties worldwide via Hotelbeds, Agoda & Ratehawk</span>
          </div>
          <div>
            <span className="font-black text-brand-gold text-lg block mb-1">Best Price</span>
            <span className="text-slate-400">Sarah Price Guarantee — we&apos;ll match any lower rate</span>
          </div>
          <div>
            <span className="font-black text-brand-gold text-lg block mb-1">24/7 Support</span>
            <span className="text-slate-400">Bengali-speaking agents · WhatsApp: 01730000106</span>
          </div>
        </div>
      </div>

      <SiteFooter />
    </GsapRoot>
  );
}

function MapView({ hotels, city }: { hotels: Hotel[]; city: string }) {
  return (
    <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
      <div className="relative h-[500px] bg-slate-200">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url('${travelImages.worldMap}')` }}
        />
        <div className="absolute inset-0 bg-brand-navy/20" />
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-xl px-4 py-2 shadow-lg">
          <span className="text-xs font-bold text-brand-navy">{hotels.length} properties in {city}</span>
        </div>
        {hotels.map((hotel, i) => {
          const top = 15 + (i * 37 + hotel.distanceKm * 200) % 65;
          const left = 10 + (i * 53 + hotel.price / 1000) % 75;
          return (
            <button
              key={hotel.id}
              className="absolute transform -translate-x-1/2 -translate-y-full group"
              style={{ top: `${top}%`, left: `${left}%` }}
              onClick={() => window.location.href = `/hotels/${hotel.id}`}
            >
              <span className="bg-brand-navy text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg group-hover:bg-brand-gold group-hover:text-brand-navy transition whitespace-nowrap">
                ৳{(hotel.price / 1000).toFixed(0)}k
              </span>
              <span className="block w-2 h-2 bg-brand-navy group-hover:bg-brand-gold rounded-full mx-auto -mt-0.5 transition" />
            </button>
          );
        })}
      </div>
      <div className="p-4 border-t text-center">
        <p className="text-xs text-slate-500">Interactive map powered by Google Maps — click a price pin to view property</p>
      </div>
    </div>
  );
}
