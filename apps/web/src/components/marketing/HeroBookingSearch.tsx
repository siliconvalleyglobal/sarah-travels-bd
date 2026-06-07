"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { home } from "@/lib/i18n/translations";
import { pick } from "@/lib/i18n/types";
import {
  SARAH_BOOKING_ACCENT,
  SarahTabBar,
  SarahUnderlineToggle,
  SarahAccommodationForm,
  SarahFieldRow,
  SarahField,
  SarahFlightDateField,
  SarahPassengerField,
  SarahDestinationField,
  SarahDateField,
  SarahCounterField,
  sarahBookingInputClass,
  defaultCheckIn,
  defaultCheckOut,
  type SarahBookingTabId,
  type StayMode,
  type TripType,
} from "./sarah-booking-shared";

const AIRPORTS = [
  { code: "DAC", name: "Hazrat Shahjalal Int'l Airport", city: "Dhaka, Bangladesh" },
  { code: "CGP", name: "Shah Amanat Int'l Airport", city: "Chittagong, Bangladesh" },
  { code: "JED", name: "King Abdulaziz Int'l Airport", city: "Jeddah, Saudi Arabia" },
  { code: "DXB", name: "Dubai International Airport", city: "Dubai, UAE" },
  { code: "LHR", name: "Heathrow Airport", city: "London, UK" },
  { code: "SIN", name: "Changi Airport", city: "Singapore" },
  { code: "KUL", name: "Kuala Lumpur Int'l Airport", city: "Kuala Lumpur, Malaysia" },
];

function qs(params: Record<string, string>) {
  return new URLSearchParams(params).toString();
}

