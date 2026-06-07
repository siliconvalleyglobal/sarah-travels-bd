import type { Lang } from "./types";
import { pick } from "./types";

export const navLinks = [
  { href: "/flights", en: "Flights", bn: "ফ্লাইট" },
  { href: "/hotels", en: "Hotels", bn: "হোটেল" },
  { href: "/tours", en: "Tours", bn: "ট্যুর" },
  { href: "/cars", en: "Cars", bn: "গাড়ি" },
  { href: "/visa", en: "Visa", bn: "ভিসা" },
  { href: "/umrah", en: "Umrah", bn: "উমরাহ" },
  { href: "/agent", en: "Agents", bn: "এজেন্ট" },
  { href: "/account/bookings", en: "My Bookings", bn: "বুকিং" },
] as const;

export const common = {
  signIn: { en: "Sign In", bn: "লগইন" },
  register: { en: "Register", bn: "নিবন্ধন" },
  explore: { en: "Explore", bn: "দেখুন" },
  active: { en: "ACTIVE", bn: "সক্রিয়" },
  viewAll: { en: "View All", bn: "সব দেখুন" },
  viewPlans: { en: "View Plans", bn: "প্ল্যান দেখুন" },
  packagePrice: { en: "Package Price", bn: "প্যাকেজ মূল্য" },
  processing: { en: "Processing", bn: "প্রসেসিং সময়" },
  totalFee: { en: "Total Fee", bn: "মোট ফি" },
  days: { en: "Days", bn: "দিন" },
  requirementsApply: { en: "Requirements & Apply", bn: "প্রয়োজনীয় ফাইল ও আবেদন" },
  startingAt: { en: "Starting at", bn: "শুরু থেকে" },
  bookDeal: { en: "Book Deal", bn: "বুক করুন" },
  perNight: { en: "/ night", bn: "/ রাত" },
  reviews: { en: "reviews", bn: "রিভিউ" },
  properties: { en: "properties", bn: "প্রপার্টি" },
  daysRemaining: { en: "Days remaining", bn: "অবশিষ্ট দিন" },
  roundTrip: { en: "Round Trip", bn: "রাউন্ড ট্রিপ" },
  oneWay: { en: "One Way", bn: "ওয়ান ওয়ে" },
  budgetFriendly: { en: "Budget Friendly", bn: "বাজেট ফ্রেন্ডলি" },
  bestValue: { en: "BEST VALUE", bn: "সেরা ডিল" },
} as const;

export const visaCards = [
  {
    code: "SA",
    name: { en: "Saudi Arabia", bn: "সৌদি আরব" },
    fee: "12,000",
    days: 7,
    desc: { en: "Umrah, Tourist & Family visa.", bn: "উমরাহ, টুরিস্ট ও ফ্যামিলি ভিসা।" },
  },
  {
    code: "AE",
    name: { en: "United Arab Emirates", bn: "সংযুক্ত আরব আমিরাত" },
    fee: "8,500",
    days: 5,
    desc: { en: "Dubai, Abu Dhabi Tourist entry.", bn: "দুবাই, আবুধাবি টুরিস্ট এন্ট্রি।" },
  },
  {
    code: "MY",
    name: { en: "Malaysia", bn: "মালয়েশিয়া" },
    fee: "4,500",
    days: 3,
    desc: { en: "eVisa fast-track Tourist entry.", bn: "ই-ভিসা ফাস্ট-ট্র্যাক টুরিস্ট এন্ট্রি।" },
  },
  {
    code: "TH",
    name: { en: "Thailand", bn: "থাইল্যান্ড" },
    fee: "5,500",
    days: 5,
    desc: { en: "Medical and Tourist visa files.", bn: "মেডিকেল ও টুরিস্ট ভিসা ফাইল।" },
  },
] as const;

