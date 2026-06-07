/** Centralized travel marketing imagery (Unsplash) */
export const travelImages = {
  hero: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=85",
  heroStack1: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=85",
  heroStack2: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85",
  heroStack3: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=85",
  flights: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=85",
  hotels: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=85",
  visa: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&q=85",
  umrah: "https://images.unsplash.com/photo-1591604129939-f1efa4f849f1?w=900&q=85",
  tours: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=85",
  cars: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=900&q=85",
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=85",
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
  MY: "https://images.unsplash.com/photo-1596422846544-75c6fc55f404?w=800&q=85",
  TH: "https://images.unsplash.com/photo-1552465011-b21e7e7d41fc?w=800&q=85",
  US: "https://images.unsplash.com/photo-1485738422979-f5c462d49a74?w=800&q=85",
  GB: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=85",
  UK: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=85",
  SG: "https://images.unsplash.com/photo-1525627317366-79eddeb4b2b8?w=800&q=85",
  IN: "https://images.unsplash.com/photo-1524492412937-2808a5767e2d?w=800&q=85",
  CA: "https://images.unsplash.com/photo-1519832979-6fa567fce8ae?w=800&q=85",
};

export function visaImageFor(code: string): string {
  return visaCountryImages[code] ?? travelImages.visa;
}
