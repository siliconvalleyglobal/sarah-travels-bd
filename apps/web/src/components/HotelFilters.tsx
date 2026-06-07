"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { AMENITY_LABELS, PROPERTY_TYPE_LABELS, type Amenity, type PropertyType } from "@/lib/hotels-data";

export interface HotelFilterState {
  stars: number[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  propertyTypes: PropertyType[];
  amenities: Amenity[];
  freeCancellation: boolean;
  breakfastIncluded: boolean;
  payAtHotel: boolean;
  dealsOnly: boolean;
}

export const DEFAULT_FILTERS: HotelFilterState = {
  stars: [],
  minPrice: 0,
  maxPrice: 300000,
  minRating: 0,
  propertyTypes: [],
  amenities: [],
  freeCancellation: false,
  breakfastIncluded: false,
  payAtHotel: false,
  dealsOnly: false,
};

interface HotelFiltersProps {
  filters: HotelFilterState;
  onChange: (filters: HotelFilterState) => void;
  priceRange: { min: number; max: number };
  resultCount: number;
  onClear: () => void;
}

export function HotelFilters({ filters, onChange, priceRange, resultCount, onClear }: HotelFiltersProps) {
  const activeCount = [
    filters.stars.length > 0,
    filters.minPrice > priceRange.min || filters.maxPrice < priceRange.max,
    filters.minRating > 0,
    filters.propertyTypes.length > 0,
    filters.amenities.length > 0,
    filters.freeCancellation,
    filters.breakfastIncluded,
    filters.payAtHotel,
    filters.dealsOnly,
  ].filter(Boolean).length;

  function toggleStar(star: number) {
    const stars = filters.stars.includes(star)
      ? filters.stars.filter(s => s !== star)
      : [...filters.stars, star];
    onChange({ ...filters, stars });
  }

  function togglePropertyType(type: PropertyType) {
    const propertyTypes = filters.propertyTypes.includes(type)
      ? filters.propertyTypes.filter(t => t !== type)
      : [...filters.propertyTypes, type];
    onChange({ ...filters, propertyTypes });
  }

  function toggleAmenity(amenity: Amenity) {
    const amenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    onChange({ ...filters, amenities });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5 sticky top-24">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="font-extrabold text-brand-navy text-sm flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4 text-brand-gold" />
          Filters
          {activeCount > 0 && (
            <span className="bg-brand-gold text-brand-navy text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">{activeCount}</span>
          )}
        </h3>
        {activeCount > 0 && (
          <button onClick={onClear} className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-0.5">
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500 font-semibold">{resultCount} properties found</p>

      {/* Price range */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-2">Price per night (BDT)</label>
        <div className="flex gap-2 items-center text-xs">
          <input
            type="number"
            value={filters.minPrice}
            onChange={e => onChange({ ...filters, minPrice: Number(e.target.value) })}
            className="w-full border rounded-lg px-2 py-1.5 text-xs"
            placeholder="Min"
          />
          <span className="text-slate-400">—</span>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={e => onChange({ ...filters, maxPrice: Number(e.target.value) })}
            className="w-full border rounded-lg px-2 py-1.5 text-xs"
            placeholder="Max"
          />
        </div>
      </div>

      {/* Star rating */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-2">Star Rating</label>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map(star => (
            <label key={star} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-brand-navy">
              <input type="checkbox" checked={filters.stars.includes(star)} onChange={() => toggleStar(star)} className="rounded" />
              <span>{"★".repeat(star)}{"☆".repeat(5 - star)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Guest rating */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-2">Guest Rating</label>
        <div className="space-y-1.5">
          {[
            { value: 9, label: "9+ Exceptional" },
            { value: 8, label: "8+ Excellent" },
            { value: 7, label: "7+ Very Good" },
            { value: 6, label: "6+ Good" },
          ].map(r => (
            <label key={r.value} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === r.value}
                onChange={() => onChange({ ...filters, minRating: filters.minRating === r.value ? 0 : r.value })}
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Property type */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-2">Property Type</label>
        <div className="space-y-1.5">
          {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map(type => (
            <label key={type} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input type="checkbox" checked={filters.propertyTypes.includes(type)} onChange={() => togglePropertyType(type)} className="rounded" />
              <span>{PROPERTY_TYPE_LABELS[type]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Quick filters */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-2">Popular Filters</label>
        <div className="space-y-1.5">
          {[
            { key: "freeCancellation" as const, label: "Free cancellation" },
            { key: "breakfastIncluded" as const, label: "Breakfast included" },
            { key: "payAtHotel" as const, label: "Pay at hotel" },
            { key: "dealsOnly" as const, label: "Deals & discounts" },
          ].map(f => (
            <label key={f.key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters[f.key]}
                onChange={() => onChange({ ...filters, [f.key]: !filters[f.key] })}
                className="rounded"
              />
              <span>{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-2">Amenities</label>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {(Object.keys(AMENITY_LABELS) as Amenity[]).map(amenity => (
            <label key={amenity} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input type="checkbox" checked={filters.amenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} className="rounded" />
              <span>{AMENITY_LABELS[amenity]}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
