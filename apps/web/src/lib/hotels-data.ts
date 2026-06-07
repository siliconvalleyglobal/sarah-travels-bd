export type PropertyType = "hotel" | "resort" | "apartment" | "guesthouse" | "villa";
export type Amenity = "wifi" | "pool" | "breakfast" | "parking" | "gym" | "spa" | "restaurant" | "ac" | "haram_view" | "shuttle" | "room_service";

export interface HotelRoom {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  desc: string;
  beds: string;
  maxGuests: number;
  breakfast: boolean;
  freeCancellation: boolean;
  payAtHotel: boolean;
  roomsLeft?: number;
}

export interface HotelReview {
  author: string;
  country: string;
  date: string;
  score: number;
  title: string;
  comment: string;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  stars: number;
  reviewScore: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  distance: string;
  distanceKm: number;
  images: string[];
  description: string;
  propertyType: PropertyType;
  amenities: Amenity[];
  freeCancellation: boolean;
  breakfastIncluded: boolean;
  payAtHotel: boolean;
  deal?: { label: string; discount: number };
  urgency?: string;
  recommended?: boolean;
  rooms: HotelRoom[];
  reviews: HotelReview[];
  policies: { checkIn: string; checkOut: string; cancellation: string };
  location: { lat: number; lng: number; area: string };
}

export const DESTINATIONS = [
  { id: "mecca", name: "Mecca", country: "Saudi Arabia", hotels: 142, icon: "🕌" },
  { id: "medina", name: "Medina", country: "Saudi Arabia", hotels: 98, icon: "🕌" },
  { id: "dhaka", name: "Dhaka", country: "Bangladesh", hotels: 256, icon: "🏙️" },
  { id: "dubai", name: "Dubai", country: "UAE", hotels: 1840, icon: "🏗️" },
  { id: "coxs-bazar", name: "Cox's Bazar", country: "Bangladesh", hotels: 87, icon: "🏖️" },
  { id: "istanbul", name: "Istanbul", country: "Turkey", hotels: 920, icon: "🌉" },
  { id: "kuala-lumpur", name: "Kuala Lumpur", country: "Malaysia", hotels: 650, icon: "🌆" },
  { id: "bangkok", name: "Bangkok", country: "Thailand", hotels: 1100, icon: "🛕" },
];

import { travelImages } from "./travelImages";

const IMG = {
  mecca: travelImages.makkah,
  medina: travelImages.makkah,
  dubai: travelImages.dubai,
  dhaka: travelImages.dhaka,
  coxs: travelImages.coxsBazar,
  luxury: travelImages.hotels,
  room: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
  pool: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
};