export const footer = {
  tagline: {
    en: "Bangladesh's premier enterprise travel platform. IATA certified, ATAB registered.",
    bn: "বাংলাদেশের বিশ্বস্ত এন্টারপ্রাইজ ট্রাভেল প্ল্যাটফর্ম। আইএটিএ সার্টিফাইড, আটাব রেজিস্টার্ড।",
  },
  compliance: { en: "NBR VAT & AIT Compliant", bn: "এনবিআর ভ্যাট ও এআইটি কমপ্লায়েন্ট" },
  services: { en: "Services", bn: "সেবাসমূহ" },
  company: { en: "Company", bn: "কোম্পানি" },
  contact: { en: "Contact", bn: "যোগাযোগ" },
  agentPortal: { en: "B2B Agent Portal", bn: "বি২বি এজেন্ট পোর্টাল" },
  myBookings: { en: "My Bookings", bn: "আমার বুকিং" },
  createAccount: { en: "Create Account", bn: "অ্যাকাউন্ট খুলুন" },
  address: { en: "Kakrail, Dhaka — Bangladesh", bn: "কাকরাইল, ঢাকা — বাংলাদেশ" },
  rights: { en: "All rights reserved.", bn: "সর্বস্বত্ব সংরক্ষিত।" },
  pricingNote: {
    en: "VAT 15% on service fee · AIT 0.3% on air tickets · Transparent pricing",
    bn: "সার্ভিস ফিতে ভ্যাট ১৫% · এয়ার টিকিটে এআইটি ০.৩% · স্বচ্ছ মূল্য",
  },
  serviceLinks: [
    { href: "/flights", en: "Flights", bn: "ফ্লাইট" },
    { href: "/hotels", en: "Hotels", bn: "হোটেল" },
    { href: "/visa", en: "Visa Services", bn: "ভিসা সেবা" },
    { href: "/umrah", en: "Umrah Packages", bn: "উমরাহ প্যাকেজ" },
    { href: "/tours", en: "Tours", bn: "ট্যুর" },
    { href: "/cars", en: "Car Rentals", bn: "গাড়ি ভাড়া" },
  ],
} as const;

