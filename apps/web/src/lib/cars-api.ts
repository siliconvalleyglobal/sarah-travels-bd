import { api } from "./api";

export async function searchCars(pickup?: string) {
  const qs = pickup ? `?pickup=${encodeURIComponent(pickup)}` : "";
  return api<{ pickup: string; vehicles: Array<Record<string, unknown>> }>(`/cars/search${qs}`);
}

export async function bookCar(token: string, data: {
  vehicleSlug: string; pickupLocation: string; pickupDate: string; includeDriver: boolean;
  guestName: string; guestEmail: string; guestPhone: string;
}) {
  return api<{ bookingId: string; bookingRef: string; totalAmount: number }>("/cars/book", {
    method: "POST", body: JSON.stringify(data), token,
  });
}

export async function payCarBooking(token: string, bookingId: string, method: string) {
  return api<{ bookingRef: string; confirmationCode: string }>(`/cars/book/${bookingId}/pay`, {
    method: "POST", body: JSON.stringify({ method }), token,
  });
}
