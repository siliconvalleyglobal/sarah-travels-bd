import { api } from "./api";

export async function searchTours(destination?: string) {
  const qs = destination ? `?destination=${encodeURIComponent(destination)}` : "";
  return api<{ total: number; tours: Array<Record<string, unknown>> }>(`/tours/search${qs}`);
}

export async function getTour(slug: string) {
  return api<Record<string, unknown>>(`/tours/${slug}`);
}

export async function bookTour(token: string, data: {
  tourSlug: string; guests: number; travelDate: string;
  guestName: string; guestEmail: string; guestPhone: string;
}) {
  return api<{ bookingId: string; bookingRef: string; totalAmount: number }>("/tours/book", {
    method: "POST", body: JSON.stringify(data), token,
  });
}

export async function payTourBooking(token: string, bookingId: string, method: string) {
  return api<{ bookingRef: string; confirmationCode: string }>(`/tours/book/${bookingId}/pay`, {
    method: "POST", body: JSON.stringify({ method }), token,
  });
}