export const HOTELS: Hotel[] = [
  {
    id: "h1", name: "Fairmont Makkah Clock Royal Tower", city: "Mecca", country: "Saudi Arabia",
    stars: 5, reviewScore: 9.2, reviewCount: 4821, price: 28500, originalPrice: 34000,
    distance: "50m from Masjid al-Haram", distanceKm: 0.05,
    images: [IMG.mecca, IMG.luxury, IMG.room, IMG.pool],
    description: "Iconic luxury hotel in the Abraj Al-Bait complex with direct views of the Holy Kaaba. Features 24-hour concierge, multiple dining venues, and exclusive Haram access elevators.",
    propertyType: "hotel", amenities: ["wifi", "breakfast", "restaurant", "spa", "gym", "haram_view", "shuttle", "room_service", "ac"],
    freeCancellation: true, breakfastIncluded: true, payAtHotel: false,
    deal: { label: "Sarah Deal", discount: 16 }, urgency: "Only 2 rooms left at this price",
    recommended: true,
    rooms: [
      { id: "std", name: "Deluxe Haram View Room", price: 28500, originalPrice: 34000, desc: "King bed, Kaaba view, breakfast included", beds: "1 King", maxGuests: 2, breakfast: true, freeCancellation: true, payAtHotel: false, roomsLeft: 2 },
      { id: "dlx", name: "Fairmont Gold Suite", price: 42000, desc: "Separate living area, panoramic Haram view, butler service", beds: "1 King + Sofa", maxGuests: 3, breakfast: true, freeCancellation: true, payAtHotel: false, roomsLeft: 1 },
      { id: "ste", name: "Royal Clock Tower Suite", price: 85000, desc: "Full suite with private prayer area and VIP lounge access", beds: "2 King", maxGuests: 4, breakfast: true, freeCancellation: false, payAtHotel: false },
    ],
    reviews: [
      { author: "Abdul R.", country: "Bangladesh", date: "Mar 2026", score: 9.5, title: "Unforgettable Haram view", comment: "Woke up to the Kaaba every morning. Worth every taka for Umrah pilgrims." },
      { author: "Fatima K.", country: "UK", date: "Feb 2026", score: 9.0, title: "Premium service", comment: "Staff spoke Bengali! Helped with Zamzam water and luggage to Haram." },
    ],
    policies: { checkIn: "16:00", checkOut: "12:00", cancellation: "Free cancellation until 48 hours before check-in" },
    location: { lat: 21.4225, lng: 39.8262, area: "Abraj Al-Bait, Mecca" },
  },
  {
    id: "h2", name: "Dar Al Eiman Royal Hotel", city: "Mecca", country: "Saudi Arabia",
    stars: 4, reviewScore: 8.7, reviewCount: 2103, price: 14500, originalPrice: 17500,
    distance: "150m from Masjid al-Haram", distanceKm: 0.15,
    images: [IMG.mecca, IMG.room, IMG.luxury],
    description: "Premium 4-star hotel near the Haram courtyard with excellent dining and group-friendly room configurations for Umrah pilgrims.",
    propertyType: "hotel", amenities: ["wifi", "breakfast", "restaurant", "shuttle", "ac", "room_service"],
    freeCancellation: true, breakfastIncluded: true, payAtHotel: true,
    deal: { label: "Member Price", discount: 17 },
    rooms: [
      { id: "std", name: "Standard Twin Room", price: 14500, originalPrice: 17500, desc: "2 single beds, city view", beds: "2 Single", maxGuests: 2, breakfast: true, freeCancellation: true, payAtHotel: true },
      { id: "dlx", name: "Deluxe Triple Room", price: 19800, desc: "3 beds, ideal for families", beds: "3 Single", maxGuests: 3, breakfast: true, freeCancellation: true, payAtHotel: true, roomsLeft: 4 },
    ],
    reviews: [{ author: "Rahim M.", country: "Bangladesh", date: "Jan 2026", score: 8.5, title: "Great for groups", comment: "Booked 8 rooms for our jamaat. Smooth check-in and close to Haram." }],
    policies: { checkIn: "15:00", checkOut: "12:00", cancellation: "Free cancellation until 24 hours before check-in" },
    location: { lat: 21.4210, lng: 39.8255, area: "Ajyad, Mecca" },
  },
  {
    id: "h3", name: "Madinah Hilton Hotel", city: "Medina", country: "Saudi Arabia",
    stars: 5, reviewScore: 9.0, reviewCount: 3567, price: 22000, originalPrice: 26000,
    distance: "100m from Prophet's Mosque", distanceKm: 0.1,
    images: [IMG.medina, IMG.luxury, IMG.room],
    description: "Luxury rooms at the entrance of Al-Masjid an-Nabawi. VIP service, guided ziyarat packages, and premium halal dining.",
    propertyType: "hotel", amenities: ["wifi", "breakfast", "restaurant", "spa", "gym", "shuttle", "room_service", "ac"],
    freeCancellation: true, breakfastIncluded: true, payAtHotel: false,
    deal: { label: "Flash Sale", discount: 15 }, recommended: true,
    rooms: [
      { id: "std", name: "Superior Double Room", price: 22000, originalPrice: 26000, desc: "Queen bed, partial mosque view", beds: "1 Queen", maxGuests: 2, breakfast: true, freeCancellation: true, payAtHotel: false },
      { id: "dlx", name: "Executive Mosque View", price: 35000, desc: "Direct view of Green Dome", beds: "1 King", maxGuests: 2, breakfast: true, freeCancellation: true, payAtHotel: false, roomsLeft: 3 },
    ],
    reviews: [{ author: "Sadia A.", country: "Bangladesh", date: "Feb 2026", score: 9.2, title: "Steps from the Mosque", comment: "Could hear the adhan from our room. Incredible spiritual experience." }],
    policies: { checkIn: "15:00", checkOut: "12:00", cancellation: "Free cancellation until 72 hours before check-in" },
    location: { lat: 24.4672, lng: 39.6111, area: "Central Medina" },
  },
  {
    id: "h4", name: "Al Majeedi AR Riyadh", city: "Medina", country: "Saudi Arabia",
    stars: 3, reviewScore: 7.8, reviewCount: 892, price: 8500,
    distance: "200m from Prophet's Mosque", distanceKm: 0.2,
    images: [IMG.medina, IMG.room],
    description: "Comfortable budget-friendly hotel with basic amenities, perfect for Umrah groups on a budget.",
    propertyType: "hotel", amenities: ["wifi", "breakfast", "ac", "shuttle"],
    freeCancellation: false, breakfastIncluded: true, payAtHotel: true,
    rooms: [
      { id: "std", name: "Standard Room", price: 8500, desc: "2 single beds, shared bathroom option", beds: "2 Single", maxGuests: 2, breakfast: true, freeCancellation: false, payAtHotel: true },
      { id: "quad", name: "Quad Room", price: 12000, desc: "4 beds for group pilgrims", beds: "4 Single", maxGuests: 4, breakfast: true, freeCancellation: false, payAtHotel: true, roomsLeft: 6 },
    ],
    reviews: [{ author: "Karim H.", country: "Bangladesh", date: "Dec 2025", score: 7.5, title: "Good value", comment: "Basic but clean. Walking distance to the mosque." }],
    policies: { checkIn: "14:00", checkOut: "12:00", cancellation: "Non-refundable rate" },
    location: { lat: 24.4660, lng: 39.6100, area: "Markaziyah, Medina" },
  },
  {
    id: "h5", name: "Burj Al Arab Jumeirah", city: "Dubai", country: "UAE",
    stars: 5, reviewScore: 9.6, reviewCount: 6234, price: 125000, originalPrice: 150000,
    distance: "Jumeirah Beach", distanceKm: 0.5,
    images: [IMG.dubai, IMG.luxury, IMG.pool, IMG.room],
    description: "The world's most luxurious hotel. Iconic sail-shaped architecture with butler service, private beach, and helipad.",
    propertyType: "resort", amenities: ["wifi", "pool", "spa", "gym", "restaurant", "room_service", "parking", "ac"],
    freeCancellation: true, breakfastIncluded: true, payAtHotel: false,
    deal: { label: "Luxury Deal", discount: 17 }, urgency: "High demand — book now",
    rooms: [
      { id: "std", name: "Deluxe Suite", price: 125000, originalPrice: 150000, desc: "2-level suite, sea view, personal butler", beds: "1 King", maxGuests: 2, breakfast: true, freeCancellation: true, payAtHotel: false, roomsLeft: 1 },
      { id: "ste", name: "Royal Suite", price: 280000, desc: "Full floor suite with cinema and dining room", beds: "2 King", maxGuests: 4, breakfast: true, freeCancellation: true, payAtHotel: false },
    ],
    reviews: [{ author: "Ahmed S.", country: "UAE", date: "Mar 2026", score: 9.8, title: "Once in a lifetime", comment: "The gold-plated interiors and private beach are unmatched." }],
    policies: { checkIn: "15:00", checkOut: "12:00", cancellation: "Free cancellation until 7 days before check-in" },
    location: { lat: 25.1412, lng: 55.1852, area: "Jumeirah, Dubai" },
  },
  {
    id: "h6", name: "Pan Pacific Sonargaon", city: "Dhaka", country: "Bangladesh",
    stars: 5, reviewScore: 8.9, reviewCount: 1842, price: 12500, originalPrice: 15000,
    distance: "Kawran Bazar, Central Dhaka", distanceKm: 1.2,
    images: [IMG.dhaka, IMG.luxury, IMG.pool, IMG.room],
    description: "Dhaka's premier 5-star business hotel with rooftop pool, multiple restaurants, and conference facilities.",
    propertyType: "hotel", amenities: ["wifi", "pool", "gym", "spa", "restaurant", "parking", "room_service", "ac"],
    freeCancellation: true, breakfastIncluded: false, payAtHotel: true,
    deal: { label: "Sarah Deal", discount: 17 }, recommended: true,
    rooms: [
      { id: "std", name: "Superior Room", price: 12500, originalPrice: 15000, desc: "King bed, city view", beds: "1 King", maxGuests: 2, breakfast: false, freeCancellation: true, payAtHotel: true },
      { id: "dlx", name: "Club Room", price: 18500, desc: "Club lounge access, breakfast included", beds: "1 King", maxGuests: 2, breakfast: true, freeCancellation: true, payAtHotel: true, roomsLeft: 5 },
    ],
    reviews: [{ author: "Nusrat I.", country: "Bangladesh", date: "Mar 2026", score: 9.0, title: "Best in Dhaka", comment: "Rooftop pool is amazing. Great for business meetings." }],
    policies: { checkIn: "14:00", checkOut: "12:00", cancellation: "Free cancellation until 24 hours before check-in" },
    location: { lat: 23.7508, lng: 90.3934, area: "Kawran Bazar, Dhaka" },
  },
  {
    id: "h7", name: "Hotel GEC Agrabad", city: "Dhaka", country: "Bangladesh",
    stars: 4, reviewScore: 8.2, reviewCount: 567, price: 6500,
    distance: "GEC Circle, Agrabad", distanceKm: 0.3,
    images: [IMG.dhaka, IMG.room],
    description: "Popular business hotel in the commercial hub with restaurant, meeting rooms, and airport shuttle.",
    propertyType: "hotel", amenities: ["wifi", "restaurant", "parking", "ac", "shuttle"],
    freeCancellation: true, breakfastIncluded: true, payAtHotel: true,
    rooms: [
      { id: "std", name: "Standard Double", price: 6500, desc: "Queen bed, work desk", beds: "1 Queen", maxGuests: 2, breakfast: true, freeCancellation: true, payAtHotel: true },
      { id: "dlx", name: "Executive Room", price: 9500, desc: "King bed, lounge access", beds: "1 King", maxGuests: 2, breakfast: true, freeCancellation: true, payAtHotel: true },
    ],
    reviews: [{ author: "Tanvir R.", country: "Bangladesh", date: "Feb 2026", score: 8.0, title: "Solid business hotel", comment: "Good location for meetings in Agrabad area." }],
    policies: { checkIn: "13:00", checkOut: "11:00", cancellation: "Free cancellation until 12 hours before check-in" },
    location: { lat: 22.3569, lng: 91.7832, area: "Agrabad, Chittagong" },
  },
  {
    id: "h8", name: "Sayeman Beach Resort", city: "Cox's Bazar", country: "Bangladesh",
    stars: 4, reviewScore: 8.5, reviewCount: 1234, price: 9800, originalPrice: 12000,
    distance: "Beachfront, Marine Drive", distanceKm: 0.02,
    images: [IMG.coxs, IMG.pool, IMG.room, IMG.luxury],
    description: "Beachfront resort with infinity pool overlooking the Bay of Bengal. Perfect for family vacations.",
    propertyType: "resort", amenities: ["wifi", "pool", "restaurant", "parking", "ac", "spa"],
    freeCancellation: true, breakfastIncluded: true, payAtHotel: true,
    deal: { label: "Weekend Deal", discount: 18 }, urgency: "12 people booked today",
    recommended: true,
    rooms: [
      { id: "std", name: "Ocean View Room", price: 9800, originalPrice: 12000, desc: "Balcony with sea view", beds: "1 King", maxGuests: 2, breakfast: true, freeCancellation: true, payAtHotel: true },
      { id: "fam", name: "Family Suite", price: 16500, desc: "2 bedrooms, living area, sea view", beds: "1 King + 2 Single", maxGuests: 4, breakfast: true, freeCancellation: true, payAtHotel: true, roomsLeft: 2 },
    ],
    reviews: [{ author: "Priya D.", country: "Bangladesh", date: "Mar 2026", score: 8.8, title: "Stunning beach views", comment: "Kids loved the pool. Direct beach access is a huge plus." }],
    policies: { checkIn: "14:00", checkOut: "11:00", cancellation: "Free cancellation until 48 hours before check-in" },
    location: { lat: 21.4272, lng: 92.0058, area: "Marine Drive, Cox's Bazar" },
  },
  {
    id: "h9", name: "Atlantis The Palm", city: "Dubai", country: "UAE",
    stars: 5, reviewScore: 9.1, reviewCount: 8901, price: 45000, originalPrice: 55000,
    distance: "Palm Jumeirah", distanceKm: 2.0,
    images: [IMG.dubai, IMG.pool, IMG.luxury, IMG.room],
    description: "Iconic resort on Palm Jumeirah with Aquaventure Waterpark access, underwater suites, and celebrity chef restaurants.",
    propertyType: "resort", amenities: ["wifi", "pool", "spa", "gym", "restaurant", "parking", "room_service", "ac"],
    freeCancellation: true, breakfastIncluded: false, payAtHotel: false,
    deal: { label: "Sarah Deal", discount: 18 },
    rooms: [
      { id: "std", name: "Ocean King Room", price: 45000, originalPrice: 55000, desc: "Palm view, waterpark access included", beds: "1 King", maxGuests: 2, breakfast: false, freeCancellation: true, payAtHotel: false },
      { id: "dlx", name: "Underwater Suite", price: 180000, desc: "Floor-to-ceiling aquarium views", beds: "1 King", maxGuests: 2, breakfast: true, freeCancellation: true, payAtHotel: false, roomsLeft: 1 },
    ],
    reviews: [{ author: "James L.", country: "UK", date: "Feb 2026", score: 9.3, title: "Kids paradise", comment: "Waterpark alone is worth it. Incredible family resort." }],
    policies: { checkIn: "15:00", checkOut: "12:00", cancellation: "Free cancellation until 5 days before check-in" },
    location: { lat: 25.1304, lng: 55.1177, area: "Palm Jumeirah, Dubai" },
  },
  {
    id: "h10", name: "Swissôtel Al Maqam", city: "Mecca", country: "Saudi Arabia",
    stars: 5, reviewScore: 8.8, reviewCount: 1567, price: 19500, originalPrice: 23000,
    distance: "80m from Masjid al-Haram", distanceKm: 0.08,
    images: [IMG.mecca, IMG.luxury, IMG.room],
    description: "Swiss hospitality in the heart of Mecca. Direct Haram access with premium halal dining and prayer facilities.",
    propertyType: "hotel", amenities: ["wifi", "breakfast", "restaurant", "gym", "haram_view", "shuttle", "ac", "room_service"],
    freeCancellation: true, breakfastIncluded: true, payAtHotel: false,
    deal: { label: "Early Bird", discount: 15 },
    rooms: [
      { id: "std", name: "Superior Room", price: 19500, originalPrice: 23000, desc: "Partial Haram view", beds: "2 Single", maxGuests: 2, breakfast: true, freeCancellation: true, payAtHotel: false },
      { id: "dlx", name: "Kaaba View Room", price: 32000, desc: "Direct Kaaba view, Swiss breakfast", beds: "1 King", maxGuests: 2, breakfast: true, freeCancellation: true, payAtHotel: false, roomsLeft: 3 },
    ],
    reviews: [{ author: "Imran B.", country: "Bangladesh", date: "Jan 2026", score: 8.9, title: "Swiss quality in Mecca", comment: "Impeccable cleanliness and service. Close to Haram gates." }],
    policies: { checkIn: "16:00", checkOut: "12:00", cancellation: "Free cancellation until 48 hours before check-in" },
    location: { lat: 21.4220, lng: 39.8260, area: "Abraj Al-Bait, Mecca" },
  },
];

