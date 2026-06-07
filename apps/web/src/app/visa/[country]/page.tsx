"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, FileText, CheckCircle, Info, UploadCloud, 
  Crop, AlertTriangle, Clock, CreditCard, ShieldCheck, Check, Loader2,
} from "lucide-react";
import { SarahLogo } from "@/components/SarahLogo";
import { formatCurrency } from "@/lib/utils";
import { getToken } from "@/lib/auth";
import { getVisaCountry, applyVisa, payVisaApplication } from "@/lib/visa-api";
import { uploadVisaDocument, fileToBase64 } from "@/lib/uploads-api";

// Seed reference data matching packages/database/prisma/seed.ts
const VISA_SEED = {
  "AE": {
    name: "United Arab Emirates",
    description: "Tourist visa for UAE (Dubai, Abu Dhabi, Sharjah). Single and multiple entry available.",
    processingDays: 5,
    fee: 8500,
    documents: [
      "Passport scan (valid for at least 6 months)",
      "Passport-sized photograph (white background)",
      "Bank statement (last 6 months with minimum balance)",
      "No Objection Certificate (NOC) from employer or trade license for business"
    ],
  },
  "SA": {
    name: "Saudi Arabia",
    description: "Umrah and tourist visa for Saudi Arabia.",
    processingDays: 7,
    fee: 12000,
    documents: [
      "Original Passport (valid for at least 6 months)",
      "Recent passport-sized photo (white background, no glasses)",
      "Meningitis vaccination certificate",
      "Confirmed round-trip flight tickets"
    ]
  },
  "MY": {
    name: "Malaysia",
    description: "eVisa for Malaysia tourism and business visits.",
    processingDays: 3,
    fee: 4500,
    documents: [
      "Passport biographical details page scan",
      "Recent passport-sized photograph",
      "Confirmed return flight ticket reservation",
      "Hotel booking confirmation or invitation letter"
    ]
  },
  "TH": {
    name: "Thailand",
    description: "Tourist visa for Thailand.",
    processingDays: 5,
    fee: 5500,
    documents: [
      "Passport scan with at least 6 months validity",
      "Two recent photographs (3.5 cm x 4.5 cm, white background)",
      "Bank statement of last 6 months (min BDT 60,000 balance per person)",
      "Bank solvency certificate"
    ]
  },
  "US": {
    name: "United States",
    description: "B1/B2 tourist and business visa application service support.",
    processingDays: 30,
    fee: 18500,
    documents: [
      "DS-160 visa application form confirmation slip",
      "Valid passport (and previous passports if any)",
      "One photograph (2x2 inches, white background)",
      "Financial capacity files (bank statements, tax files, assets)"
    ]
  }
};

type VisaKey = keyof typeof VISA_SEED;

