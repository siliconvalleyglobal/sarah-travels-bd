import { api } from "./api";

export async function bookFlight(
  token: string,
  data: {
    tripType: string;
    cabinClass?: string;
    baseFare: number;
    contactEmail: string;
    contactPhone: string;
    segments: Array<{
      airline: string;
      flightNumber: string;
      origin: string;
      destination: string;
      departureAt: string;
      arrivalAt: string;
      duration?: number;
    }>;
    passengers: Array<{
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      gender: string;
      passportNumber?: string;
    }>;
  },
) {
  return api<{
    bookingId: string;
    bookingRef: string;
    status: string;
    totalAmount: number;
    breakdown: { baseFare: number; serviceFee: number; vatAmount: number; totalAmount: number };
  }>("/flights/book", { method: "POST", body: JSON.stringify(data), token });
}

export async function payFlightBooking(token: string, bookingId: string, method: string) {
  return api<{
    bookingRef: string;
    pnr: string;
    ticketNumber: string;
    status: string;
    paymentId: string;
  }>(`/flights/book/${bookingId}/pay`, {
    method: "POST",
    body: JSON.stringify({ method }),
    token,
  });
}