export const home = {
  heroTitle: { en: "See the world for less", bn: "কম খরচে দেখুন বিশ্ব" },
  complianceNotice: { en: "NBR Tax & AIT Compliance System", bn: "এনবিআর কর ও এআইটি কমপ্লায়েন্স সিস্টেম" },
  vatNotice: {
    en: "VAT 15% applied to Service Fee only (transparent breakdown)",
    bn: "ভ্যাট ১৫% শুধুমাত্র সার্ভিস চার্জের উপর প্রযোজ্য (স্বচ্ছ হিসাব)",
  },
  aitBadge: { en: "AIT 0.3% AUTO-CALCULATED", bn: "এআইটি ০.৩% স্বয়ংক্রিয় হিসাব" },
  mushakBadge: { en: "MUSHAK 6.3 DIGITAL GENERATION", bn: "মুশাক ৬.৩ ডিজিটাল জেনারেশন" },
  iataBadge: { en: "IATA REGISTERED #9601234", bn: "আইএটিএ রেজিস্টার্ড #৯৬০১২৩৪" },
  suppliersEyebrow: { en: "Global Connectivity", bn: "গ্লোবাল কানেক্টিভিটি" },
  suppliersTitle: { en: "Integrated Global Suppliers Ecosystem", bn: "ইন্টিগ্রেটেড গ্লোবাল সাপ্লায়ার ইকোসিস্টেম" },
  suppliersSub: {
    en: "Direct server connections for real-time rates and live inventory verification.",
    bn: "রিয়েল-টাইম রেট ও লাইভ ইনভেন্টরি যাচাইয়ের জন্য সরাসরি সার্ভার সংযোগ।",
  },
  passportScanner: { en: "Passport Validity Scanner", bn: "পাসপোর্ট মেয়াদ যাচাইকরণ" },
  passportDesc: {
    en: "Ensure your travel stays stress-free. Type in your passport expiration date to verify if you satisfy the global 6-month validity rule before booking flights.",
    bn: "আপনার পাসপোর্ট মেয়াদ চেক করে নিশ্চিত হোন। আন্তর্জাতিক নিয়মানুযায়ী ভ্রমণের জন্য পাসপোর্টের অন্তত ৬ মাসের মেয়াদ থাকা আবশ্যক।",
  },
  verifyPassport: { en: "Verify Passport Expiry", bn: "মেয়াদ যাচাই করুন" },
  passportValid: {
    en: "Passport is valid for travel! (More than 6 months left)",
    bn: "পাসপোর্ট ভ্রমণের জন্য প্রস্তুত! (৬ মাসের বেশি সময় আছে)",
  },
  passportInvalid: {
    en: "Warning: Passport expires in less than 6 months. Renewal required!",
    bn: "সতর্কতা: পাসপোর্টের মেয়াদ ৬ মাসের কম। দ্রুত রিনিউ করুন!",
  },
  featuredPackages: { en: "Featured Umrah & Hajj Packages", bn: "উমরাহ ও হজ স্পেশাল প্যাকেজ" },
  featuredPackagesSub: {
    en: "Guided Umrah packages with premium airline flight booking and distance verified Mecca hotels.",
    bn: "সম্পূর্ণ গাইডেন্স ও দেশের সেরা বিমান ও হোটেল সুবিধাসহ নির্ভরযোগ্য উমরাহ অফার সমূহ।",
  },
  viewAllPackages: { en: "View All Packages", bn: "সব প্যাকেজ দেখুন" },
  visaQuickGuides: { en: "Country Visa Guides", bn: "ভিসা গাইড ও প্রয়োজনীয় ডকুমেন্টস" },
  visaQuickGuidesSub: {
    en: "Up-to-date visa criteria, processing fees, and checklist requirements verified under Bangladesh passport guidelines.",
    bn: "বাংলাদেশ পাসপোর্টের জন্য হালনাগাদ ভিসা তথ্য, সরকারি ও প্রসেসিং ফি এবং প্রয়োজনীয় ফাইল গাইডলাইন।",
  },
  sarahDeals: { en: "Sarah Deals", bn: "সারা ডিল" },
  trendingStays: { en: "Trending Stays & Hotels", bn: "জনপ্রিয় হোটেল ও স্টে" },
  trendingStaysSub: {
    en: "Handpicked properties with verified reviews, free cancellation, and best-price guarantee.",
    bn: "যাচাইকৃত রিভিউ, ফ্রি ক্যানসেলেশন ও বেস্ট প্রাইস গ্যারান্টিসহ নির্বাচিত হোটেল।",
  },
  viewAllProperties: { en: "View all properties", bn: "সব হোটেল দেখুন" },
  popularFlights: { en: "Popular International Flights", bn: "জনপ্রিয় আন্তর্জাতিক ফ্লাইট ডিল" },
  trustAtab: { en: "ATAB Registered Agent", bn: "আটাব রেজিস্টার্ড এজেন্ট" },
  trustAtabDesc: {
    en: "Member of Association of Travel Agents of Bangladesh. License Registry No: ATAB-10452/2026.",
    bn: "অ্যাসোসিয়েশন অব ট্রাভেল এজেন্টস অব বাংলাদেশের সদস্য। লাইসেন্স নং: আটাব-১০৪৫২/২০২৬।",
  },
  trustNbr: { en: "100% NBR Compliant", bn: "১০০% এনবিআর কমপ্লায়েন্ট" },
  trustNbrDesc: {
    en: "Ensuring secure, transparent tax structures with automatic AIT (0.3% air tickets) and service fee VAT generation on digital invoicing.",
    bn: "এয়ার টিকিটে স্বয়ংক্রিয় এআইটি (০.৩%) ও সার্ভিস ফিতে ভ্যাটসহ স্বচ্ছ ডিজিটাল ইনভয়েসিং।",
  },
  trustSsl: { en: "SSLCommerz Secured Checkout", bn: "এসএসএলকমার্জ সুরক্ষিত পেমেন্ট" },
  trustSslDesc: {
    en: "Complete integration with SSLCommerz, processing bKash, Nagad, Rocket, cards, and Net Banking instantly.",
    bn: "বিকাশ, নগদ, রকেট, কার্ড ও নেট ব্যাংকিং — এসএসএলকমার্জের মাধ্যমে তাৎক্ষণিক পেমেন্ট।",
  },
} as const;