export function getHotelById(id: string): Hotel | undefined {
  return HOTELS.find(h => h.id === id);
}

export function getHotelsByCity(city: string): Hotel[] {
  const normalized = city.toLowerCase().replace(/['\s-]/g, "");
  return HOTELS.filter(h => {
    const hotelCity = h.city.toLowerCase().replace(/['\s-]/g, "");
    return hotelCity.includes(normalized) || normalized.includes(hotelCity);
  });
}

export function getReviewLabel(score: number): string {
  if (score >= 9) return "Exceptional";
  if (score >= 8) return "Excellent";
  if (score >= 7) return "Very Good";
  if (score >= 6) return "Good";
  return "Pleasant";
}

export function getReviewColor(score: number): string {
  if (score >= 8) return "bg-emerald-600";
  if (score >= 7) return "bg-lime-600";
  if (score >= 6) return "bg-yellow-500";
  return "bg-orange-500";
}

export const AMENITY_LABELS: Record<Amenity, string> = {
  wifi: "Free WiFi",
  pool: "Swimming Pool",
  breakfast: "Breakfast",
  parking: "Free Parking",
  gym: "Fitness Center",
  spa: "Spa & Wellness",
  restaurant: "Restaurant",
  ac: "Air Conditioning",
  haram_view: "Haram/Mosque View",
  shuttle: "Airport Shuttle",
  room_service: "24h Room Service",
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  hotel: "Hotel",
  resort: "Resort",
  apartment: "Apartment",
  guesthouse: "Guesthouse",
  villa: "Villa",
};
