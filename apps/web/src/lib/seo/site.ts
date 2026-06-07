export const siteConfig = {
  name: "Sarah Travels BD",
  shortName: "Sarah Travels",
  legalName: "Sarah Travels Bangladesh",
  tagline: "Flights, Hotels, Visa & Umrah",
  description:
    "Bangladesh's trusted online travel agency for flights, hotels, visa processing, Umrah packages, tours and airport transfers. IATA & ATAB certified. Book in BDT with bKash, Nagad & cards.",
  locale: "en_BD",
  language: "en",
  email: "info@sarahtravelsbd.com",
  phone: "+880-1XXX-XXXXXX",
  address: {
    streetAddress: "Dhaka",
    addressLocality: "Dhaka",
    addressRegion: "Dhaka Division",
    addressCountry: "BD",
  },
  social: {
    facebook: "https://facebook.com/sarahtravelsbd",
    instagram: "https://instagram.com/sarahtravelsbd",
  },
  keywords: [
    "Bangladesh travel agency",
    "flight booking Bangladesh",
    "hotel booking Dhaka",
    "Umrah package Bangladesh",
    "visa service Bangladesh",
    "Saudi visa Bangladesh",
    "Dubai hotel booking",
    "Sarah Travels BD",
    "OTA Bangladesh",
  ],
  services: [
    { name: "Flights", path: "/flights", description: "International flight search and booking" },
    { name: "Hotels", path: "/hotels", description: "Hotels and stays worldwide" },
    { name: "Visa", path: "/visa", description: "Visa application and document processing" },
    { name: "Umrah", path: "/umrah", description: "Umrah and Hajj packages with installments" },
    { name: "Tours", path: "/tours", description: "Domestic and international tour packages" },
    { name: "Car Rentals", path: "/cars", description: "Airport transfers and car hire" },
  ],
} as const;

/** Canonical site URL — set NEXT_PUBLIC_SITE_URL in production. */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
