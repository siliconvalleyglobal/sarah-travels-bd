"use client";

import Link from "next/link";
import { Star, MapPin, Wifi, Coffee, Shield, Heart, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { type Hotel, getReviewLabel, getReviewColor, AMENITY_LABELS } from "@/lib/hotels-data";

interface HotelCardProps {
  hotel: Hotel;
  nights?: number;
  searchParams?: string;
}

export function HotelCard({ hotel, nights = 1, searchParams = "" }: HotelCardProps) {
  const href = `/hotels/${hotel.id}${searchParams ? `?${searchParams}` : ""}`;
  const totalPrice = hotel.price * nights;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover-lift shadow-sm group">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative md:w-72 lg:w-80 shrink-0">
          <div
            className="h-48 md:h-full min-h-[192px] bg-cover bg-center"
            style={{ backgroundImage: `url('${hotel.images[0]}')` }}
          />
          {hotel.deal && (
            <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow">
              {hotel.deal.label} -{hotel.deal.discount}%
            </span>
          )}
          {hotel.recommended && (
            <span className="absolute top-3 right-3 bg-brand-navy text-white text-[10px] font-bold px-2 py-1 rounded-md">
              Top Pick
            </span>
          )}
          <button className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
            <Heart className="h-4 w-4 text-slate-400 hover:text-red-500" />
          </button>
          {hotel.images.length > 1 && (
            <span className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              +{hotel.images.length - 1} photos
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col">
          <div className="flex justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {hotel.propertyType}
                </span>
                <div className="flex text-brand-gold">
                  {Array.from({ length: hotel.stars }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current" />
                  ))}
                </div>
              </div>
              <h3 className="font-extrabold text-brand-navy text-lg leading-tight">{hotel.name}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-brand-gold shrink-0" />
                {hotel.distance} · {hotel.location.area}
              </p>

              {/* Amenity chips */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {hotel.freeCancellation && (
                  <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Shield className="h-3 w-3" /> Free cancellation
                  </span>
                )}
                {hotel.breakfastIncluded && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Coffee className="h-3 w-3" /> Breakfast included
                  </span>
                )}
                {hotel.amenities.includes("wifi") && (
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-50 border px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Wifi className="h-3 w-3" /> {AMENITY_LABELS.wifi}
                  </span>
                )}
                {hotel.payAtHotel && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    Pay at hotel
                  </span>
                )}
              </div>

              {hotel.urgency && (
                <p className="text-[10px] font-bold text-red-600 mt-2 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> {hotel.urgency}
                </p>
              )}
            </div>

            {/* Review score */}
            <div className="text-right shrink-0">
              <div className="flex items-center gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">{getReviewLabel(hotel.reviewScore)}</span>
                  <span className="text-[10px] text-slate-400">{hotel.reviewCount.toLocaleString()} reviews</span>
                </div>
                <span className={`${getReviewColor(hotel.reviewScore)} text-white font-black text-sm w-10 h-10 rounded-lg rounded-br-none flex items-center justify-center`}>
                  {hotel.reviewScore.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-100">
            <div>
              {hotel.originalPrice && (
                <span className="text-xs text-slate-400 line-through block">{formatCurrency(hotel.originalPrice)} BDT</span>
              )}
              <span className="text-2xl font-black text-brand-navy">{formatCurrency(hotel.price)}</span>
              <span className="text-[10px] text-slate-500 block">per night · {formatCurrency(totalPrice)} total ({nights} night{nights > 1 ? "s" : ""})</span>
            </div>
            <Link
              href={href}
              className="bg-brand-navy hover:bg-opacity-95 text-white font-bold text-sm px-6 py-3 rounded-lg transition shadow"
            >
              See availability
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
