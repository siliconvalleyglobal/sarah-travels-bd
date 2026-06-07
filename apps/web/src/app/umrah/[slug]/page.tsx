"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plane, Moon, Users, CheckCircle, ArrowLeft, Info, 
  MapPin, ShieldCheck, Calendar, ShieldAlert, CreditCard, Loader2,
} from "lucide-react";
import { SarahLogo } from "@/components/SarahLogo";
import { formatCurrency } from "@/lib/utils";
import { getToken } from "@/lib/auth";
import { getUmrahPackage, bookUmrah, payUmrahBooking } from "@/lib/umrah-api";
import { travelImages } from "@/lib/travelImages";

// Seed data reference matching database/seed.ts
const PACKAGES_SEED = {
  "economy-umrah-7d": {
    title: "Economy Umrah — 7 Days",
    price: 95000,
    duration: 7,
    description: "Budget-friendly Umrah package with 3-star hotel near Haram.",
    airline: "SV (Saudia Airlines)",
    route: "DAC - JED - DAC",
    makkahHotel: "Makkah 3-star, 500m from Haram",
    madinahHotel: "Madinah 3-star, 800m from Haram",
    inclusions: ["Return flights", "3-star hotel (Makkah & Madinah)", "Saudi Umrah Visa", "AC transport in group", "Guided Ziyarat (Makkah/Madinah)"],
    exclusions: ["Personal shopping/meals", "Extra room service", "Surcharge for double occupancy"]
  },
  "standard-umrah-10d": {
    title: "Standard Umrah — 10 Days",
    price: 145000,
    duration: 10,
    description: "Popular 10-day package with 4-star hotels and guided Ziyarat.",
    airline: "BG (Biman Bangladesh)",
    route: "DAC - JED - MED - DAC",
    makkahHotel: "Makkah 4-star, 300m from Haram",
    madinahHotel: "Madinah 4-star, 400m from Mosque",
    inclusions: ["Return flights", "4-star hotel", "Umrah Visa with insurance", "Group AC transport", "Guided Ziyarat", "Daily laundry service"],
    exclusions: ["Personal shopping", "Lunch and dinner (breakfast included)"]
  },
  "premium-umrah-14d": {
    title: "Premium Umrah — 14 Days",
    price: 285000,
    duration: 14,
    description: "Luxury Umrah with 5-star hotels, business class option, and VIP services.",
    airline: "EK (Emirates Airlines)",
    route: "DAC - DXB - JED - MED - DAC",
    makkahHotel: "Makkah 5-star, Haram View",
    madinahHotel: "Madinah 5-star, Prophet's Mosque View",
    inclusions: ["Return flights (Business optional)", "5-star luxury hotels close to Haram", "Express VIP Visa processing", "Private AC transport (GMC/Hyundai)", "All meals included", "Dedicated private guide"],
    exclusions: ["Any personal luxury items", "Business class flight upgrade surcharge"]
  }
};

type PackageKey = keyof typeof PACKAGES_SEED;

type PackageDisplay = (typeof PACKAGES_SEED)[PackageKey];

function mapApiPackage(data: Awaited<ReturnType<typeof getUmrahPackage>>, fallback: PackageDisplay): PackageDisplay {
  const flight = data.flightDetails as { airline?: string; route?: string } | null;
  const hotel = data.hotelDetails as { makkah?: string; madinah?: string } | null;
  return {
    title: data.title,
    price: Number(data.price),
    duration: data.duration,
    description: data.description ?? fallback.description,
    airline: flight?.airline ?? fallback.airline,
    route: flight?.route ?? fallback.route,
    makkahHotel: hotel?.makkah ?? fallback.makkahHotel,
    madinahHotel: hotel?.madinah ?? fallback.madinahHotel,
    inclusions: (data.inclusions as string[]) ?? fallback.inclusions,
    exclusions: (data.exclusions as string[]) ?? fallback.exclusions,
  };
}