export function HeroBookingSearch() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<SarahBookingTabId>("hotels");
  const [focused, setFocused] = useState(false);
  const [stayMode, setStayMode] = useState<StayMode>("overnight");

  // Flights
  const [tripType, setTripType] = useState<TripType>("roundtrip");
  const [flightOrigin, setFlightOrigin] = useState("DAC");
  const [flightDest, setFlightDest] = useState("DXB");
  const [originInput, setOriginInput] = useState("Dhaka (DAC)");
  const [destInput, setDestInput] = useState("Dubai (DXB)");
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [departDate, setDepartDate] = useState(defaultCheckIn());
  const [returnDate, setReturnDate] = useState(defaultCheckOut());
  const [passengers, setPassengers] = useState(1);
  const [cabin, setCabin] = useState("Economy");

  // Flight + Hotel bundle
  const [bundleTrip, setBundleTrip] = useState<TripType>("roundtrip");
  const [bundleOrigin, setBundleOrigin] = useState("Dhaka (DAC)");
  const [bundleOriginCode, setBundleOriginCode] = useState("DAC");
  const [bundleDest, setBundleDest] = useState("Dubai (DXB)");
  const [bundleDestCode, setBundleDestCode] = useState("DXB");
  const [bundleDepart, setBundleDepart] = useState(defaultCheckIn());
  const [bundleReturn, setBundleReturn] = useState(defaultCheckOut());
  const [bundlePassengers, setBundlePassengers] = useState(1);
  const [bundleRooms, setBundleRooms] = useState(1);

  // Activities
  const [activityDest, setActivityDest] = useState("");
  const [activityDestInput, setActivityDestInput] = useState("");
  const [activityDate, setActivityDate] = useState(defaultCheckIn());

  // Airport transfer
  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferDate, setTransferDate] = useState(defaultCheckIn());
  const [transferTime, setTransferTime] = useState("12:00");
  const [transferPax, setTransferPax] = useState(2);

  function swapAirports() {
    setFlightOrigin(flightDest);
    setOriginInput(destInput);
    setFlightDest(flightOrigin);
    setDestInput(originInput);
  }

  function swapBundleAirports() {
    setBundleOriginCode(bundleDestCode);
    setBundleOrigin(bundleDest);
    setBundleDestCode(bundleOriginCode);
    setBundleDest(bundleOrigin);
  }

  function resolveAirport(input: string, setCode: (c: string) => void, setLabel: (l: string) => void) {
    const match = AIRPORTS.find(
      (a) =>
        input.toLowerCase().includes(a.code.toLowerCase()) ||
        input.toLowerCase().includes(a.city.split(",")[0].toLowerCase()),
    );
    if (match) {
      setCode(match.code);
      setLabel(`${match.city.split(",")[0]} (${match.code})`);
    }
  }

  return (
    <div className="booking-widget st-booking-card relative w-full min-w-0 opacity-100">
      <div className="mb-5 text-center sm:mb-7">
        <h1 className="booking-hero-title">
          {pick(lang, home.heroTitle)}
        </h1>
      </div>

      <div
        className={`relative rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] ${focused ? "z-50 ring-2 ring-[#2283DF]/30" : ""}`}
      >
        <SarahTabBar active={activeTab} onChange={setActiveTab} />

        <div className="px-4 py-5 sm:px-7 sm:py-7">
          {/* ── HOTELS ── */}
          {activeTab === "hotels" && (
            <SarahAccommodationForm
              stayMode={stayMode}
              onStayModeChange={setStayMode}
              propertyType="hotels"
              onFocusChange={setFocused}
              searchHref={(p) => `/hotels?${qs(p)}`}
            />
          )}

          {/* ── HOMES & APTS ── */}
          {activeTab === "homes" && (
            <SarahAccommodationForm
              stayMode={stayMode}
              onStayModeChange={setStayMode}
              propertyType="homes"
              onFocusChange={setFocused}
              searchHref={(p) => `/hotels?${qs(p)}`}
            />
          )}

          {/* ── FLIGHT + HOTEL (Bundle & Save) ── */}
          {activeTab === "flight-hotel" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/flights?${qs({
                  bundle: "1",
                  origin: bundleOriginCode,
                  destination: bundleDestCode,
                  tripType: bundleTrip,
                  depart: bundleDepart,
                  ...(bundleTrip === "roundtrip" ? { return: bundleReturn } : {}),
                  passengers: String(bundlePassengers),
                  rooms: String(bundleRooms),
                })}`;
              }}
            >
              <SarahUnderlineToggle
                options={["roundtrip", "oneway"] as TripType[]}
                value={bundleTrip}
                onChange={setBundleTrip}
                labels={{ roundtrip: "Round-trip", oneway: "One-way" }}
              />

              <SarahFieldRow searchLabel="SEARCH FLIGHT + HOTEL" searchShortLabel="SEARCH">
                <SarahField label="Flying from" className="relative md:min-w-[140px]">
                  <input
                    type="text"
                    value={bundleOrigin}
                    onChange={(e) => setBundleOrigin(e.target.value)}
                    onBlur={() => resolveAirport(bundleOrigin, setBundleOriginCode, setBundleOrigin)}
                    placeholder="City or airport"
                    className={sarahBookingInputClass}
                  />
                </SarahField>

                <button
                  type="button"
                  onClick={swapBundleAirports}
                  className="flex items-center justify-center gap-2 border-b px-4 py-2.5 text-xs font-semibold text-[#717171] touch-manipulation md:hidden"
                  style={{ borderColor: "#dfe0e4" }}
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  Swap airports
                </button>

                <SarahField label="Flying to" className="relative md:min-w-[140px]">
                  <button
                    type="button"
                    onClick={swapBundleAirports}
                    className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-[#dfe0e4] bg-white p-1.5 text-[#717171] shadow-sm md:flex"
                    aria-label="Swap"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                  </button>
                  <input
                    type="text"
                    value={bundleDest}
                    onChange={(e) => setBundleDest(e.target.value)}
                    onBlur={() => resolveAirport(bundleDest, setBundleDestCode, setBundleDest)}
                    placeholder="City or airport"
                    className={sarahBookingInputClass}
                  />
                </SarahField>

                <SarahField label="Departure" className="md:min-w-[128px]">
                  <SarahFlightDateField value={bundleDepart} onChange={setBundleDepart} />
                </SarahField>

                {bundleTrip === "roundtrip" && (
                  <SarahField label="Return" className="md:min-w-[128px]">
                    <SarahFlightDateField value={bundleReturn} onChange={setBundleReturn} min={bundleDepart} />
                  </SarahField>
                )}

                <SarahField className="md:min-w-[118px]">
                  <SarahCounterField label="Passenger" value={bundlePassengers} onChange={setBundlePassengers} min={1} max={9} />
                </SarahField>

                <SarahField className="md:min-w-[100px]">
                  <SarahCounterField label="Room" value={bundleRooms} onChange={setBundleRooms} min={1} max={8} />
                </SarahField>
              </SarahFieldRow>
            </form>
          )}

          {/* ── FLIGHTS ── */}
          {activeTab === "flights" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/flights?${qs({
                  origin: flightOrigin,
                  destination: flightDest,
                  tripType,
                  depart: departDate,
                  ...(tripType === "roundtrip" ? { return: returnDate } : {}),
                  passengers: String(passengers),
                  cabin,
                })}`;
              }}
            >
              <SarahUnderlineToggle
                options={["oneway", "roundtrip"] as TripType[]}
                value={tripType}
                onChange={setTripType}
                labels={{ oneway: "One-way", roundtrip: "Round-trip" }}
              />

              <SarahFieldRow searchLabel="Search flights" searchShortLabel="SEARCH">
                <SarahField label="Flying from" className="relative md:min-w-[140px]">
                  <input
                    type="text"
                    value={originInput}
                    onChange={(e) => { setOriginInput(e.target.value); setShowOriginDropdown(true); }}
                    onFocus={() => setShowOriginDropdown(true)}
                    onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
                    placeholder="City or airport"
                    className={sarahBookingInputClass}
                  />
                  {showOriginDropdown && (
                    <AirportDropdown airports={AIRPORTS} query={originInput} onSelect={(ap) => {
                      setFlightOrigin(ap.code);
                      setOriginInput(`${ap.city.split(",")[0]} (${ap.code})`);
                      setShowOriginDropdown(false);
                    }} />
                  )}
                </SarahField>

                <button
                  type="button"
                  onClick={swapAirports}
                  className="flex items-center justify-center gap-2 border-b px-4 py-2.5 text-xs font-semibold text-[#717171] touch-manipulation md:hidden"
                  style={{ borderColor: "#dfe0e4" }}
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  Swap airports
                </button>

                <SarahField label="Flying to" className="relative md:min-w-[140px]">
                  <button
                    type="button"
                    onClick={swapAirports}
                    className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-[#dfe0e4] bg-white p-1.5 text-[#717171] shadow-sm md:flex"
                    aria-label="Swap"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                  </button>
                  <input
                    type="text"
                    value={destInput}
                    onChange={(e) => { setDestInput(e.target.value); setShowDestDropdown(true); }}
                    onFocus={() => setShowDestDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
                    placeholder="City or airport"
                    className={sarahBookingInputClass}
                  />
                  {showDestDropdown && (
                    <AirportDropdown airports={AIRPORTS} query={destInput} onSelect={(ap) => {
                      setFlightDest(ap.code);
                      setDestInput(`${ap.city.split(",")[0]} (${ap.code})`);
                      setShowDestDropdown(false);
                    }} />
                  )}
                </SarahField>

                <SarahField label="Departure" className="md:min-w-[128px]">
                  <SarahFlightDateField value={departDate} onChange={setDepartDate} />
                </SarahField>

                {tripType === "roundtrip" && (
                  <SarahField label="Return" className="md:min-w-[128px]">
                    <SarahFlightDateField value={returnDate} onChange={setReturnDate} min={departDate} />
                  </SarahField>
                )}

                <SarahField className="md:min-w-[160px]">
                  <SarahPassengerField
                    passengers={passengers}
                    cabin={cabin}
                    onPassengersChange={setPassengers}
                    onCabinChange={setCabin}
                  />
                </SarahField>
              </SarahFieldRow>

              <p className="mt-3 text-center text-xs font-semibold" style={{ color: SARAH_BOOKING_ACCENT }}>
                <button type="button" onClick={() => setActiveTab("flight-hotel")} className="hover:underline">
                  Search flight + hotel
                </button>
              </p>
            </form>
          )}

          {/* ── ACTIVITIES ── */}
          {activeTab === "activities" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const dest = activityDest || activityDestInput;
                if (!dest.trim()) return;
                window.location.href = `/tours?${qs({ destination: dest, date: activityDate })}`;
              }}
            >
              <SarahFieldRow searchLabel="SEARCH">
                <SarahField className="md:min-w-[280px]">
                  <SarahDestinationField
                    value={activityDestInput}
                    onChange={setActivityDestInput}
                    onSelect={setActivityDest}
                    onFocusChange={setFocused}
                    placeholder="Search by city or activity name"
                  />
                </SarahField>
                <SarahField className="md:min-w-[128px]">
                  <SarahDateField value={activityDate} onChange={setActivityDate} />
                </SarahField>
              </SarahFieldRow>
            </form>
          )}

          {/* ── AIRPORT TRANSFER ── */}
          {activeTab === "transfers" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!transferFrom.trim() || !transferTo.trim()) return;
                window.location.href = `/cars?${qs({
                  pickup: transferFrom,
                  dropoff: transferTo,
                  date: transferDate,
                  time: transferTime,
                  pax: String(transferPax),
                })}`;
              }}
            >
              <p className="mb-4 text-sm text-[#717171]">
                Book airport pickups and drop-offs between terminals, hotels, and city addresses.
              </p>
              <SarahFieldRow searchLabel="SEARCH">
                <SarahField label="Pick-up" className="md:min-w-[160px]">
                  <input
                    type="text"
                    required
                    value={transferFrom}
                    onChange={(e) => setTransferFrom(e.target.value)}
                    placeholder="Airport, hotel or address"
                    className={sarahBookingInputClass}
                  />
                </SarahField>
                <SarahField label="Drop-off" className="md:min-w-[160px]">
                  <input
                    type="text"
                    required
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    placeholder="Airport, hotel or address"
                    className={sarahBookingInputClass}
                  />
                </SarahField>
                <SarahField className="md:min-w-[128px]">
                  <SarahDateField value={transferDate} onChange={setTransferDate} />
                </SarahField>
                <SarahField label="Pick-up time" className="md:min-w-[100px]">
                  <input
                    type="time"
                    value={transferTime}
                    onChange={(e) => setTransferTime(e.target.value)}
                    className={sarahBookingInputClass}
                  />
                </SarahField>
                <SarahField className="md:min-w-[118px]">
                  <SarahCounterField label="Passenger" value={transferPax} onChange={setTransferPax} min={1} max={8} />
                </SarahField>
              </SarahFieldRow>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function AirportDropdown({
  airports,
  query,
  onSelect,
}: {
  airports: typeof AIRPORTS;
  query: string;
  onSelect: (ap: (typeof AIRPORTS)[number]) => void;
}) {
  const filtered = airports.filter(
    (ap) =>
      ap.city.toLowerCase().includes(query.toLowerCase()) ||
      ap.code.toLowerCase().includes(query.toLowerCase()) ||
      ap.name.toLowerCase().includes(query.toLowerCase()),
  );
  if (!filtered.length) return null;
  return (
    <div className="absolute left-0 right-0 top-full z-[60] mt-1 max-h-48 divide-y divide-slate-100 overflow-y-auto overscroll-contain rounded-md border border-[#dfe0e4] bg-white shadow-xl">
      {filtered.map((ap) => (
        <button
          key={ap.code}
          type="button"
          onClick={() => onSelect(ap)}
          className="flex w-full px-3 py-2.5 text-left text-sm hover:bg-[#e8f4fc]"
        >
          <span className="font-semibold text-[#333]">{ap.city.split(",")[0]} ({ap.code})</span>
        </button>
      ))}
    </div>
  );
}