export const bentoTiles = [
  {
    title: { en: "International Flights", bn: "আন্তর্জাতিক ফ্লাইট" },
    sub: { en: "DAC → DXB, JED, LHR & more", bn: "ঢাকা → দুবাই, জেদ্দা, লন্ডন ও আরও" },
    href: "/flights",
    large: true,
  },
  {
    title: { en: "Luxury Hotels", bn: "লাক্সারি হোটেল" },
    sub: { en: "Dubai JLT to Cox's Bazar resorts", bn: "দুবাই থেকে কক্সবাজার রিসোর্ট" },
    href: "/hotels",
  },
  {
    title: { en: "Visa Processing", bn: "ভিসা প্রসেসিং" },
    sub: { en: "UAE, Saudi, UK, USA & more", bn: "ইউএই, সৌদি, যুক্তরাজ্য, যুক্তরাষ্ট্র" },
    href: "/visa",
  },
  {
    title: { en: "Umrah & Hajj", bn: "উমরাহ ও হজ" },
    sub: { en: "Installment-friendly packages", bn: "কিস্তিতে প্যাকেজ সুবিধা" },
    href: "/umrah",
    large: true,
  },
  {
    title: { en: "Local Tours", bn: "লোকাল ট্যুর" },
    sub: { en: "Sundarbans to Maldives", bn: "সুন্দরবন থেকে মালদ্বীপ" },
    href: "/tours",
  },
  {
    title: { en: "Airport Transfers", bn: "এয়ারপোর্ট ট্রান্সফার" },
    sub: { en: "Sedan to VIP SUV fleet", bn: "সেডান থেকে ভিআইপি এসইউভি" },
    href: "/cars",
  },
] as const;

export const exploreSection = {
  eyebrow: { en: "Full Travel Platform", bn: "সম্পূর্ণ ট্রাভেল প্ল্যাটফর্ম" },
  titleLead: { en: "Everything you need to ", bn: "ভ্রমণের জন্য " },
  titleHighlight: { en: "book & go", bn: "সবকিছু এক জায়গায়" },
  subtitle: {
    en: "Flights, hotels, visa, Umrah, tours and transfers — one account, one checkout flow, full booking history.",
    bn: "ফ্লাইট, হোটেল, ভিসা, উমরাহ, ট্যুর ও গাড়ি — একটি অ্যাকাউন্টে সব বুকিং।",
  },
  tabs: [
    {
      id: "flights",
      short: { en: "Flights", bn: "ফ্লাইট" },
      title: {
        en: "Search 6+ airlines with transparent BDT pricing",
        bn: "৬+ এয়ারলাইনে স্বচ্ছ বিডিটি মূল্যে ফ্লাইট খুঁজুন",
      },
      bullets: {
        en: [
          "Amadeus-powered mock search with live PNR generation",
          "Service fee + VAT breakdown before checkout",
          "bKash, Nagad, SSLCommerz sandbox payments",
          "Instant e-ticket confirmation on payment",
        ],
        bn: [
          "অ্যামাডিয়াস-চালিত সার্চ ও লাইভ পিএনআর জেনারেশন",
          "চেকআউটের আগে সার্ভিস ফি + ভ্যাট বিস্তারিত",
          "বিকাশ, নগদ, এসএসএলকমার্জ পেমেন্ট",
          "পেমেন্টের পর তাৎক্ষণিক ই-টিকেট কনফার্মেশন",
        ],
      },
      cta: { en: "Search Flights", bn: "ফ্লাইট খুঁজুন" },
      href: "/flights",
    },
    {
      id: "hotels",
      short: { en: "Hotels", bn: "হোটেল" },
      title: {
        en: "Premium stays from Dubai to Cox's Bazar",
        bn: "দুবাই থেকে কক্সবাজার — প্রিমিয়াম স্টে",
      },
      bullets: {
        en: [
          "Sarah search with filters and map view",
          "Room-level booking with confirmation codes",
          "Deal badges and amenity filters",
          "My Bookings integration",
        ],
        bn: [
          "ফিল্টার ও ম্যাপ ভিউসহ স্মার্ট হোটেল সার্চ",
          "রুম-লেভেল বুকিং ও কনফার্মেশন কোড",
          "ডিল ব্যাজ ও সুবিধা ফিল্টার",
          "আমার বুকিংয়ে সংযুক্ত",
        ],
      },
      cta: { en: "Find Hotels", bn: "হোটেল খুঁজুন" },
      href: "/hotels",
    },
    {
      id: "visa",
      short: { en: "Visa", bn: "ভিসা" },
      title: {
        en: "End-to-end visa with document upload",
        bn: "ডকুমেন্ট আপলোডসহ সম্পূর্ণ ভিসা সেবা",
      },
      bullets: {
        en: [
          "5-step wizard: checklist → photo → form → pay",
          "Regulatory photo cropper simulation",
          "Passport & bank statement upload to API",
          "Live application status tracking",
        ],
        bn: [
          "৫ ধাপের উইজার্ড: চেকলিস্ট → ফটো → ফর্ম → পেমেন্ট",
          "নিয়মানুযায়ী ফটো ক্রপার",
          "পাসপোর্ট ও ব্যাংক স্টেটমেন্ট আপলোড",
          "লাইভ আবেদন স্ট্যাটাস ট্র্যাকিং",
        ],
      },
      cta: { en: "Apply for Visa", bn: "ভিসার আবেদন করুন" },
      href: "/visa",
    },
    {
      id: "umrah",
      short: { en: "Umrah", bn: "উমরাহ" },
      title: {
        en: "Complete packages with installment plans",
        bn: "কিস্তি সুবিধাসহ সম্পূর্ণ উমরাহ প্যাকেজ",
      },
      bullets: {
        en: [
          "Economy to Premium 7–14 day packages",
          "30% down-payment to confirm booking",
          "Makkah & Madinah hotel distance verified",
          "Pilgrim document collection",
        ],
        bn: [
          "ইকোনমি থেকে প্রিমিয়াম ৭–১৪ দিনের প্যাকেজ",
          "বুকিং কনফার্মে মাত্র ৩০% ডাউনপেমেন্ট",
          "মক্কা-মদিনা হোটেল দূরত্ব যাচাইকৃত",
          "হাজি ডকুমেন্ট সংগ্রহ সুবিধা",
        ],
      },
      cta: { en: "View Packages", bn: "প্যাকেজ দেখুন" },
      href: "/umrah",
    },
    {
      id: "tours",
      short: { en: "Tours", bn: "ট্যুর" },
      title: {
        en: "Guided Bangladesh & international tours",
        bn: "বাংলাদেশ ও আন্তর্জাতিক গাইডেড ট্যুর",
      },
      bullets: {
        en: [
          "Cox's Bazar, Sundarbans, Sylhet, Maldives",
          "Itinerary timelines and inclusions",
          "Per-guest pricing with service fee",
          "Instant confirmation on payment",
        ],
        bn: [
          "কক্সবাজার, সুন্দরবন, সিলেট, মালদ্বীপ",
          "ইতিনারারি ও ইনক্লুশন বিস্তারিত",
          "প্রতি অতিথির মূল্য ও সার্ভিস ফি",
          "পেমেন্টে তাৎক্ষণিক কনফার্মেশন",
        ],
      },
      cta: { en: "Explore Tours", bn: "ট্যুর দেখুন" },
      href: "/tours",
    },
  ],
} as const;