export default function UmrahPackageDetails({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();
  const fallback = PACKAGES_SEED[slug as PackageKey] || PACKAGES_SEED["economy-umrah-7d"];
  const [pkg, setPkg] = useState<PackageDisplay>(fallback);
  const [loading, setLoading] = useState(true);

  const [pilgrimsCount, setPilgrimsCount] = useState<number>(1);
  const [travelDate, setTravelDate] = useState("2026-07-20");
  const [installmentMonths, setInstallmentMonths] = useState<number>(3);
  const [step, setStep] = useState<"details" | "pilgrims" | "payment" | "success">("details");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingRef, setBookingRef] = useState("");
  
  // Pilgrim form states
  const [pilgrimData, setPilgrimData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "M",
    passportNo: "",
    passportExpiry: "",
    nidNo: "",
    mahramName: "",
    mahramRelation: ""
  });
  
  const [showMahramWarning, setShowMahramWarning] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "rocket" | "card">("bkash");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    getUmrahPackage(slug)
      .then((data) => setPkg(mapApiPackage(data, fallback)))
      .catch(() => setPkg(fallback))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Calculations
  const totalPrice = pkg.price * pilgrimsCount;
  const downPayment = totalPrice * 0.3; // 30% downpayment
  const secondInstallment = totalPrice * 0.3; // 30% after 30 days
  const finalInstallment = totalPrice * 0.4; // 40% before 7 days

  // Dynamic monthly break-down for display options
  const monthlyFee = (totalPrice - downPayment) / installmentMonths;

  // Handle Pilgrim details change
  function handlePilgrimChange(field: string, value: string) {
    const updated = { ...pilgrimData, [field]: value };
    setPilgrimData(updated);

    // Enforce Mahram rule: Female under 45 requires Mahram
    if (updated.gender === "F" && updated.dob) {
      const dobDate = new Date(updated.dob);
      const today = new Date();
      let age = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        age--;
      }
      if (age < 45) {
        setShowMahramWarning(true);
      } else {
        setShowMahramWarning(false);
      }
    } else {
      setShowMahramWarning(false);
    }
  }

  // Handle booking form submission
  function handlePilgrimSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Validate Mahram rule if warning is shown
    if (showMahramWarning && (!pilgrimData.mahramName || !pilgrimData.mahramRelation)) {
      alert("A Mahram is mandatory for female pilgrims under the age of 45 under Saudi regulations.");
      return;
    }
    setStep("payment");
  }

  const paymentMethodMap = { bkash: "BKASH", nagad: "NAGAD", rocket: "ROCKET", card: "SSLCOMMERZ" } as const;

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      router.push(`/login?redirect=/umrah/${slug}`);
      return;
    }
    setBookingLoading(true);
    setBookingError("");
    try {
      const booking = await bookUmrah(token, {
        packageSlug: slug,
        pilgrimCount: pilgrimsCount,
        travelDate,
        contactEmail,
        contactPhone,
        pilgrimDocs: pilgrimData,
      });
      await payUmrahBooking(token, booking.bookingId, paymentMethodMap[paymentMethod]);
      setBookingRef(booking.bookingRef);
      setStep("success");
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <header className="border-b border-white/10 bg-brand-navy text-white py-4 px-6 sticky top-0 z-40 shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 font-sans">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-white hover:text-brand-gold font-bold text-sm transition">
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <span className="text-white/20">|</span>
            <span className="text-sm font-semibold text-white/90">Umrah Booking Console</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs bg-brand-gold/20 text-brand-gold border border-brand-gold/25 font-bold px-2.5 py-1 rounded">Phase 1 Spec</span>
            <SarahLogo className="scale-90" iconOnly />
          </div>
        </div>
      </header>

      {/* ── WIZARD PROGRESS BAR ───────────────────────────────────────── */}
      <div className="bg-slate-100 py-3 border-b">
        <div className="mx-auto max-w-4xl px-4 flex justify-between text-xs font-bold text-slate-500">
          <span className={step === "details" ? "text-brand-navy" : "text-slate-400"}>1. Package & Calculator</span>
          <span>→</span>
          <span className={step === "pilgrims" ? "text-brand-navy" : "text-slate-400"}>2. Pilgrim Register (Mahram Check)</span>
          <span>→</span>
          <span className={step === "payment" ? "text-brand-navy" : "text-slate-400"}>3. Payment (OTP Verify)</span>
          <span>→</span>
          <span className={step === "success" ? "text-brand-navy" : "text-slate-400"}>4. Confirmed Receipt</span>
        </div>
      </div>

      {/* ── MAIN CONTENT WIZARD ───────────────────────────────────────── */}
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 sm:px-6">
        
        {/* STEP 1: PACKAGE DETAILS & INSTALLMENT CALCULATOR */}
        {step === "details" && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Package Overview */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="h-64 bg-cover bg-center relative" style={{ backgroundImage: `url('${travelImages.umrah}')` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <span className="bg-brand-gold text-brand-navy text-xs font-black uppercase px-2.5 py-1 rounded">
                      {pkg.duration} Days Package
                    </span>
                    <h1 className="text-2xl font-black text-white mt-2 text-shadow-sm">{pkg.title}</h1>
                    <p className="text-xs text-slate-300 mt-1">{pkg.description}</p>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Quick Specs */}
                  <div className="grid gap-4 sm:grid-cols-2 text-sm text-slate-700 bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="flex items-center gap-2 font-semibold"><Plane className="h-4 w-4 text-brand-gold" /> Flight: {pkg.airline}</p>
                    <p className="flex items-center gap-2 font-semibold"><Plane className="h-4 w-4 text-brand-gold" /> Route: {pkg.route}</p>
                    <p className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-brand-gold" /> Makkah: {pkg.makkahHotel}</p>
                    <p className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-brand-gold" /> Madinah: {pkg.madinahHotel}</p>
                  </div>

                  {/* Inclusions / Exclusions */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="font-extrabold text-slate-900 border-b pb-2">What's Included</h3>
                      <ul className="mt-3 space-y-2 text-sm text-slate-600">
                        {pkg.inclusions.map((inc, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 border-b pb-2">Excluded</h3>
                      <ul className="mt-3 space-y-2 text-sm text-slate-600">
                        {pkg.exclusions.map((exc, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                            <span>{exc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Installment Calculator Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-brand-gold p-6 shadow-md relative">
                <span className="absolute -top-3 left-6 bg-brand-gold text-brand-navy text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow">
                  INSTALLMENT CALCULATOR
                </span>
                
                <h3 className="text-lg font-bold text-brand-navy mb-4 mt-2">Calculate Your Plan</h3>

                <div className="mb-4">
                  <label className="text-xs font-bold text-slate-500 block mb-1">Travel Date</label>
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:border-brand-navy"
                    required
                  />
                </div>

                {/* Pilgrims Picker */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-slate-500 block mb-1">Number of Pilgrims</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={10}
                    value={pilgrimsCount}
                    onChange={(e) => setPilgrimsCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:border-brand-navy"
                  />
                </div>

                {/* Installment Period Selector */}
                <div className="mb-6">
                  <label className="text-xs font-bold text-slate-500 block mb-1">Installment Period</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 6, 12].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setInstallmentMonths(m)}
                        className={`rounded-lg py-2 text-xs font-bold border transition ${
                          installmentMonths === m 
                            ? "bg-brand-navy text-white border-brand-navy" 
                            : "border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {m} Months
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 bg-slate-50 rounded-xl p-4 border text-sm text-slate-700 mb-6">
                  <div className="flex justify-between">
                    <span>Base Package (x{pilgrimsCount})</span>
                    <span className="font-semibold">{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-green-700 font-bold border-t pt-2 mt-2">
                    <span>30% Down Payment</span>
                    <span>{formatCurrency(downPayment)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-xs">
                    <span>2nd Installment (30 days)</span>
                    <span>{formatCurrency(secondInstallment)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-xs">
                    <span>3rd Installment (7 days prior)</span>
                    <span>{formatCurrency(finalInstallment)}</span>
                  </div>
                  <div className="border-t border-dashed my-2" />
                  <div className="flex justify-between items-center text-xs font-bold text-brand-navy bg-brand-gold/15 p-2 rounded">
                    <span>Monthly Installment Fee</span>
                    <span className="text-sm text-brand-navy font-black">{formatCurrency(monthlyFee)} / mo</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep("pilgrims")}
                  className="w-full bg-brand-navy hover:bg-opacity-95 text-white font-bold py-3 rounded-lg text-sm text-center shadow hover-lift transition"
                >
                  Book with Installment Plan
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-3">
                  * 0.3% NBR Advance Income Tax (AIT) automatically calculated on booking confirmation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PILGRIM REGISTRATION & MAHRAM VERIFICATION */}
        {step === "pilgrims" && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-brand-navy mb-2">Pilgrim Information Setup</h2>
              <p className="text-xs text-slate-500 mb-6">
                Please complete primary pilgrim details accurately. Passport validity must be greater than 6 months under Saudi Arabia entry conditions.
              </p>

              <form onSubmit={handlePilgrimSubmit} className="space-y-6">
                {/* Basic Identification */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">First Name (as in Passport)</label>
                    <input 
                      type="text" 
                      required 
                      value={pilgrimData.firstName}
                      onChange={(e) => handlePilgrimChange("firstName", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Last Name</label>
                    <input 
                      type="text" 
                      required 
                      value={pilgrimData.lastName}
                      onChange={(e) => handlePilgrimChange("lastName", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none" 
                    />
                  </div>
                </div>

                {/* DOB & Gender (triggers Mahram checking) */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Date of Birth</label>
                    <input 
                      type="date" 
                      required 
                      value={pilgrimData.dob}
                      onChange={(e) => handlePilgrimChange("dob", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Gender</label>
                    <select 
                      value={pilgrimData.gender}
                      onChange={(e) => handlePilgrimChange("gender", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none"
                    >
                      <option value="M">Male (পুরুষ)</option>
                      <option value="F">Female (মহিলা)</option>
                    </select>
                  </div>
                </div>

                {/* Enforce Saudi Mahram Rule Alert Box */}
                {showMahramWarning && (
                  <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-xl p-4 space-y-3 animate-pulse">
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm">Saudi Ministry of Hajj & Umrah Regulation</h4>
                        <p className="text-xs text-slate-600 mt-1">
                          Female pilgrims under the age of 45 MUST register a Mahram (male relative chaperone) in order to obtain the Umrah Visa.
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2 pt-2">
                      <div>
                        <label className="text-xs font-bold text-amber-800 block mb-1">Mahram Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={pilgrimData.mahramName}
                          onChange={(e) => handlePilgrimChange("mahramName", e.target.value)}
                          className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-amber-800 block mb-1">Relationship to Pilgrim</label>
                        <select
                          required
                          value={pilgrimData.mahramRelation}
                          onChange={(e) => handlePilgrimChange("mahramRelation", e.target.value)}
                          className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none"
                        >
                          <option value="">Select Relation</option>
                          <option value="Husband">Husband (স্বামী)</option>
                          <option value="Father">Father (পিতা)</option>
                          <option value="Brother">Brother (ভাই)</option>
                          <option value="Son">Son (পুত্র)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Passport & NID */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Passport Number</label>
                    <input 
                      type="text" 
                      required 
                      value={pilgrimData.passportNo}
                      onChange={(e) => handlePilgrimChange("passportNo", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Passport Expiration Date</label>
                    <input 
                      type="date" 
                      required 
                      value={pilgrimData.passportExpiry}
                      onChange={(e) => handlePilgrimChange("passportExpiry", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">NID Card Number</label>
                    <input 
                      type="text" 
                      required 
                      value={pilgrimData.nidNo}
                      onChange={(e) => handlePilgrimChange("nidNo", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none" 
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                  <button 
                    type="button" 
                    onClick={() => setStep("details")}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-lg text-sm font-bold transition"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-brand-navy hover:bg-opacity-95 text-white py-3 rounded-lg text-sm font-bold transition shadow"
                  >
                    Confirm & Proceed to Pay Downpayment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT & SSLCOMMERZ SIMULATION */}
        {step === "payment" && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-brand-navy mb-1">SSLCommerz Secured Payment</h2>
              <p className="text-xs text-slate-500 mb-6">Payment verified for Sarah Travels BD OTA Platform.</p>

              <div className="bg-slate-50 border rounded-xl p-4 mb-6 text-sm text-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span>Umrah Downpayment (30%)</span>
                  <span className="font-bold text-brand-navy">{formatCurrency(downPayment)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>AIT (0.3% included)</span>
                  <span>{formatCurrency(downPayment * 0.003)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>VAT (15% on Service Fee)</span>
                  <span>{formatCurrency(500 * 0.15)}</span>
                </div>
              </div>

              <form onSubmit={handlePayment} className="space-y-6">
                {/* Method selector */}
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">Choose Payment Channel</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "bkash", name: "bKash", color: "bg-[#E2125B] text-white" },
                      { id: "nagad", name: "Nagad", color: "bg-[#FA5A2A] text-white" },
                      { id: "rocket", name: "Rocket", color: "bg-[#8C237F] text-white" },
                      { id: "card", name: "Card / NetBanking", color: "bg-brand-navy text-white" }
                    ].map(method => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`rounded-lg py-3 text-xs font-black border transition ${
                          paymentMethod === method.id 
                            ? `${method.color} border-transparent` 
                            : "border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {method.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <input type="email" placeholder="Contact email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
                  <input type="tel" placeholder="Contact phone" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
                </div>

                {bookingError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{bookingError}</p>}

                <button
                  type="submit"
                  disabled={bookingLoading || !contactEmail || !contactPhone}
                  className="w-full bg-brand-gold text-brand-navy font-black py-3 rounded-lg text-sm text-center shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {bookingLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : `Pay Downpayment ${formatCurrency(downPayment)}`}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS RECEIPT */}
        {step === "success" && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
              <div className="mx-auto bg-green-50 p-4 rounded-full text-green-600 w-20 h-20 flex items-center justify-center">
                <CheckCircle className="h-12 w-12" />
              </div>
              
              <div>
                <h2 className="text-2xl font-black text-brand-navy">Umrah Booking Confirmed!</h2>
                <p className="text-xs text-slate-500 mt-2">
                  Reference: <span className="font-bold text-brand-navy text-sm uppercase">{bookingRef}</span>
                </p>
                <p className="text-sm text-slate-600 mt-3">
                  Down payment has been successfully authorized and billed via SSLCommerz. We have initiated the Nusuk Saudi visa validation procedure.
                </p>
              </div>

              <div className="bg-slate-50 border rounded-xl p-4 text-xs text-slate-600 text-left space-y-2">
                <p><span className="font-bold text-slate-800">Pilgrim:</span> {pilgrimData.firstName} {pilgrimData.lastName}</p>
                <p><span className="font-bold text-slate-800">Package:</span> {pkg.title}</p>
                <p><span className="font-bold text-slate-800">Paid downpayment:</span> {formatCurrency(downPayment)}</p>
                {showMahramWarning && <p><span className="font-bold text-slate-800 text-amber-800">Mahram:</span> {pilgrimData.mahramName} ({pilgrimData.mahramRelation})</p>}
              </div>

              <div className="space-y-2">
                <Link 
                  href="/account/bookings"
                  className="w-full block bg-brand-navy text-white text-sm font-bold py-2.5 rounded-lg text-center hover:bg-opacity-95 transition"
                >
                  Manage Booking & Print Invoices
                </Link>
                <Link 
                  href="/"
                  className="w-full block bg-slate-100 text-slate-700 text-sm font-bold py-2.5 rounded-lg text-center hover:bg-slate-200 transition"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