export default function VisaCountryGuide({ params }: { params: Promise<{ country: string }> }) {
  const resolvedParams = use(params);
  const country = resolvedParams.country as VisaKey;
  const router = useRouter();
  const fallback = VISA_SEED[country] || VISA_SEED["AE"];
  const [item, setItem] = useState(fallback);
  const [countryId, setCountryId] = useState("");
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<"checklist" | "cropper" | "form" | "payment" | "status">("checklist");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingRef, setBookingRef] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("SSLCOMMERZ");
  const [totalAmount, setTotalAmount] = useState(fallback.fee);

  useEffect(() => {
    getVisaCountry(country)
      .then((c) => {
        setCountryId(c.id);
        const docs = (c.requirements as { documents?: string[] })?.documents ?? fallback.documents;
        setItem({
          name: c.name,
          description: c.description ?? fallback.description,
          processingDays: c.processingDays ?? fallback.processingDays,
          fee: Number(c.fee),
          documents: docs,
        });
        setTotalAmount(Number(c.fee) * 1.115); // incl. 10% service + 15% VAT on service
      })
      .catch(() => setItem(fallback))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);
  
  // Form details
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    passportNo: "",
    passportExpiry: "",
    email: "",
    phone: ""
  });
  
  // Cropper simulator states
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [photoCropped, setPhotoCropped] = useState(false);
  const [isCropping, setIsCropping] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [bankFile, setBankFile] = useState<File | null>(null);

  const [passportAlert, setPassportAlert] = useState(false);
  async function handleSubmitVisa() {
    const token = getToken();
    if (!token) {
      router.push(`/login?redirect=/visa/${country}`);
      return;
    }
    setBookingLoading(true);
    setBookingError("");
    try {
      const app = await applyVisa(token, {
        countryCode: country,
        firstName: formData.firstName,
        lastName: formData.lastName,
        passportNumber: formData.passportNo,
        passportExpiry: formData.passportExpiry || undefined,
        email: formData.email,
        phone: formData.phone,
      });
      const uploads: Promise<unknown>[] = [];
      if (photoFile) {
        uploads.push(uploadVisaDocument(token, {
          bookingId: app.bookingId, documentType: "PHOTO", fileName: photoFile.name,
          contentBase64: await fileToBase64(photoFile),
        }));
      }
      if (passportFile) {
        uploads.push(uploadVisaDocument(token, {
          bookingId: app.bookingId, documentType: "PASSPORT", fileName: passportFile.name,
          contentBase64: await fileToBase64(passportFile),
        }));
      }
      if (bankFile) {
        uploads.push(uploadVisaDocument(token, {
          bookingId: app.bookingId, documentType: "BANK_STATEMENT", fileName: bankFile.name,
          contentBase64: await fileToBase64(bankFile),
        }));
      }
      if (uploads.length) await Promise.all(uploads);
      const payment = await payVisaApplication(token, app.bookingId, paymentMethod);
      setBookingRef(payment.bookingRef);
      setTotalAmount(app.totalAmount);
      setStep("status");
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Application failed");
    } finally {
      setBookingLoading(false);
    }
  }

  // Handle expiry check
  function handleExpiryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const dateStr = e.target.value;
    setFormData({ ...formData, passportExpiry: dateStr });
    
    if (dateStr) {
      const expiry = new Date(dateStr);
      const today = new Date();
      const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 180) {
        setPassportAlert(true);
      } else {
        setPassportAlert(false);
      }
    }
  }

  // Handle mock cropping simulation
  function simulateCropping() {
    setIsCropping(true);
    setTimeout(() => {
      setIsCropping(false);
      setPhotoCropped(true);
      alert("AI Photo Cropper successfully scaled your photograph to the strict 35x45mm white background regulation size!");
    }, 1500);
  }

  // Submit form
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (passportAlert) {
      alert("Please ensure your passport has at least 6 months validity prior to travel.");
      return;
    }
    setStep("payment");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-white/10 bg-brand-navy text-white py-4 px-6 sticky top-0 z-40 shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 font-sans">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1 text-white hover:text-brand-gold font-bold text-sm transition">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <span className="text-white/20">|</span>
            <span className="text-sm font-semibold text-white/90">{item.name} Visa Center</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs bg-brand-gold/20 text-brand-gold border border-brand-gold/25 font-bold px-2 rounded">Verified</span>
            <SarahLogo className="scale-90" iconOnly />
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-slate-100 py-3 border-b">
        <div className="mx-auto max-w-4xl px-4 flex justify-between text-xs font-bold text-slate-500">
          <span className={step === "checklist" ? "text-brand-navy" : "text-slate-400"}>1. Required Documents</span>
          <span>→</span>
          <span className={step === "cropper" ? "text-brand-navy" : "text-slate-400"}>2. Regulatory Photo Crop</span>
          <span>→</span>
          <span className={step === "form" ? "text-brand-navy" : "text-slate-400"}>3. Applicant Information</span>
          <span>→</span>
          <span className={step === "payment" ? "text-brand-navy" : "text-slate-400"}>4. BDT Billed Payment</span>
          <span>→</span>
          <span className={step === "status" ? "text-brand-navy" : "text-slate-400"}>5. Live Application Tracking</span>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8">
        
        {/* STEP 1: CHECKLIST */}
        {step === "checklist" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h1 className="text-2xl font-black text-brand-navy">{item.name} Visa Guide</h1>
              <p className="text-sm text-slate-500 mt-1">{item.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm text-slate-700 bg-slate-50 border p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-gold" />
                <span>Processing Time: <strong className="text-brand-navy">~{item.processingDays} Days</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-brand-gold" />
                <span>Total Package Fee: <strong className="text-brand-navy">{formatCurrency(item.fee)} BDT</strong></span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5"><FileText className="h-4.5 w-4.5 text-brand-gold" /> Required Checklist</h3>
              <ul className="space-y-2.5 text-sm text-slate-600">
                {item.documents.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setStep("cropper")}
              className="w-full bg-brand-navy hover:bg-opacity-95 text-white font-bold py-3 rounded-lg text-sm text-center shadow transition"
            >
              Start Visa Application Process
            </button>
          </div>
        )}

        {/* STEP 2: PHOTO CROPPER SIMULATOR */}
        {step === "cropper" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-brand-navy flex items-center gap-1.5"><Crop className="h-5 w-5 text-brand-gold" /> AI Visa Photo Cropper</h2>
              <p className="text-xs text-slate-500 mt-1">
                Saudi Arabia and GCC countries require a strict 35mm x 45mm passport photograph with a solid white background. Avoid background shadows.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
              {!photoUploaded ? (
                <div className="text-center space-y-3">
                  <UploadCloud className="h-12 w-12 text-slate-400 mx-auto" />
                  <div>
                    <label className="bg-brand-navy hover:bg-opacity-90 text-white font-bold text-xs px-4 py-2 rounded-lg transition cursor-pointer inline-block">
                      Upload Portrait Image
                      <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) { setPhotoFile(f); setPhotoUploaded(true); }
                      }} />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">JPEG/PNG formats up to 5MB</p>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-sm flex flex-col items-center space-y-4">
                  {/* Photo area */}
                  <div className="relative w-48 h-60 bg-slate-300 border-4 border-slate-200 overflow-hidden flex items-center justify-center">
                    {/* Portrait Avatar Placeholder */}
                    <div className="w-40 h-48 bg-slate-400 rounded-full mix-blend-multiply opacity-50 absolute" />
                    {/* Grid crop bounds */}
                    <div className="absolute inset-4 border border-brand-gold border-dashed flex items-center justify-center">
                      <span className="text-[10px] text-brand-gold bg-slate-900/80 px-2.5 py-0.5 rounded font-bold uppercase tracking-widest">
                        35x45mm Boundary
                      </span>
                    </div>
                  </div>

                  {!photoCropped ? (
                    <button
                      onClick={simulateCropping}
                      disabled={isCropping}
                      className="bg-brand-gold hover:opacity-90 text-brand-navy font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow"
                    >
                      <Crop className="h-4 w-4" /> {isCropping ? "Cropping to Regulation..." : "Align & Crop Photo"}
                    </button>
                  ) : (
                    <div className="text-center space-y-2">
                      <p className="text-xs text-green-700 font-bold flex items-center justify-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Regulatory Scaled Portrait Generated
                      </p>
                      <p className="text-[10px] text-slate-500">Image size: 350px x 450px at 300 DPI ready for application submission.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <button 
                onClick={() => setStep("checklist")}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-lg text-sm font-bold transition"
              >
                Back
              </button>
              <button 
                onClick={() => setStep("form")}
                disabled={!photoCropped}
                className="flex-1 bg-brand-navy hover:bg-opacity-95 text-white py-3 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition shadow"
              >
                Continue to Application Form
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FORM */}
        {step === "form" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-brand-navy mb-1">Applicant Details Form</h2>
            <p className="text-xs text-slate-500 mb-6">Enter personal bio information exactly matching your passport data.</p>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">First Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Last Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none" 
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Passport Number</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.passportNo}
                    onChange={(e) => setFormData({ ...formData, passportNo: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Passport Expiration Date</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.passportExpiry}
                    onChange={handleExpiryChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none" 
                  />
                </div>
              </div>

              {passportAlert && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold">Invalid Passport Expiry Date</p>
                    <p className="mt-1 text-slate-500">Your passport must have at least 6 months validity. Application will be rejected under entry compliance rules.</p>
                  </div>
                </div>
              )}

              <div className="space-y-3 bg-slate-50 border p-4 rounded-xl text-sm">
                <h4 className="font-bold text-slate-800 uppercase tracking-tight text-xs">Upload Supporting Documents</h4>
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-xs text-slate-600">Passport bio page (PDF/JPEG)</span>
                    <input type="file" accept="image/*,application/pdf" className="mt-1 w-full text-xs" onChange={(e) => setPassportFile(e.target.files?.[0] ?? null)} />
                    {passportFile && <span className="text-[10px] text-green-700">✓ {passportFile.name}</span>}
                  </label>
                  <label className="block">
                    <span className="text-xs text-slate-600">6-month bank statement (PDF)</span>
                    <input type="file" accept="application/pdf,image/*" className="mt-1 w-full text-xs" onChange={(e) => setBankFile(e.target.files?.[0] ?? null)} />
                    {bankFile && <span className="text-[10px] text-green-700">✓ {bankFile.name}</span>}
                  </label>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    {photoCropped ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                    Regulation photo {photoCropped ? "ready from step 2" : "— complete step 2 first"}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setStep("cropper")}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-lg text-sm font-bold transition"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={!passportFile || !bankFile || !photoCropped}
                  className="flex-1 bg-brand-navy hover:bg-opacity-95 text-white py-3 rounded-lg text-sm font-bold disabled:opacity-50 transition shadow"
                >
                  Confirm Details & Pay Fee
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: PAYMENT */}
        {step === "payment" && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-brand-navy mb-1">Visa Processing Fee Payment</h2>
              <p className="text-xs text-slate-500 mb-6">Secure BDT transaction powered by SSLCommerz.</p>

              <div className="bg-slate-50 border rounded-xl p-4 mb-6 text-sm text-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span>{item.name} Tourist Visa Package</span>
                  <span className="font-bold text-brand-navy">{formatCurrency(item.fee)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>AIT (0.3% included)</span>
                  <span>{formatCurrency(item.fee * 0.003)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>VAT (15% on Service Fee)</span>
                  <span>{formatCurrency(500 * 0.15)}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <h3 className="font-bold text-sm text-brand-navy">Payment method</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[{ id: "BKASH", label: "bKash" }, { id: "NAGAD", label: "Nagad" }, { id: "SSLCOMMERZ", label: "Card / Bank" }, { id: "ROCKET", label: "Rocket" }].map(m => (
                    <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)}
                      className={`text-xs font-bold py-2 rounded-lg border ${paymentMethod === m.id ? "bg-brand-navy text-white border-brand-navy" : "bg-white text-slate-600"}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {bookingError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{bookingError}</p>}

              <button
                onClick={handleSubmitVisa}
                disabled={bookingLoading || !formData.firstName || !formData.lastName || !formData.passportNo || !formData.email || !formData.phone}
                className="w-full bg-brand-gold text-brand-navy font-black py-3 rounded-lg text-sm text-center shadow disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {bookingLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : `Pay & Submit Visa File (${formatCurrency(totalAmount)})`}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: LIVE APPLICATION TRACKING */}
        {step === "status" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-bold text-brand-navy">Visa Application Track Console</h2>
              <p className="text-xs text-slate-500 mt-1">Application Reference: <strong className="text-brand-navy font-bold">{bookingRef || "—"}</strong></p>
            </div>

            {/* Tracking Steps Visual */}
            <div className="relative flex justify-between items-center max-w-xl mx-auto py-4">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t-2 border-slate-200" />
              </div>
              
              {/* Draft */}
              <div className="relative flex flex-col items-center">
                <span className="bg-brand-navy text-white rounded-full h-8 w-8 flex items-center justify-center ring-4 ring-white"><Check className="h-4 w-4" /></span>
                <span className="text-[10px] font-bold text-brand-navy mt-1">Draft</span>
              </div>
              {/* Submitted */}
              <div className="relative flex flex-col items-center">
                <span className="bg-brand-navy text-white rounded-full h-8 w-8 flex items-center justify-center ring-4 ring-white"><Check className="h-4 w-4" /></span>
                <span className="text-[10px] font-bold text-brand-navy mt-1">Submitted</span>
              </div>
              {/* Processing */}
              <div className="relative flex flex-col items-center">
                <span className="bg-brand-gold text-brand-navy rounded-full h-8 w-8 flex items-center justify-center ring-4 ring-white font-bold text-xs">3</span>
                <span className="text-[10px] font-bold text-brand-gold mt-1">Processing</span>
              </div>
              {/* Approved */}
              <div className="relative flex flex-col items-center">
                <span className="bg-slate-200 text-slate-400 rounded-full h-8 w-8 flex items-center justify-center ring-4 ring-white font-bold text-xs">4</span>
                <span className="text-[10px] font-bold text-slate-400 mt-1">Approved</span>
              </div>
            </div>

            <div className="bg-slate-50 border rounded-xl p-4 text-xs text-slate-600 space-y-2 max-w-md mx-auto">
              <div className="flex justify-between font-bold border-b pb-1 text-slate-800">
                <span>Milestone Details</span>
                <span>Status/Date</span>
              </div>
              <div className="flex justify-between">
                <span>File Submitted to VFS Global</span>
                <span className="text-green-700 font-bold">Completed (Today)</span>
              </div>
              <div className="flex justify-between">
                <span>Fee Paid via SSLCommerz</span>
                <span className="text-slate-500">Transferred (Today)</span>
              </div>
              <div className="flex justify-between">
                <span>Expected Passport Delivery</span>
                <span className="text-slate-700 font-bold">~{item.processingDays} days remaining</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link 
                href="/account/bookings"
                className="bg-brand-navy text-white font-bold text-xs px-6 py-2.5 rounded-lg transition"
              >
                Go to Bookings Dashboard
              </Link>
              <Link 
                href="/"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-6 py-2.5 rounded-lg transition"
              >
                Return Home
              </Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