export const marquee = {
  titleLead: { en: "Built for ", bn: "তৈরি " },
  titleHighlight: { en: "modern travel", bn: "আধুনিক ভ্রমণের জন্য" },
  subtitle: {
    en: "Enterprise integrations · Transparent pricing · Full booking lifecycle",
    bn: "এন্টারপ্রাইজ ইন্টিগ্রেশন · স্বচ্ছ মূল্য · সম্পূর্ণ বুকিং লাইফসাইকেল",
  },
  rowA: {
    en: [
      "Flight Search", "Hotel Booking", "Visa Application", "Umrah Packages", "Tour Packages",
      "Car Transfers", "bKash Payments", "Nagad Checkout", "SSLCommerz", "NBR VAT Invoice",
      "PNR Generation", "Installment Plans",
    ],
    bn: [
      "ফ্লাইট সার্চ", "হোটেল বুকিং", "ভিসা আবেদন", "উমরাহ প্যাকেজ", "ট্যুর প্যাকেজ",
      "গাড়ি ট্রান্সফার", "বিকাশ পেমেন্ট", "নগদ চেকআউট", "এসএসএলকমার্জ", "এনবিআর ভ্যাট ইনভয়েস",
      "পিএনআর জেনারেশন", "কিস্তি সুবিধা",
    ],
  },
  rowB: {
    en: [
      "Amadeus API", "Global Hotels", "Viator Tours", "Document Upload", "Photo Cropper",
      "My Bookings", "Agent Portal", "Passport Scanner", "B2B Wallet", "Confirmation Codes",
      "ATAB Registered", "IATA Certified",
    ],
    bn: [
      "অ্যামাডিয়াস এপিআই", "গ্লোবাল হোটেল", "ভায়েটর ট্যুর", "ডকুমেন্ট আপলোড", "ফটো ক্রপার",
      "আমার বুকিং", "এজেন্ট পোর্টাল", "পাসপোর্ট স্ক্যানার", "বি২বি ওয়ালেট", "কনফার্মেশন কোড",
      "আটাব রেজিস্টার্ড", "আইএটিএ সার্টিফাইড",
    ],
  },
} as const;

