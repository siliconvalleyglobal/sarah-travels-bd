/** Centralized travel marketing imagery (Unsplash) */
export const travelImages = {
  hero: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=85",
  heroStack1: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=85",
  heroStack2: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85",
  heroStack3: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=85",
  flights: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=85",
  hotels: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=85",
  visa: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&q=85",
  umrah: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=900&q=85",
  tours: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=85",
  cars: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=900&q=85",
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=85",
  dhaka: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=900&q=85",
  coxsBazar: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=85",
  sundarbans: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=900&q=85",
  sylhet: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=900&q=85",
  maldives: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=900&q=85",
  makkah: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=900&q=85",
  carSedan: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=85",
  carVan: "https://images.unsplash.com/photo-1544629907-4f3e47f5b4e2?w=800&q=85",
  carSuv: "https://images.unsplash.com/photo-1519641471654-76ce5557eb85?w=800&q=85",
  testimonial1: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=85",
  testimonial2: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=85",
  testimonial3: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=85",
  singapore: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=900&q=85",
  malaysia: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=900&q=85",
  thailand: "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=900&q=85",
  usa: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900&q=85",
  india: "https://images.unsplash.com/photo-1548013146-72479768bada?w=900&q=85",
  canada: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=900&q=85",
  uk: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=900&q=85",
  worldMap: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=85",
  passport: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&q=85",
} as const;

export const tourImages: Record<string, string> = {
  t1: travelImages.coxsBazar,
  t2: travelImages.sundarbans,
  t3: travelImages.sylhet,
  t4: travelImages.maldives,
};

export const carImages: Record<string, string> = {
  c1: travelImages.carSedan,
  c2: travelImages.carVan,
  c3: travelImages.carVan,
  c4: travelImages.carSuv,
};

/** Visa country card headers */
export const visaCountryImages: Record<string, string> = {
  SA: travelImages.makkah,
  AE: travelImages.dubai,
  MY: travelImages.malaysia,
  TH: travelImages.thailand,
  US: travelImages.usa,
  GB: travelImages.uk,
  UK: travelImages.uk,
  SG: travelImages.singapore,
  IN: travelImages.india,
  CA: travelImages.canada,
};

export function visaImageFor(code: string): string {
  return visaCountryImages[code] ?? travelImages.visa;
}
