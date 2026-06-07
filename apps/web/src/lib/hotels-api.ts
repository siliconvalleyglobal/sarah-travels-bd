import { api } from "./api";
import type { Hotel } from "./hotels-data";

export interface HotelSearchResult {
  city: string;
  nights: number;
  total: number;
  hotels: Hotel[];
}

export async function searchHotels(params: {
  city: string;
  checkIn?: string;
  checkOut?: string;
  rooms?: number;
  adults?: number;
  children?: number;
}): Promise<HotelSearchResult> {
  const qs = new URLSearchParams();
  qs.set("city", params.city);
  if (params.checkIn) qs.set("checkIn", params.checkIn);
  if (params.checkOut) qs.set("checkOut", params.checkOut);
  if (params.rooms) qs.set("rooms", String(params.rooms));
  if (params.adults) qs.set("adults", String(params.adults));
  if (params.children) qs.set("children", String(params.children));
  return api<HotelSearchResult>(`/hotels/search?${qs}`);
}

export async function getHotel(
  slug: string,
  params?: { checkIn?: string; checkOut?: string },
): Promise<Hotel> {
  const qs = new URLSearchParams();
  if (params?.checkIn) qs.set("checkIn", params.checkIn);
  if (params?.checkOut) qs.set("checkOut", params.checkOut);
  const query = qs.toString();
  return api<Hotel>(`/hotels/${slug}${query ? `?${query}` : ""}`);
}

export async function bookHotel(
  token: string,
  data: {
    hotelSlug: string;
    roomCode: string;
    checkIn: string;
    checkOut: string;
    rooms: number;
    adults: number;
    children?: number;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    specialRequest?: string;
  },
) {
  return api<{
    bookingId: string;
    bookingRef: string;
    status: string;
    totalAmount: number;
    breakdown: { roomRate: number; serviceFee: number; vatAmount: number; nights: number };
    hotel: { name: string; city: string; room: string };
  }>("/hotels/book", { method: "POST", body: JSON.stringify(data), token });
}

export async function payHotelBooking(
  token: string,
  bookingId: string,
  method: string,
) {
  return api<{
    bookingRef: string;
    confirmationCode: string;
    status: string;
    paymentId: string;
  }>(`/hotels/book/${bookingId}/pay`, {
    method: "POST",
    body: JSON.stringify({ method }),
    token,
  });
}