export const testimonials = {
  eyebrow: { en: "Trusted by travelers", bn: "ভ্রমণকারীদের বিশ্বস্ত প্ল্যাটফর্ম" },
  titleLead: { en: "Real stories from ", bn: "বাস্তব অভিজ্ঞতা — " },
  titleHighlight: { en: "real bookings", bn: "আসল বুকিং" },
  stories: [
    {
      company: { en: "Dhaka Business Travel", bn: "ঢাকা বিজনেস ট্রাভেল" },
      stat: "4.9★",
      statLabel: { en: "Customer satisfaction", bn: "গ্রাহক সন্তুষ্টি" },
      quote: {
        en: "We moved our entire agency booking flow to Sarah Travels. Flights, Umrah packages, and visa applications all in one portal — our clients love the transparency.",
        bn: "আমাদের পুরো এজেন্সি বুকিং এখন সারা ট্রাভেলসে। ফ্লাইট, উমরাহ ও ভিসা — সব এক পোর্টালে, গ্রাহকরা স্বচ্ছতা পছন্দ করেন।",
      },
      person: { en: "Md. Jamil Khan", bn: "মো. জামিল খান" },
      role: { en: "Frequent Business Traveler", bn: "নিয়মিত বিজনেস ট্রাভেলার" },
    },
    {
      company: { en: "Family Umrah Group", bn: "ফ্যামিলি উমরাহ গ্রুপ" },
      stat: "30%",
      statLabel: { en: "Down-payment only", bn: "শুধু ডাউনপেমেন্ট" },
      quote: {
        en: "The installment plan made our Umrah dream possible. Booked the Standard 10-day package, paid 30% upfront, and tracked everything in My Bookings.",
        bn: "কিস্তি সুবিধায় উমরাহ সম্ভব হয়েছে। স্ট্যান্ডার্ড ১০ দিনের প্যাকেজ বুক করে ৩০% দিয়ে বাকি ট্র্যাক করেছি।",
      },
      person: { en: "Mrs. Salma Begum", bn: "মিসেস সালমা বেগম" },
      role: { en: "Umrah Pilgrim, Chittagong", bn: "উমরাহ হাজি, চট্টগ্রাম" },
    },
    {
      company: { en: "UAE Visa Applicant", bn: "ইউএই ভিসা আবেদনকারী" },
      stat: "~5 days",
      statLabel: { en: "Processing time", bn: "প্রসেসিং সময়" },
      quote: {
        en: "Uploaded passport and bank statement directly in the visa wizard. No more running to the office with paper files — everything tracked online.",
        bn: "ভিসা উইজার্ডে সরাসরি পাসপোর্ট ও ব্যাংক স্টেটমেন্ট আপলোড করেছি। অফিসে ফাইল নিয়ে ঘোরাঘুরি লাগে না।",
      },
      person: { en: "Rahim Uddin", bn: "রহিম উদ্দিন" },
      role: { en: "Dubai Tourist Visa", bn: "দুবাই টুরিস্ট ভিসা" },
    },
  ],
} as const;

export const heroCollage = {
  trusted: { en: "Trusted travel partner", bn: "বিশ্বস্ত ট্রাভেল পার্টনার" },
  services: { en: "Flights · Hotels · Visa · Umrah", bn: "ফ্লাইট · হোটেল · ভিসা · উমরাহ" },
} as const;

export const bentoSection = {
  eyebrow: { en: "Destinations & Services", bn: "গন্তব্য ও সেবা" },
  titleLead: { en: "Travel made ", bn: "ভ্রমণ " },
  titleHighlight: { en: "visual", bn: "সহজ" },
} as const;

export function navLabel(lang: Lang, item: (typeof navLinks)[number]) {
  return pick(lang, { en: item.en, bn: item.bn });
}
